---
title: "雪花正倒飞回上一个冬天（crack-a-litter-smile）新手向分析与拆解"
published: 2026-11-02
description: "容器题 crack-a-litter-smile 的新手向拆解：先建技能地图，再看实测"
tags:
  - "CTF"
  - "复盘"
  - "容器"
category: "WP"
slug: "knowledge-base/review/26-qw-cap/crack-a-litter-smile"
draft: false
---

# 雪花正倒飞回上一个冬天（crack-a-litter-smile）新手向分析与拆解

> 只针对题目提供的这一个容器做授权范围内的分析与教学，不攻击其他目标。
> 本文**不追求解出 flag**，重点是把题目的结构、知识点和难点讲清楚。
> 标记约定：✅ = 我们在容器上实际验证过；🔶 = 根据行为/公开资料推断，未拿到源码确认。
>
> **阅读建议**：完全新手先读第 3、4、6 节（基础 + 技能地图）；第 5 节是本题实测，可以最后看；第 8 节是“这题值不值得学”的评价。
> 本文没有使用破坏性测试，也没有解出 flag；所有结论都以“能复现的行为”为准。

---

## 0. 先给结论

| 问题 | 结论 |
|---|---|
| 这题的本质 | Web + **PHP 反序列化（PHP Object Injection）**，核心是找/构造 POP gadget |
| 外表 | Drupal 11.4.11 + PHP 8.3 的“远航星频率观测终端” |
| 真正入口 | `POST /api/presets/import`：base64 → `unserialize()` |
| 主要障碍 | ① 自定义类字段校验 ② 命名空间黑名单（Doctrine/GuzzleHttp/Symfony）③ Drupal 核心已打补丁 ④ 没给源码 |
| 对完全新手 | **偏难，不建议作为第一道反序列化题** |
| 学习价值 | **高**，但要“拆知识点学”，不要以“独立解出”为目标 |
| 我们解出来了吗 | 没有。下面把“已验证事实”和“合理推测”分开写 |

一句话评价：

> 这是一道**包装很漂亮、考点很硬核**的题。它适合已经会 PHP 基础、学过 `serialize()/unserialize()`、想练 POP chain 和“黑名单绕过”的同学；对完全没接触过反序列化的人来说，信息量和跨度都太大。

---

## 1. 题目长什么样（信息收集不必过深）

### 1.1 打开首页能看到什么

- 目标容器：`https://eci-2ze5dhdgkxi1t28bfvdj.cloudeci1.ichunqiu.com:80`（临时环境，可能失效）
- 页面标题：`远航星 · 频率观测终端`
- 主题：鸣潮（Wuthering Waves）同人风格，角色“爱弥斯”
- 功能：
  1. 填写“观测代号 / 观测日志 / 接收频段 / 存在状态”
  2. 点击“生成频录码”
  3. 把频录码粘贴到另一个表单，点击“恢复档案”
  4. 页面底部还有一首《远航星的告别》音频

### 1.2 响应头里的指纹 ✅

```http
HTTP/2 200
content-type: text/html; charset=utf-8
x-powered-by: PHP/8.3.36
x-generator: Drupal 11 (https://www.drupal.org)
```

再配合页脚：

```text
运行环境：Drupal 11.4.11 · PHP 8.3
```

可以确认：**这是一个 Drupal 11.4.11 站点**。

> 我们还把站点的 `/core/composer.json` 和 Drupal 官方 11.4.11 的 `composer.json` 做了哈希对比，完全一致 ✅。所以页脚不是假的，核心版本确实是 11.4.11。

### 1.3 前端 JS 暴露了 API ✅

页面加载 `/static/js/resonance.js`，里面有两个关键请求：

```js
// 生成频录码
fetch("/api/presets/export", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ codename, fieldNote, band, signalProfile })
});

// 恢复档案
fetch("/api/presets/import", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code })
});
```

也就是说，这是一个“自定义 Drupal 模块 + 两个 API”的结构。

### 1.4 几个值得记录的“小发现” ✅

| 现象 | 说明 |
|---|---|
| 直接访问 `/sites/default/settings.php` 会打印 PHP Warning | 泄露了站点根目录 `/opt/drupal/web` |
| `.module`、`.inc`、`.yml`、`.txt` 被当成静态文件下载 | 例如 `/core/modules/system/system.info.yml` 返回源码；`.php` 会执行，`.inc/.module` 会原样返回 |
| `/api/presets/任意单词` 返回 405/not_found | 路由是一个“预设操作”的 catch-all，只有 `export/import` 真正可用 |
| `/core/CHANGELOG.txt` 是通用说明 | Drupal 11 的 CHANGELOG 已简化，不能直接从它读版本号 |

这些不是解题主线，但对“真实站点侦察”很有教育意义：**响应头、静态文件、错误信息、前端 JS 都是信息源**。

### 1.5 音频和图片是什么

- 音频是正常的 OGG/Vorbis（4.3 MB），尾部没有发现拼接的额外文件 ✅
- 图片是官方立绘素材
- 页面明确写了曲目来源和素材来源

**它们主要是主题包装，不建议新手一上来就扎进音频隐写。** 当然，如果后面确认 Web 路线走不通，再回头做频谱/隐写也不迟；但就目前证据看，核心考点在 API。

---

## 2. 第一个关键发现：频录码就是 base64(PHP serialize)

### 2.1 自己生成一次频录码 ✅

请求：

```http
POST /api/presets/export
Content-Type: application/json

{"codename":"test01","fieldNote":"hello world","band":"band-01","signalProfile":"clean"}
```

响应：

```json
{
  "ok": true,
  "code": "TzoyMjoiUmVzb25hbmNlQXJjaGl2ZVByZXNldCI6NTp7czoxMzoiZm9ybWF0VmVyc2lvbiI7czoxOToicmVzb25hbmNlLWFyY2hpdmUvMSI7czo4OiJjb2RlbmFtZSI7czo2OiJ0ZXN0MDEiO3M6OToiZmllbGROb3RlIjtzOjExOiJoZWxsbyB3b3JsZCI7czo0OiJiYW5kIjtzOjc6ImJhbmQtMDEiO3M6MTM6InNpZ25hbFByb2ZpbGUiO3M6NToiY2xlYW4iO30=",
  "preset": {
    "codename": "test01",
    "fieldNote": "hello world",
    "band": "band-01",
    "signalProfile": "clean"
  }
}
```

把 `code` 做一次 base64 解码：

```bash
echo 'TzoyMjoi...' | base64 -d
```

得到：

```text
O:22:"ResonanceArchivePreset":5:{s:13:"formatVersion";s:19:"resonance-archive/1";s:8:"codename";s:6:"test01";s:9:"fieldNote";s:11:"hello world";s:4:"band";s:7:"band-01";s:13:"signalProfile";s:5:"clean";}
```

这就是 **PHP 的 `serialize()` 输出格式**。

### 2.2 逐段读懂它

```text
O:22:"ResonanceArchivePreset":5:{ ... }
│  │   │                      │
│  │   │                      └─ 这个对象有 5 个属性
│  │   └─ 类名长度 22
│  └─ O 表示 object（对象）
└─ 序列化格式标记

s:13:"formatVersion"; s:19:"resonance-archive/1";
│  │   │                │  │   └─ 字符串值
│  │   │                │  └─ 值的长度 19
│  │   │                └─ 属性名
│  │   └─ 属性名长度 13
│  └─ s 表示 string
```

于是可以翻译成“人话”：

```php
class ResonanceArchivePreset {
    public $formatVersion  = "resonance-archive/1";
    public $codename       = "test01";
    public $fieldNote      = "hello world";
    public $band           = "band-01";
    public $signalProfile  = "clean";
}
```

### 2.3 这说明 import 在做什么

`/api/presets/import` 收到 `code` 后，大概率做了：

```php
$raw = base64_decode($code);
$obj = unserialize($raw);
```

**`unserialize()` 的输入完全来自用户**，这就是经典的 **PHP 对象注入**入口。

> 注意：这里不是“base64 编码的问题”，base64 只是把二进制/文本塞进 JSON 的搬运工。真正危险的是 `unserialize()`。

---

## 3. PHP 序列化/反序列化入门（完全新手向）

### 3.1 用“存档/读档”理解

- `serialize($obj)`：把一个 PHP 对象“存档”成字符串
- `unserialize($str)`：把字符串“读档”回对象

游戏存档本身没问题；问题在于：**如果存档文件可以被玩家随意修改，读档时游戏会无条件相信里面的内容**。

PHP 也一样：

```php
$obj = unserialize($_POST['data']); // 危险：$_POST['data'] 是用户可以改的
```

### 3.2 序列化格式速查表

| 标记 | 含义 | 例子 |
|---|---|---|
| `s` | 字符串 | `s:5:"hello";` |
| `i` | 整数 | `i:123;` |
| `d` | 浮点数 | `d:1.5;` |
| `b` | 布尔 | `b:1;` / `b:0;` |
| `N` | null | `N;` |
| `a` | 数组 | `a:2:{i:0;s:1:"a";i:1;s:1:"b";}` |
| `O` | 对象 | `O:4:"User":1:{s:4:"name";s:3:"tom";}` |
| `R` | 引用 | `R:1;` |
| `r` | 对象引用 | `r:1;` |
| `S` | 转义字符串（PHP 8.3 已废弃） | `S:4:"\74est";` 解码为 `test` |

> 新手最容易卡住的地方：**长度必须精确**。`s:5:"hello";` 里的 5 是字节数，不是字符数；中文按 UTF-8 通常一个字 3 字节。

### 3.3 反序列化会触发哪些“魔法方法”

PHP 里以 `__` 开头的方法叫 **magic method（魔术方法）**，它们会在特定时机**自动执行**，不需要你显式调用。

| 魔术方法 | 触发时机 | 和反序列化的关系 |
|---|---|---|
| `__construct()` | `new` 时 | **`unserialize()` 不会调用它** |
| `__destruct()` | 对象销毁/脚本结束时 | 反序列化对象最终也会被销毁 → 可能触发 |
| `__wakeup()` | `unserialize()` 还原对象后 | 直接触发 |
| `__unserialize()` | PHP 7.4+，自定义反序列化 | 直接触发 |
| `__sleep()` | `serialize()` 时 | 控制哪些属性被序列化 |
| `__serialize()` | PHP 7.4+，自定义序列化 | 控制输出 |
| `__toString()` | 对象被当字符串用时 | 常被其他 gadget 间接触发 |
| `__call()` | 调用不存在的方法时 | 可把“调用”转发到别处 |
| `__get()` | 读取不存在/不可见属性时 | 可把“读属性”转发到别处 |
| `__invoke()` | 对象被当函数调用时 | 可把“调用对象”转发到别处 |

### 3.4 一个最小危险例子

```php
class Ping {
    public $cmd;

    public function __destruct() {
        system($this->cmd);
    }
}

// 正常代码里你可能会 new Ping()，但攻击者不需要 new
$payload = 'O:4:"Ping":1:{s:3:"cmd";s:2:"id";}';
unserialize($payload);
```

执行过程：

1. `unserialize()` 创建 `Ping` 对象
2. 把 `cmd` 属性设成 `"id"`
3. 脚本结束时对象销毁 → `__destruct()` 自动执行
4. `system("id")` 执行

**漏洞成立的条件**：

- 有 `unserialize()` 且输入可控
- 加载的类里存在“魔术方法 → 危险操作”的调用路径

只有第一个条件，叫“反序列化入口”；两个条件都有，才可能 RCE。

---

## 4. 什么是 POP chain（面向对象利用链）

### 4.1 三个角色

| 角色 | 含义 |
|---|---|
| Entry（入口） | `unserialize()` 后自动触发的魔术方法，比如 `__destruct` |
| Gadget（跳板） | 一个类的方法，它会调用另一个对象的方法/属性 |
| Sink（终点） | 真正危险的操作，比如 `system()`、`call_user_func()`、`file_put_contents()`、SQL 执行 |

POP chain 就是：**Entry → Gadget → Gadget → … → Sink**。

它和 Pwn 里的 ROP 很像：你不是直接写 shellcode，而是把现有代码里的“小片段”串起来。

### 4.2 一个玩具链

```php
class Mail {
    public $transport;
    public function __destruct() {
        $this->transport->send();   // ① 调 send()
    }
}

class Sendmail {
    public $callable;
    public $to;
    public function send() {
        call_user_func($this->callable, $this->to); // ② 调任意函数
    }
}

$payload = 'O:4:"Mail":1:{s:9:"transport";O:8:"Sendmail":2:{s:8:"callable";s:6:"system";s:2:"to";s:2:"id";}}';
unserialize($payload);
```

链路：

```text
Mail::__destruct()
  └─ Sendmail::send()
       └─ call_user_func("system", "id")
            └─ 执行 id
```

真实题目里，这条链通常藏在 CMS/框架/第三方库里，需要读源码或借助工具找。

### 4.3 PHPGGC 是什么

[PHPGGC](https://github.com/ambionics/phpggc) 是一个“PHP 反序列化利用链生成器”，内置了 Laravel、Symfony、Guzzle、Monolog、Doctrine、Drupal 等大量常见链。

用法示意：

```bash
phpggc -l                     # 列出所有链
phpggc Guzzle/FW1 system id   # 生成 Guzzle 的链
```

**但它不是万能钥匙**：

- 链依赖具体版本
- 目标可能禁用某些类
- 目标可能根本没用这些库
- 目标可能打了补丁

本题就是典型：常见链被黑名单挡住，Drupal 核心又已经打了补丁。

### 4.4 一个真实案例：Drupal 的 AT1/AT2

2026 年公开过一个 Drupal 反序列化链（`ViewExecutable` → `Sql` → `Select`），大致思路是：

```text
Drupal\views\ViewExecutable::__wakeup()
  └─ execute()
       └─ $this->query->execute($this)
            └─ Sql::execute()
                 └─ $query->execute()  // 可控对象 → 走到数据库查询
```

Drupal 安全公告 **SA-CORE-2026-002 / CVE-2026-6366** 修掉了这条链，受影响版本是：

```text
>= 8.0.0 < 10.5.9
>= 10.6.0 < 10.6.7
>= 11.0.0 < 11.2.11
>= 11.3.0 < 11.3.7
```

本题是 **11.4.11**，按官方版本已经包含修复 ✅。所以“直接拿 PHPGGC 的 Drupal 链打”大概率是死的。

> 严格说：我们只核对了官方 `composer.json` 一致，没有拿到站点源码；如果出题人手动回退了某个补丁文件，理论上仍可能可打。这个可能性无法在没有源码的情况下 100% 排除。🔶

> 这就是本题的第一个“坑”：你会在网上搜到大量 Drupal 反序列化链，但它们的版本对不上。

---

## 5. 这道题实际的防护与我们的实测

### 5.1 推断的 import 流程 🔶

根据大量请求的行为，import 大概是这样：

```php
$code = trim($input['code'] ?? '');

if ($code === '' || strlen($code) > 某个上限) {
    return error('invalid_code');
}

$raw = base64_decode($code, true);
if ($raw === false) {
    return error('damaged_code');
}

// 命名空间黑名单（关键）
// 我们实际观察到 Doctrine / GuzzleHttp / Symfony 会被拦；
// 下面的 Guzzle\\ 来自同类题目的公开写法，本题是否也有它未单独验证。
foreach (['Doctrine\\', 'Guzzle\\', 'GuzzleHttp\\', 'Symfony\\'] as $ns) {
    if (stripos($raw, $ns) !== false) {
        return error('unsupported_provider', $ns);
    }
}

$obj = @unserialize($raw);

if (!is_object($obj)) {
    return error('unreadable_preset');
}

if (get_class($obj) !== 'ResonanceArchivePreset') {
    return error('unsupported_preset_type', get_class($obj));
}

// 字段校验
if (缺少字段) return error('incomplete_preset');
if (formatVersion !== 'resonance-archive/1') return error('unsupported_version');
if (band 不在白名单) return error('invalid_preset');
if (signalProfile 不在白名单) return error('invalid_preset');

return ['ok' => true, 'preset' => [...]];
```

注意：这是**行为反推**，不是源码。真实代码可能略有差异，但错误分类和顺序基本能对上。

### 5.2 错误信息就是“探针”

这道题的错误信息非常规整，对新手很友好：

| 错误码 | 触发条件 | 说明 |
|---|---|---|
| `invalid_code` | 空/超长 | 输入长度限制 |
| `damaged_code` | base64 解不开 | 不是合法 base64 |
| `unreadable_preset` | 反序列化失败/类型不对/属性异常 | PHP 的“读档失败” |
| `unsupported_preset_type` | 顶层对象不是 `ResonanceArchivePreset` | 会告诉你实际类名 |
| `unsupported_provider` | payload 里出现被禁命名空间 | 会告诉你触发了哪个 provider |
| `incomplete_preset` | 5 个字段缺一个 | 字段校验 |
| `unsupported_version` | `formatVersion` 不对 | 版本校验 |
| `invalid_preset` | band/profile 不在白名单 | 值校验 |

**新手应该学会的第一件事**：不要盲目爆破，先利用错误信息做“差分测试”。

### 5.3 命名空间黑名单：它是怎么工作的？

我们做了几组实验：

#### 实验 A：把 `GuzzleHttp` 放进一个普通字符串值

```php
O:8:"stdClass":1:{s:1:"x";s:24:"GuzzleHttp\Psr7\FnStream";}
```

响应：

```json
{"ok":false,"error":"unsupported_provider","provider":"GuzzleHttp"}
```

说明：**过滤器扫描的是原始序列化字符串**，不是只检查对象类型。哪怕 `GuzzleHttp` 只是某个字符串属性的内容，也会被拦。✅

#### 实验 B：大小写变化

```text
Symfony\Component\HttpFoundation\Request
symfony\component\httpfoundation\request
SYMFONY\COMPONENT\HTTPFOUNDATION\REQUEST
```

全部被拦 ✅ → 过滤器大概率用的是 `stripos()`（不区分大小写）。

#### 实验 C：`S:` 转义字符串

PHP 的 `S:` 格式允许把字符写成 `\xx` 十六进制：

```text
S:4:"\74est";   // 解码后是 test
```

我们把 `fieldNote` 用 `S:` 写成：

```text
S:4:"\74est";
```

导入成功，返回的 `fieldNote` 是 `test` ✅。

也就是说：**`S:` 转义可以绕过对“原始 payload”的字符串扫描**。

但是——**对象类名在 `O:` 头部是普通字符串，不能用 `S:` 转义**。所以你不能直接把 `O:...:"Symfony\..."` 的类名藏起来。🔶

这是一个很好的教学点：

> 黑名单只检查原始字符串，遇到“编码/转义”就容易失效；但具体能不能利用，还要看你能不能把被禁的类名放进去。

#### 实验 D：嵌套对象

```php
O:8:"stdClass":1:{s:1:"x";O:24:"GuzzleHttp\Psr7\FnStream":0:{}}
```

也会被拦 ✅ —— 因为原始 payload 里仍然有 `GuzzleHttp` 字样。

### 5.4 类存在性探测

利用 `unsupported_preset_type` 的报错，可以判断某个类是否真的被自动加载了：

| 发送的类名 | 返回 | 结论 |
|---|---|---|
| `Twig\Environment` | `unsupported_preset_type`，显示类名 | 类存在 ✅ |
| `Masterminds\HTML5` | 显示类名 | 存在 ✅ |
| `Archive_Tar` | 显示类名 | 存在 ✅（pear/archive_tar） |
| `Composer\Semver\Semver` | 显示类名 | 存在 ✅ |
| `PhpParser\Node\Scalar\String_` | 显示类名 | 存在 ✅ |
| `Drupal\Component\Uuid\Php` | 显示类名 | 存在 ✅ |
| `Monolog\Logger` | 显示 `__PHP_Incomplete_Class` | 没安装 ❌ |
| `Laminas\Stdlib\ArrayObject` | 显示 `__PHP_Incomplete_Class` | 没安装 ❌ |
| `Tuf\Metadata\Metadata` | 显示 `__PHP_Incomplete_Class` | 没安装 ❌ |

这其实是一个**类加载/自动加载**的小实验：能加载的类会显示真实类名；加载不了的会变成 `__PHP_Incomplete_Class`。

### 5.5 自定义类 `ResonanceArchivePreset` 的行为

我们只能确认这些：

- 类名是全局命名空间（没有 `Drupal\...` 前缀）
- 正好 5 个属性：`formatVersion`、`codename`、`fieldNote`、`band`、`signalProfile`
- 5 个字段缺一不可，且类型/白名单校验很严
- 多塞属性、把属性塞成对象/数组 → `unreadable_preset`
- 用合法字段试过命令、文件路径、SQL 时间盲注、模板字符串等，**没有观察到明显副作用** ✅
- 导入后没有发现可访问的持久化文件/页面回显 ✅

这意味着：

> 它至少不是一个“把 `fieldNote` 直接丢给 `system()`”的粗心类。  
> 但**不能排除**它有更隐蔽的 `__wakeup` / `__destruct` / `__call` 逻辑，或者需要特定属性组合才触发。

在没有源码的情况下，继续盲猜属性名/方法名的收益很低。

### 5.6 常见的几条死路（我们试过/核对过）

| 路线 | 结果 |
|---|---|
| Guzzle / Symfony / Doctrine 的 PHPGGC 链 | 被 `unsupported_provider` 拦 ✅ |
| Drupal AT1/AT2 链 | 11.4.11 已修复 ✅ |
| PHPGGC 里的 Drupal 旧链（RCE/SQLI/SSRF/XXE/FD） | 版本都低于 11.4.11，已修复 ✅ |
| Monolog / Laminas 链 | 这些库没装 ✅ |
| `fieldNote` 里塞 `sleep 3` / 命令 | 没有延时，未触发命令执行 ✅ |
| `codename` 里塞 SQL 时间盲注 | 没有延时 ✅ |
| 往 `sites/default/files` 写 webshell 后访问 | 没有生成文件 ✅ |
| 音频尾部拼接 | 没发现额外数据 ✅ |

所以本题的“正统解法”只剩下：

1. 找到自定义模块/类的源码（或行为），利用它的 magic method；或
2. 找到一条**不出现被禁命名空间**、且能在 Drupal 11.4.11 上工作的新链；或
3. 找到过滤器/校验逻辑本身的绕过。

这三条都不简单。

---

## 6. 新手最需要补的知识与技能（重点）

> 这一节是写给“完全不懂反序列化”的同学的。你可以把它当成一张学习地图。

### 6.1 前置知识（不会这些会非常痛苦）

| 知识 | 你需要会到什么程度 | 为什么本题需要 |
|---|---|---|
| HTTP 基础 | 会看请求行/响应头/状态码；会用 `curl -i` | 找 API、看 Drupal 指纹、发 JSON |
| JSON | 会读写嵌套对象 | API 的请求/响应都是 JSON |
| base64 | 知道它是编码不是加密；会 `base64 -d` | 频录码就是 base64 |
| PHP 语法 | 变量、数组、类、属性、方法、命名空间 | 读 payload、读源码 |
| PHP 面向对象 | `class`、`public/private/protected`、继承、接口 | 理解 gadget |
| Composer / autoload | 知道 `vendor/autoload.php` 和 PSR-4 | 理解“为什么类能被加载” |
| Linux 命令行 | `curl`、`grep`、`python3`、管道 | 侦察和写脚本 |

如果你还没写过 PHP 类，建议先花 1–2 小时补：

```php
<?php
class User {
    public $name;
    private $age;

    public function __construct($name) {
        $this->name = $name;
    }

    public function hello() {
        return "hello " . $this->name;
    }
}

$u = new User("tom");
echo $u->hello();
```

### 6.2 核心知识（本题的“主菜”）

#### ① 序列化格式

必须能**手写/手改**下面这些：

```text
s:5:"hello";
i:42;
b:1;
a:2:{i:0;s:1:"a";i:1;s:1:"b";}
O:4:"User":1:{s:4:"name";s:3:"tom";}
```

练习：

- 把 `{"name":"tom","age":18}` 手写成 PHP 序列化字符串
- 把题目返回的频录码解码后，逐段标注每个字段

#### ② 魔术方法

必须知道：

- `unserialize()` 不会调用 `__construct()`
- 会调用 `__wakeup()` / `__unserialize()`
- 对象销毁时会调用 `__destruct()`
- `__toString()`、`__call()`、`__get()`、`__invoke()` 常被其他 gadget 间接触发

#### ③ POP chain

必须能回答：

- 什么是 entry / gadget / sink？
- 为什么“有 `unserialize()`”不等于“能 RCE”？
- 为什么需要“链”而不是单个类？

#### ④ PHPGGC 与版本

必须知道：

- PHPGGC 是“已知链的集合”，不是“万能 getshell”
- 链依赖版本；目标版本一变，链可能就废了
- 要看目标实际装了哪些库（`composer.json` / `composer.lock` / 报错）

#### ⑤ Drupal 的基本结构

不需要成为 Drupal 专家，但要知道：

- `core/`：核心
- `modules/`：模块（`custom/` 是自定义模块）
- `themes/`：主题
- `sites/default/settings.php`：站点配置
- `vendor/`：Composer 依赖
- 路由一般写在 `*.routing.yml`，控制器在 `src/Controller/`
- 类通常带 `Drupal\模块名\...` 命名空间

本题的自定义类**没有命名空间**，这本身就是一个值得注意的异常点。

#### ⑥ 错误驱动侦察

本题的错误码非常细。新手要养成习惯：

- 改一个变量，观察错误是否变化
- 记录“请求 → 响应 → 推断”
- 不要一次改十个地方

#### ⑦ 读源码 / 调试

如果拿到源码（或本地复现环境）：

- 用 `grep -rn "__destruct\|__wakeup\|__call\|__toString"` 找魔术方法
- 用 `grep -rn "system\|exec\|call_user_func\|file_put_contents\|unserialize"` 找 sink
- 用 Xdebug 单步跟 `unserialize()` 的调用链

#### ⑧ 写脚本

本题的 payload 手工拼很容易错长度。建议用 Python 生成：

```python
def s(v: str) -> str:
    b = v.encode()
    return f's:{len(b)}:"{v}";'

def preset(codename, field_note, band="band-01", profile="clean"):
    props = {
        "formatVersion": "resonance-archive/1",
        "codename": codename,
        "fieldNote": field_note,
        "band": band,
        "signalProfile": profile,
    }
    body = "".join(s(k) + s(v) for k, v in props.items())
    return f'O:22:"ResonanceArchivePreset":{len(props)}:{{{body}}}'
```

### 6.3 技能清单（自测）

| 技能 | 达标标准 | 练法 |
|---|---|---|
| 解码频录码 | 能不看本文，独立把 base64 解成 `O:...` 并解释每个字段 | 用题目 export 接口 |
| 手写序列化 | 能写出一个 2 属性对象的序列化字符串，长度不写错 | 本地 PHP / Python |
| 解释魔术方法 | 能说清 `__wakeup`、`__destruct`、`__toString` 的触发时机 | 写 3 个小 demo |
| 画 POP 链 | 能画出一个 3 层玩具链 | 自己写 `Mail → Sendmail → system` |
| 用 PHPGGC | 能在本地生成一条链并解释它为什么能打 | 本地 Docker + 旧版 Drupal |
| 版本意识 | 看到链先查版本范围，不直接打 | 读 SA/CVE |
| 错误驱动 | 能根据错误码缩小范围 | 本题的错误表 |
| 读 Drupal 源码 | 能找到 `__wakeup` 和 sink | GitHub 读 core |

### 6.4 新手常见误区

1. **“有 `unserialize()` 就能 RCE”**
   - 错。需要 gadget，需要类被加载，需要链能走通。

2. **“直接跑 PHPGGC 就行”**
   - 错。版本、依赖、黑名单、补丁都会让链失效。

3. **“Drupal 就是 Drupalgeddon”**
   - 本题不是 `CVE-2018-7600`，也不是后台弱口令；入口是自定义 API。

4. **“音频里有 flag”**
   - 可能，但当前证据更像主题包装。不要一上来就花几小时做频谱。

5. **“爆破 admin 密码”**
   - 不是本题考点，而且容易把时间浪费在无关方向。

6. **“改一个字符就发一次，不做记录”**
   - 反序列化的长度、类型、顺序都很敏感；一定要记录 payload 和响应。

7. **“在别人的站上试”**
   - 只在题目给的容器里做；不要扫描/攻击其他目标。

### 6.5 推荐练习顺序

1. **本地 PHP 小实验**：写一个带 `__destruct()` 的类，自己 `serialize()` / `unserialize()`，看命令是否执行。
2. **本题的 payload 练习**：用 Python 生成合法 preset，导入成功；再改错长度，观察 `damaged_code` / `unreadable_preset`。
3. **类存在性探测**：写脚本批量发 `O:len:"Class":0:{}`，根据报错区分“存在/不存在/被禁”。
4. **读 PHPGGC 的 Guzzle/FW1**：理解一条真实链的每一跳。
5. **本地复现 Drupal AT 链**：用旧版 Drupal（例如 11.0.7）在 Docker 里复现，理解 `ViewExecutable → Sql → Select`；注意**不要**拿它打 11.4.11。
6. **读 Drupal 11.4.11 源码**：找 `__wakeup`/`__destruct`，看 SA 修了什么。
7. **回到本题**：在没有源码的情况下，尝试用错误信息/行为推断自定义类。

---

## 7. 如果继续做，一条合理的路线

> 下面是“研究路线”，不是保证能解出的 exploit。请只在授权容器里做。

### 第一步：把接口行为摸清楚

- 确认 `export` 生成的字段顺序和序列化格式
- 确认 `import` 的错误码和校验顺序
- 记录哪些类能加载、哪些被禁

### 第二步：找自定义模块的源码

这是本题最关键的一步。可以尝试：

1. 从页面/JS/CSS 的路径猜模块名（`resonance`、`archive`、`preset` 等）
2. 利用站点把 `.module` / `.inc` / `.yml` 当静态文件返回的配置，访问：
   ```text
   /modules/custom/<名字>/<名字>.module
   /modules/custom/<名字>/<名字>.routing.yml
   /modules/custom/<名字>/src/...
   ```
3. 注意：`.php` 会执行而不是显示源码；`.module` / `.inc` 才会原样返回
4. 如果模块名是随机/不可猜的，这条路线会很困难

> 我们试了约 1200 个常见名字，没有命中。说明模块名可能不直观，或者代码不在 Web 根目录下。

### 第三步：如果没有源码，做黑盒实验

- 用合法 5 字段 + 额外属性，观察 `unreadable_preset`
- 用 `S:` 转义、引用、大小写、嵌套对象做差分
- 记录所有“错误码变化”，不要只看 `ok:true/false`

### 第四步：核对 Drupal 11.4.11 的修复

- 读 SA-CORE-2026-002
- 对比 `ViewExecutable.php`、`Sql.php` 的修复 commit
- 确认哪些链已死，避免浪费时间

### 第五步：寻找“不出现被禁命名空间”的链

- 从已加载的类出发（Drupal core、Twig、Masterminds、Archive_Tar、Composer、PhpParser 等）
- 找 `__destruct` / `__wakeup` / `__toString`
- 看它们是否会在内部 `new` 一个被禁的类（payload 里不出现名字，过滤器就看不到）
- 或者找“二级反序列化”：某个类的魔术方法对字符串再次 `unserialize()`

### 第六步：验证你的假设

- 每一步只改一个变量
- 用无副作用的方式验证（例如先验证类是否加载、方法是否被调用）
- 不要用 `rm`、`shutdown`、大量并发等破坏性测试

---

## 8. 这题好不好？值不值得新手钻研？

### 8.1 优点

| 优点 | 说明 |
|---|---|
| 包装完整 | 主题、文案、UI、音频、素材来源都做得很认真 |
| 入口清晰 | 前端 JS 直接暴露两个 API，不用猜 |
| 错误信息友好 | 错误码细分，适合教学和差分测试 |
| 考点真实 | PHP 反序列化、POP chain、命名空间黑名单都是真实世界问题 |
| 有“反套路” | 直接跑 PHPGGC 会被版本和黑名单挡住，能教人不要迷信工具 |
| 有公开背景 | Drupal AT 链、SA-CORE-2026-002 都可以查，适合扩展阅读 |

### 8.2 缺点（对新手而言）

| 缺点 | 说明 |
|---|---|
| 跨度太大 | 需要 PHP 对象、序列化、Drupal、Composer、调试、脚本，一起上 |
| 没有源码 | 自定义类的行为只能黑盒猜，学习成本高 |
| 核心已打补丁 | 网上大量 Drupal 链失效，容易让人怀疑人生 |
| 黑名单很强 | 常见 provider 全被禁，剩下的是“非标准链” |
| 容易跑偏 | 音频/主题/素材会诱导人去做隐写 |
| 成功反馈弱 | 即使构造了 payload，也不一定有明显回显，需要盲测 |

### 8.3 难度与适合人群

| 维度 | 评价 |
|---|---|
| 难度 | ★★★★☆（Web 中偏难） |
| 新手友好度 | ★★☆☆☆ |
| 学习价值 | ★★★★☆（有指导时） |
| 独立解出难度 | 高；需要源码或很强的黑盒能力 |
| 推荐人群 | 学过 PHP 基础、做过 1–2 道反序列化题、想练 POP/黑名单绕过的人 |

### 8.4 最终建议

**值得学，但不值得“硬啃”。**

- 如果你是**完全新手**：不要把它当第一道题。先把本文第 6 节的知识点补完，做本地小实验；把它当成“读源码/看 writeup 学习”的素材。
- 如果你**已经会基础反序列化**：这题很适合练“版本核对、黑名单、错误驱动、Drupal 结构”，但要做好“可能卡很久”的心理准备。
- 如果你**想解出 flag**：优先找自定义模块源码/行为，而不是继续在 PHPGGC 里翻旧链。
- 如果这是**教学场景**：建议老师提供源码或至少提供模块名；否则新手很难建立“从入口到 sink”的完整闭环。

### 8.5 如果让我改这道题

1. 附一份自定义模块源码（哪怕是删减版），让学习者能读 `__wakeup/__destruct`
2. 在题目描述里明确“不要浪费时间在音频隐写上”
3. 给一个更小的“教学版”入口，先让新手成功一次
4. 在页面上标注 Drupal 版本和“核心链已修复”，减少无效搜索
5. 把黑名单做成可绕过的“教学点”，而不是纯黑盒

---

## 9. 附录

### 9.1 本题 export 的完整 payload

base64：

```text
TzoyMjoiUmVzb25hbmNlQXJjaGl2ZVByZXNldCI6NTp7czoxMzoiZm9ybWF0VmVyc2lvbiI7czoxOToicmVzb25hbmNlLWFyY2hpdmUvMSI7czo4OiJjb2RlbmFtZSI7czo2OiJ0ZXN0MDEiO3M6OToiZmllbGROb3RlIjtzOjExOiJoZWxsbyB3b3JsZCI7czo0OiJiYW5kIjtzOjc6ImJhbmQtMDEiO3M6MTM6InNpZ25hbFByb2ZpbGUiO3M6NToiY2xlYW4iO30=
```

解码后：

```text
O:22:"ResonanceArchivePreset":5:{s:13:"formatVersion";s:19:"resonance-archive/1";s:8:"codename";s:6:"test01";s:9:"fieldNote";s:11:"hello world";s:4:"band";s:7:"band-01";s:13:"signalProfile";s:5:"clean";}
```

### 9.2 Python 小工具：生成/解析 preset

```python
import base64
import json

def s(v: str) -> str:
    b = v.encode("utf-8")
    return f's:{len(b)}:"{v}";'

def build(codename: str, field_note: str, band="band-01", profile="clean") -> str:
    props = {
        "formatVersion": "resonance-archive/1",
        "codename": codename,
        "fieldNote": field_note,
        "band": band,
        "signalProfile": profile,
    }
    body = "".join(s(k) + s(v) for k, v in props.items())
    raw = f'O:22:"ResonanceArchivePreset":{len(props)}:{{{body}}}'
    return base64.b64encode(raw.encode()).decode()

def decode(code: str) -> str:
    return base64.b64decode(code).decode("utf-8", errors="replace")

if __name__ == "__main__":
    code = build("test01", "hello world")
    print("code =", code)
    print("raw  =", decode(code))
```

### 9.3 术语表

| 术语 | 解释 |
|---|---|
| 序列化 | 把对象变成字符串/字节流 |
| 反序列化 | 把字符串/字节流还原成对象 |
| PHP Object Injection | 用户可控数据进入 `unserialize()`，从而控制对象属性 |
| Magic Method | `__` 开头、在特定时机自动执行的方法 |
| POP chain | 利用魔术方法把多个类的方法串起来，最终到达危险函数 |
| Gadget | 链中的一个“跳板”类/方法 |
| Sink | 危险操作，如 `system()`、`call_user_func()` |
| Autoload | PHP 在用到类时自动加载对应的文件 |
| PSR-4 | Composer 的命名空间 → 目录映射规范 |
| Drupal | 基于 Symfony 的 PHP CMS；`core/`、`modules/`、`themes/` |
| SA / CVE | 安全公告 / 通用漏洞编号 |

### 9.4 参考阅读

- PHP 手册：`serialize()` / `unserialize()`
- PHP 手册：Magic Methods
- OWASP：Deserialization Cheat Sheet
- PHPGGC：<https://github.com/ambionics/phpggc>
- Drupal 安全公告 SA-CORE-2026-002：<https://www.drupal.org/sa-core-2026-002>
- 一篇公开的 Drupal 反序列化链分析（AT1/AT2）：
  <https://hsw109.github.io/post/2026-04-17-how-i-found-zero-day-when-playing-ctf/>

---

## 10. 最后一句

这道题最值得学的，不是“某个 payload”，而是这套思路：

> **看到编码 → 解码 → 认出序列化 → 找 `unserialize()` → 找魔术方法 → 找 sink → 画链 → 核对版本 → 绕过防护 → 验证假设。**

把这套流程走通，比解出这一道题更有价值。
