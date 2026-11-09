---
title: sqlmap
published: 2026-03-28
description: sqlmap知多少
tags:
  - MySQL
  - SQL注入
  - web安全
  - SQLi
category: 02_知识
slug: knowledge-base/02_kownledge/sqlmap
draft: false
---
结构上以**选项参数速查表**和**工具缺陷深度分析**为主线，保留了必要的安装与验证路径，但将重点放在“sqlmap 在哪些情况下会失效”以及“为什么会失效”。

---

# sqlmap 工具指南与缺陷分析

## 一、定位：它擅长什么，不擅长什么

sqlmap 是用 Python 编写的开源 SQL 注入自动化工具，核心能力是**检测和利用 SQL 注入漏洞**，支持布尔盲注、报错注入、UNION 查询、堆叠查询、时间盲注和带外通道六类技术。它在**已知注入点、网络条件稳定、无 WAF 或 WAF 较弱**的环境中效率极高，尤其适合盲注数据的自动化提取——这正是手工操作最耗时的环节。

但它不是“万能注入扫描器”。它的默认流量特征极强，容易被 WAF 和云防护拦截；它依赖页面响应的可区分性来判断注入是否成立，对**动态内容、状态码钝化、非标准参数位置**天然不敏感；它也无法智能绕过针对性的自定义过滤规则。**sqlmap 的失效，几乎总是因为它赖以工作的“信号”被遮蔽或伪造了。**

---

## 二、选项参数速查表

### 2.1 目标与参数指定

| 选项 | 作用 |
|---|---|
| `-u <URL>` / `--url=<URL>` | 指定目标 URL |
| `-p <PARAM>` | 指定要测试的参数（跳过其他参数） |
| `--skip=<PARAM>` | 跳过指定参数 |
| `-r <FILE>` | 从文件加载完整的 HTTP 请求（适合复杂 POST、自定义头、Cookie） |
| `--data=<DATA>` | 以 POST 方式提交的数据 |
| `--cookie=<COOKIE>` | 携带 Cookie |
| `--user-agent=<UA>` / `--random-agent` | 自定义或随机 User-Agent |
| `--referer=<REFERER>` | 自定义 Referer 头 |
| `--headers=<HEADERS>` | 注入额外 HTTP 头 |
| `--method=<METHOD>` | 强制 HTTP 方法（GET/POST 等） |
| `--param-del=<CHAR>` | 参数分隔符（默认 `&`） |

### 2.2 注入技术控制

| 选项 | 作用 |
|---|---|
| `--technique=<LETTERS>` | 指定/排序注入技术，默认 `BEUSTQ`：B 布尔盲注，E 报错，U UNION，S 堆叠，T 时间盲注，Q 带外 |
| `--dbms=<DBMS>` | 指定后端数据库类型，跳过指纹识别，加快速度 |
| `--os=<OS>` | 指定目标操作系统 |
| `--level=<1-5>` | 测试深度，越高覆盖的参数和头越多（默认 1） |
| `--risk=<1-3>` | 测试风险，越高 payload 越“危险”（默认 1） |
| `--time-sec=<SEC>` | 时间盲注的延迟秒数（默认 5） |
| `--union-char=<CHAR>` | 指定 UNION 查询中用于匹配的字符，帮助识别 UNION 注入 |
| `--prefix=<PREFIX>` / `--suffix=<SUFFIX>` | 自定义 payload 前后缀，用于适配特殊闭合方式 |
| `--tamper=<SCRIPT>` | 加载 tamper 脚本对 payload 进行变形，试图绕过 WAF |

### 2.3 枚举与数据提取

| 选项 | 作用 |
|---|---|
| `--dbs` | 列出所有数据库 |
| `--tables` | 列出指定数据库（配合 `-D`）的表 |
| `--columns` | 列出指定表（配合 `-D -T`）的列 |
| `--dump` | 导出指定表或列的数据 |
| `-D <DB>` / `-T <TABLE>` / `-C <COLS>` | 指定数据库、表、列 |
| `--schema` | 枚举完整 schema（所有库、表、列） |
| `--all` | 枚举所有可获取的信息 |
| `--count` | 统计表中的条目数 |
| `--search` | 搜索数据库名、表名或列名 |
| `--sql-query=<QUERY>` / `--sql-shell` | 执行自定义 SQL 查询 / 进入交互式 SQL shell（依赖堆叠查询支持） |

### 2.4 请求与连接调优

| 选项 | 作用 |
|---|---|
| `--batch` | 非交互模式，自动选择默认答案 |
| `--threads=<N>` | 并发线程数（盲注提速常用，但会加重目标负载） |
| `--proxy=<PROXY>` | 设置代理（如 `http://127.0.0.1:8080`） |
| `--delay=<SEC>` | 每次请求之间的延迟，降低触发速率限制的风险 |
| `--timeout=<SEC>` | 请求超时时间 |
| `--retries=<N>` | 请求失败重试次数 |
| `--keep-alive` / `--no-keep-alive` | 启用/禁用 HTTP Keep-Alive |
| `--auth-type` / `--auth-cred` | HTTP 认证类型与凭据（Basic/Digest/NTLM 等） |
| `--csrf-token` / `--csrf-url` | 处理 CSRF Token 场景 |

### 2.5 响应判定与误报控制

| 选项 | 作用 |
|---|---|
| `--string=<STRING>` | 指定“真”响应中应出现的字符串，用于布尔判定 |
| `--not-string=<STRING>` | 指定“假”响应中应出现的字符串 |
| `--code=<CODE>` | 指定“真”响应的 HTTP 状态码 |
| `--text-only` | 仅比对纯文本，忽略 HTML 标签和脚本 |
| `--titles` | 仅比对页面标题 |
| `--identify-waf` | 尝试识别目标是否部署 WAF |

### 2.6 文件系统与系统命令

| 选项 | 作用 |
|---|---|
| `--file-read=<FILE>` | 读取目标服务器上的文件（依赖数据库权限） |
| `--file-write=<LOCAL>` / `--file-dest=<REMOTE>` | 写入文件到目标服务器 |
| `--os-cmd=<CMD>` / `--os-shell` | 执行系统命令 / 获取交互式系统 shell（依赖堆叠查询和足够权限） |

### 2.7 新版中值得关注的开关（1.10.x / 2.0 WIP）

| 选项 | 说明 |
|---|---|
| `--nosql` | 测试 NoSQL 注入（WIP 分支引入） |
| `--xpath` / `--ldap` / `--ssti` / `--graphql` | 测试 XPath、LDAP、SSTI、GraphQL 注入（WIP 分支引入） |
| `--timeless` | 不依赖延迟，从 HTTP/2 响应顺序读取盲注位，适合禁用 `SLEEP` 的场景 |
| `--multi-bit` | 在渲染多行的页面上一次请求读取多个位，提升盲注效率 |
| `--no-huffman` | 禁用盲注导出的 Huffman 集合成员编码（默认启用，减少请求数） |
| `--lengths` | 仅通过内容长度比较页面差异 |

> 稳定版（1.10.10）的核心仍是**SQL 注入**；`--nosql`、`--xpath` 等多注入类型能力来自开发分支，尚未进入稳定发布版。

---

## 三、工具分析：sqlmap 在哪些情景下乏力

### 3.1 面对 WAF 与云防护：默认即被识别

sqlmap 的默认请求具有极强的指纹特征，在部署了主流 WAF 或云防护的站点上，扫描流量往往在探测阶段就被拦截。`--tamper` 脚本的设计初衷是绕过基于关键词黑名单或正则匹配的简单过滤（如将 `UNION SELECT` 拆解、替换空格），但它**无法智能适配目标的具体 WAF 规则**——编码冲突、双重编码、字符集不匹配都可能让 tamper 脚本反而破坏 payload 的有效性。面对云 WAF（如阿里云盾、腾讯 T-Sec 等），tamper 脚本的效果尤其有限。一个明确的实战判断标准是：**当 sqlmap 配合 `--tamper` 仍然无法通过 WAF 时，继续在工具参数上打转的边际收益极低，转向手工构造绕过 payload 才是更合理的路径**。

### 3.2 响应指纹引擎的结构性脆弱

sqlmap 判断注入是否存在，本质上是在比较“真”与“假”两种条件下的页面响应。这一机制在理想环境下有效，但在以下情景中会系统性地失效：

- **动态内容干扰**：页面中的时间戳、广告位、随机 UUID、用户会话 ID 等每次请求都在变化，导致“真”和“假”响应的相似度都被拉低，Levenshtein 距离算法无法给出稳定判定。
- **状态码钝化**：WAF 或中间件对所有请求统一返回 `200`，真实的 `500` 或自定义错误被掩盖，sqlmap 无法通过状态码差异捕捉注入信号。
- **错误信息被隐藏**：报错型注入依赖数据库错误回显，但如果错误被 HTML 注释、JavaScript 隐藏，或被框架统一吞掉，报错通道就完全失效。
- **默认策略的“宁可漏报”倾向**：在 `--level=1 --risk=1` 下，sqlmap 只发送基础 payload 并严格校验响应差异；当页面存在上述干扰时，它会直接报告 `no injection points detected`，即使手工构造 `id=1' OR '1'='1` 能触发错误。这不是偶发的 bug，而是其设计哲学——**宁可漏报，不可误报**——在复杂环境下的必然代价。

### 3.3 上下文解析的盲区

sqlmap 默认只解析 URL 查询字符串中的参数。对于 **JSON 请求体、XML payload、Referer 头、自定义 HTTP 头**中的注入点，它不会自动识别，需要手动通过 `-r` 加载完整请求文件或显式指定 `--headers` 等方式才能覆盖。此外，伪静态 URL、隐藏参数、复杂业务鉴权后的注入点，同样落在它的自动探测盲区之内。这些场景并非不可测试，但 sqlmap **不会“自动发现”它们**——发现注入点的责任仍然在测试者身上。

### 3.4 堆叠查询的硬性依赖

`--sql-query` 和 `--os-shell` 等高级功能依赖**堆叠查询**（stacked queries）支持。在 MySQL/PHP 的典型组合中，`mysql_query()` 默认不支持多语句执行，因此即使存在注入点，sqlmap 也会明确警告“execution of custom SQL queries is only available when stacked queries are supported”。这意味着 sqlmap 的写入和命令执行能力**高度受限于后端技术栈**，而不是工具本身的设计缺陷——但这恰恰是使用者容易忽略的前提条件。

### 3.5 盲注的效率天花板

时间盲注是 sqlmap 在“页面无回显”场景下的主力技术，但它存在固有的效率瓶颈。每个比特的提取都需要引入真实延迟（`SLEEP`/`WAITFOR`），而二进制搜索或逐字符猜解需要大量请求，导致数据提取时间显著拉长。在高延迟网络或生产环境中，时间盲注不仅慢，还可能因为连接池被长时间占用而对目标造成实际影响。相比之下，`--technique=B`（布尔盲注）在响应可区分的前提下通常比时间盲注更隐蔽、更快，但前提是目标页面确实存在稳定的布尔 oracle——如果页面动态性太强，布尔盲注同样会退化。

### 3.6 与 Ghauri 等替代工具的对比定位

在自动化 SQL 注入工具的光谱上，sqlmap 的优势在于**DBMS 覆盖最广、注入技术最全、功能体系最完整**——多项对比研究将其列为综合能力最强的工具。但 Ghauri 等工具在特定方向上做出了不同的取舍：Ghauri 专门强化了**盲注场景和现代云 WAF 下的绕过能力**，采用自适应时序和 payload 混淆策略。这并不意味着 Ghauri “更好”，而是说明了一个现实：**没有单一工具在所有环境中都占优**。将 sqlmap 与面向盲注/WAF 绕过优化的工具配合使用，比在 sqlmap 上强行堆叠参数更符合实战效率逻辑。

---

## 四、协同工作流：sqlmap 与其他工具/命令的搭配

sqlmap 单独运行时的能力边界，前面已经讨论过。但在真实的工作流中，它的价值往往不是由自身参数决定的，而是由**输入的质量**和**前置/后置环节的衔接方式**决定的。以下按“输入管道 → 网络层 → 自动化编排 → payload 层 → 侦察前置”的顺序展开，每个场景配可执行的代码块，并说明协作逻辑与前提条件。

---

### 4.1 输入管道：Burp Suite / 浏览器 / curl → `-r` 请求文件

`-r` 是 sqlmap 与外部工具协作最基础、也最容易被低估的接口。它的作用不是“指定一个 URL”，而是**把任何工具捕获到的完整 HTTP 请求原样注入 sqlmap 的测试引擎**。这意味着你不需要在 sqlmap 的命令行里重新拼凑 Cookie、自定义头、JSON body 或鉴权 token——凡是 Burp、浏览器开发者工具或 curl 能捕获的请求，都可以直接交给 sqlmap 处理。

**Burp Suite 场景**：在 Burp 的 Proxy → HTTP history 中右键任意请求，选择 “Copy to file”，保存为 `req.txt`。该文件包含请求行、Host、Cookie、Content-Type 以及完整的 body。

```bash
# Burp 保存的请求文件直接作为 sqlmap 输入
sqlmap -r req.txt --batch --level=3 --risk=2

# 如果请求体是 JSON，sqlmap 需要知道注入点在 JSON 的哪个键
sqlmap -r req.txt --batch --data='{"username":"admin","password":"test"}' -p username
```

`-r` 的真正价值在于它**消除了“请求重建误差”**——手工在 sqlmap 中拼 `--cookie` 和 `--headers` 时，任何一个头字段的遗漏或顺序错乱都可能改变服务端行为，导致本来存在的注入点被“测不出来”。用 Burp 捕获的原始请求作为输入，是消除这一误差最直接的手段。

**curl 场景**：如果你更习惯命令行，可以用 `curl -v` 捕获请求和响应，或直接用 `curl` 构造一个带认证的 POST 请求并保存为文件：

```bash
# 用 curl 发起请求，-v 查看完整交互，用于确认参数位置
curl -v -X POST "https://target.com/api/login" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"username":"admin","password":"x"}'

# 将请求体保存，配合 sqlmap 的 --data 使用（适用于简单 POST）
sqlmap -u "https://target.com/api/login" \
  --data='{"username":"admin","password":"x"}' \
  --headers="Authorization: Bearer <token>\nContent-Type: application/json" \
  -p username --batch
```

对于**需要登录态**的页面，`-r` 是远比 `--cookie` 更可靠的方式：Burp 中捕获的请求天然携带了完整的 Cookie 链和 CSRF token（如果有的话），sqlmap 可以直接复用，而不需要你手动追踪 token 的刷新逻辑。

---

### 4.2 网络层：proxychains / 代理链 → 绕过网络限制与来源隐藏

当目标位于内网、或需要隐藏扫描来源时，sqlmap 自身不原生支持 SOCKS 代理链（`--proxy` 只接受单个代理）。这时 **proxychains** 的作用是**在操作系统层面为 sqlmap 的所有出站连接强制注入代理路由**，sqlmap 本身对此无感知。

**前提**：`/etc/proxychains4.conf` 中已配置好可用的 SOCKS5 代理（例如 `socks5 127.0.0.1 1080`），且代理链末端能够到达目标。

```bash
# proxychains 包裹 sqlmap，所有 HTTP 流量自动经由配置的代理链
proxychains4 -q sqlmap -r req.txt \
  --batch \
  --random-agent \
  --delay=2 \
  --timeout=60 \
  --threads=1 \
  --flush-session
```

几个参数在代理链场景下**不是可选项，而是稳定性保障**：`--delay` 和 `--threads=1` 降低并发对代理链的冲击；`--timeout` 给高延迟链路留出响应窗口；`--flush-session` 清除旧会话，避免代理切换后残留的 DNS 缓存或连接池导致行为异常。不加这些参数时，sqlmap 在代理链下的“注入点未检出”很多时候不是目标没有漏洞，而是请求根本没完整到达或响应超时被丢弃。

**Burp 作为上游代理 + sqlmap 的另一种组合**：将 sqlmap 的流量经 Burp 转发，同时利用 Burp 的 Logger 记录所有 payload 和响应，便于事后逐条复盘 sqlmap 的探测逻辑：

```bash
# sqlmap → Burp (8080) → 目标；在 Burp 中观察每一发 payload
sqlmap -u "https://target.com/item?id=1" \
  --proxy=http://127.0.0.1:8080 \
  --batch \
  --level=3
```

这种组合的用途不是“绕过”，而是**可观测性**：当你需要理解 sqlmap 为什么在某个参数上失败、它实际发了什么、服务端回了什么，Burp 的 HTTP history 是比 sqlmap 终端输出更完整的证据链。

---

### 4.3 自动化编排：`sqlmapapi.py` + curl / Python 脚本

`sqlmapapi.py` 将 sqlmap 封装为一个 HTTP REST 服务，接受和返回 JSON。它的协作场景是：**批量目标、流水线集成、或需要将 sqlmap 嵌入其他系统（报告平台、调度器、CI 流程）时，避免反复 fork 进程和解析脆弱的终端输出**。

**启动服务端**：

```bash
# 默认监听 127.0.0.1:8775，Basic Auth 用户名/密码均为 sqlmap
python3 sqlmapapi.py -s --username sqlmap --password sqlmap
```

**用 curl 走完一个最小任务生命周期**（官方 workflow 的直接复现）：

```bash
API="http://127.0.0.1:8775"
AUTH="sqlmap:sqlmap"

# 1. 创建任务，提取 16 位 taskid
taskid=$(curl -s -u "$AUTH" "$API/task/new" | grep -o '[a-f0-9]\{16\}')
echo "taskid: $taskid"

# 2. 提交扫描选项（JSON key 对应 sqlmap 内部选项名，url 即 --url）
curl -s -u "$AUTH" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"url":"https://target.com/product.php?id=1","batch":true,"level":3,"risk":2}' \
  "$API/scan/$taskid/start"

# 3. 轮询状态（running / terminated）
curl -s -u "$AUTH" "$API/scan/$taskid/status"

# 4. 扫描结束后获取数据
curl -s -u "$AUTH" "$API/scan/$taskid/data"

# 5. 清理任务
curl -s -u "$AUTH" "$API/task/$taskid/delete"
```

这里的协作关键在于 **JSON key 的命名规则**：命令行 `--level=3` 在 API 中写作 `"level": 3`，`--batch` 写作 `"batch": true`。这意味着你**不需要学习一套新的参数体系**，只需要把已有命令行选项“翻译”成 JSON 键值对即可。对于批量场景，用 Python 循环遍历 URL 列表、依次创建任务、并发轮询状态，是比 `sqlmap -m urls.txt` 串行模式更灵活的替代方案——后者在一个任务结束后才启动下一个，而 API 模式可以在任务粒度上做并发和调度。

---

### 4.4 Payload 层：tamper 脚本的自定义与组合编排

`--tamper` 的本质是**在 sqlmap 生成 payload 之后、发送之前，插入一个可编程的变换函数**。它不是“更多参数”，而是一个开放的**中间件接口**：tamper 脚本的 `tamper(payload, **kwargs)` 函数接收原始 payload，返回变形后的 payload，sqlmap 对返回值不做额外假设。

这意味着 tamper 的协作场景是**将你对目标过滤规则的逆向理解，固化为可复用的代码**，而不是在一次性的手工 payload 构造中消耗掉。

**最小自定义 tamper 示例**：如果目标将 `=` 过滤但允许 `LIKE`，同时过滤了 `AND` 但允许 `&&`：

```python
# mytamper.py —— 放在 sqlmap 的 tamper/ 目录下，或用绝对路径加载
from lib.core.enums import PRIORITY

__priority__ = PRIORITY.NORMAL

def dependencies():
    pass

def tamper(payload, **kwargs):
    if payload:
        payload = payload.replace("=", " LIKE ")
        payload = payload.replace("AND", "&&")
    return payload
```

```bash
sqlmap -u "https://target.com/item?id=1" \
  --tamper=/path/to/mytamper.py \
  --batch \
  --dbms=mysql
```

**组合加载多个 tamper**：sqlmap 按 `--tamper` 中逗号分隔的顺序**依次执行**每个脚本的 `tamper()` 函数，前一个的输出是后一个的输入。这意味着顺序本身是一种设计决策：

```bash
# 先随机大小写混淆关键字，再将空格注释化，最后处理等号
sqlmap -u "https://target.com/item?id=1" \
  --tamper="randomcase,space2comment,equaltolike" \
  --batch
```

顺序不当可能导致后一个脚本的变换被前一个脚本“抵消”或破坏语法有效性。一个实用的编排原则是：**编码/混淆类操作放在前面，结构性替换（如空格→注释、=→LIKE）放在后面**，因为结构性替换往往依赖空格和符号作为边界。

---

### 4.5 侦察前置：nmap / 目录扫描 → sqlmap 的目标发现链

sqlmap 自身不具备资产发现能力，它需要你告诉它“打哪里”。将侦察工具的产出作为 sqlmap 的输入，是协作链中最上游的一环。

**nmap 发现 Web 服务后批量提取 URL 交给 sqlmap**：

```bash
# 1. nmap 发现开放 80/443/8080 的主机，提取 IP:PORT
nmap -p 80,443,8080 -open -oG scan.txt 10.10.10.0/24
grep -oP '\d+\.\d+\.\d+\.\d+:\d+' scan.txt > web_endpoints.txt

# 2. 对每个端点做目录发现，收集带参数的 URL（示意）
while read ep; do
  curl -s "http://$ep/" | grep -oE 'href="[^"]*\?[^"]*"' >> candidate_params.txt
done < web_endpoints.txt

# 3. 将带参数的 URL 逐个交给 sqlmap（或用 sqlmapapi 批量编排）
while read url; do
  sqlmap -u "$url" --batch --level=2 --smart --output-dir=./results
done < candidate_params.txt
```

这里的协作逻辑是：**nmap 解决“哪里有服务”，目录/爬虫解决“哪里有参数”，sqlmap 只负责“参数是否可注入”**。把 sqlmap 放在这个链条的末端而不是起点，可以避免将它的自动化能力浪费在对无参数页面的无效扫描上。

---

### 4.6 协作的边界：什么时候不应该继续“搭配”

这一节讨论的是“如何搭配”，但同样重要的是识别**搭配失效的时刻**。当一个协作链路中某一环的输出质量已经不可靠时，继续向后续环节堆叠工具并不会恢复信号，只会放大噪声。

典型信号包括：proxychains 下 sqlmap 连续报连接超时而非返回“无注入”——问题在代理链，不在 payload；`-r` 请求在 Burp 中重放成功、但 sqlmap 用同一文件报解析错误——问题在请求文件的完整性或编码，不在注入检测逻辑；tamper 组合脚本越堆越多、但所有技术仍返回 `not injectable`——需要回到手工，确认目标是否存在可区分的布尔/时间 oracle，而不是继续在 tamper 层加码。

协作工具的价值，在于**让 sqlmap 在正确的条件下工作**，而不是**用外部工具掩盖 sqlmap 不适用的条件**。

## 五、结论：把 sqlmap 放回正确的位置

sqlmap 是一把**高效率的“已知注入点数据提取器”**，而不是“注入发现器”，更不是“WAF 绕过器”。它在以下条件下发挥最大价值：

- 注入点已经通过手工或代码审计确认；
- 目标响应具有可区分的“真/假”信号（或可通过 `--string`/`--not-string`/`--code` 人工锚定）；
- 目标未部署强 WAF，或 tamper 脚本恰好匹配其规则；
- 注入类型落在 B/E/U/S/T/Q 六类之中，且后端支持所需操作（如堆叠查询）。

当这些前提不成立时，sqlmap 的失效不是“工具坏了”，而是**它赖以工作的信号条件不满足了**。理解这些失效边界，比记住更多参数更有价值：先用手工判断注入点是否存在、响应信号是否稳定、WAF 是否构成阻断，再决定是否交给 sqlmap 做批量提取，才是它在真实工作流中的合理位置。