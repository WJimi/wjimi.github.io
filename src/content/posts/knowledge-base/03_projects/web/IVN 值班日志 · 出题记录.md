---
title: "IVN 值班日志 · 出题记录"
published: 2026-09-25
updated: 2026-09-26
description: "从零设计并上线一道新手向 CTF Web 题的完整过程：选题、关卡设计、动态 flag、自测清单"
tags:
  - "CTF"
  - "Web"
  - "出题"
  - "项目"
category: "web"
slug: "knowledge-base/03_projects/web/ivn-duty-challenge"
draft: false
---

# IVN 值班日志 · 出题记录

## 来源

给面向新手的 CTF 出 Web 题时产生。要求是「中等偏下、有点综合性、和自己做过的题有关联」。
上一道是 robots.txt + 备份文件泄露的信息收集题（Baby 难度），这次要往前推一步。

## 它解决的问题

怎么设计并交付一道新手题，让它在比赛现场既不「没人做得出来」，也不「十分钟被绕过」。

## 当前理解

### 出题的顺序不是先想漏洞，是先想玩家的路径

最初想的是三关：信息收集 → HTTP 头伪造 → SQL 注入。后来砍成两关。
判断标准不是「能塞多少知识点」，而是**每一关能不能被独立验证**：

- 做完这一步，玩家能不能确定自己过没过？
- 下一关的地址，有没有明确地给出来？

留死路是新手题最大的敌人。卡在字典上、卡在没提示的隐藏路径上，
选手的体验是「这题我不会」而不是「我再想想」——前者是出题失败，后者才是难度。

### 源码泄露要「泄而不答」

第一关泄露的备份文件里只有**下一关的地址和参数名**，不含 flag，
也不写明「这里可以注入」。线索负责把玩家送到门口，技术还得他自己用一次。

### flag 的位置决定了题目会不会被跳过

- 只在**运行时注入**，源码和镜像里都没有真 flag
- 放在 web 根目录**之外**，否则选手直接下载数据库文件就通关
- 启动脚本里 `unset` 掉平台注入的环境变量

### 背景可以承担「为什么」的部分

这类题最容易被质疑的是「为什么服务器上会留着没删干净的备份」。
我把背景设定成一个小工作室被并入更大的工作室之前留下的站——没人维护、
写它的人已经不在了，于是所有「不该留的东西还留着」就都成立了。

背景不是装饰，它补的是题目的合理性。

### 提示免费的时候，提示就是题面

这个平台上的提示不扣分，意味着**每个玩家都会把提示全部读完**。
于是「提示」和「题目本身」就没有区别了，写什么就等于送什么。

由此定下三条：

1. **提示按解题顺序铺开**，让人读到自己够用就停，不用一眼看完全部答案。
   免费的阶梯，价值不在「成本梯度」，而在「逐步揭示」。
2. **区分度只能放在提示教不会的地方**——动手操作、工具使用、观察细节。
   想让这类题重新有区分度，该加的是上游门槛（比如备份文件名不可猜、必须靠
   `.DS_Store` 才能拿到），而不是把提示写得更含糊。
3. **激励语和提示的颗粒度必须配套。**
   我写了「手工注入拿到 flag 的请你喝奶茶」，但如果上一条提示直接把 payload
   贴出来了，「手工注入成功」就等于「复制粘贴成功」，人人有份，激励成了空话。
   两者要么都留、要么都改。

## 相关问题

- [[knowledge-base/02_kownledge/sqlite-vs-mysql|SQLite 和 MySQL 差在哪]]
- [[knowledge-base/02_kownledge/forbidden-directory-vs-file|403 的目录里文件为什么还能访问]]
- [[knowledge-base/02_kownledge/text-encoding-and-garbled-text|乱码是怎么来的]]
- [[knowledge-base/02_kownledge/which-machine-is-localhost|localhost 指哪台机器]]
- 如果选手完全不会用目录扫描工具，第一关还有别的进入方式吗？

## 实践

项目在 `/home/wjimi/ovo/web-ivn-duty`，两关：
`robots.txt` 指向 `/dev/` → 目录 403 → 扫出 `/dev/index.php.bak` →
按源码里写的地址打 `/dev/query.php?duty_id=1` → sqlmap dump 出 flag。

骨架直接复用上一道题：`Dockerfile` / `start.sh` / `php-fpm-pool.conf` / `local-test.sh`，
只换 `src/`。这是上次出题留给我的最大红利——把脚手架沉淀下来，出新题的成本几乎只剩内容。

完整的**手工注入步骤**（六步：确认注入 → 数列数 → 找回显位 → 查表名 → 查列名 → 取 flag）
写在 `README.md` 里，连「新手容易卡住的四个点」一起记下了——那四点比步骤本身更有价值：
地址栏里空格可以直接打、单引号写成 `%27` 更稳、
**注入点在语句末尾时不需要注释符**（和 sqli-labs 常见的字符型注入不一样）、
`UNION SELECT` 前面的 `duty_id=0` 不能省（否则页面会先显示原来那条记录，新手会以为没注入成功）。

### 踩过的坑，按「下次还会遇到」排序

1. **`${GZCTF_FLAG:-flag{...}}` 会被 shell 的花括号骗。**
   参数展开的默认值里第一个 `}` 就把它截断了，每个 flag 尾部会多一个 `}`，
   全场的提交都会失败。要拆成两步：
   `FLAG="${GZCTF_FLAG:-}"; [ -n "$FLAG" ] || FLAG='flag{local_debug_flag}'`。
2. **`.bak` 在浏览器里显示乱码。**
   `default_type text/plain;` 让文件内联显示而不是下载，但没带 charset，
   浏览器按 GBK 猜 UTF-8。补 `charset utf-8;`。见 [[knowledge-base/02_kownledge/text-encoding-and-garbled-text|乱码是怎么来的]]。
3. **`docker exec` 进去 `env` 里还能看到 `GZCTF_FLAG`**，别慌，那是 Docker
   容器配置层面的注入，不等于服务进程拿得到。要确认的是 nginx / php-fpm 的
   `/proc/<pid>/environ`——`start.sh` 里先 `unset` 再起服务，这两个才是干净的。
4. **数据库不能放进 web 根目录**，否则一个 `curl` 就通关。
5. **dirsearch 的扩展名是替换不是追加**，`-e bak` 只会试 `index.bak`，
   要试出 `index.php.bak` 得加 `-f`；gobuster 的 `-x` 是追加式的。
6. **403 的目录里，文件照样能访问**，这不是漏洞是 nginx 的正常行为。
   见 [[knowledge-base/02_kownledge/forbidden-directory-vs-file|403 的目录里文件为什么还能访问]]。
7. **301 重定向会把平台映射的外部端口弄丢，看起来像题目坏了。**
   请求不带末尾斜杠的目录（`/dev`）时，nginx 默认回的是**绝对地址**的 301：
   主机名取自 `Host` 头（端口被 `$host` 剥掉），端口取自**容器内 nginx 自己监听的 80**
   —— 80 是 http 默认端口，于是干脆不写。平台对外映射的 `:33332` 它根本不知道，
   浏览器照着绝对地址走就掉到平台的 80 端口上，看到平台的 404。
   修法是 `absolute_redirect off;`，让 nginx 回相对地址 `Location: /dev/`，
   浏览器会在当前 origin 上自己拼。
   **任何"容器里跑 nginx + 平台做端口映射"的题都会踩这个坑**，
   本地 `curl localhost:8899/dev` 就能提前复现（`Location: http://localhost/dev/`，端口不见了）。
8. **推镜像报 `permission_denied: The token provided does not match expected scopes`**
   不是 token 过期，是缺 `write:packages`（`read:packages` 不够）。
   GitHub **classic** PAT 的包权限是**账号级**的，推新包不用重新申请 token；
   **fine-grained** token 的包权限是按仓库给的，推新包会被拒。
   靠报错文案区分：登录就失败 = token 无效/过期；这句 = scope 不够；`access denied` = 命名空间不匹配。
9. **不要覆盖同一个镜像 tag 重推。**
   节点上缓存过旧 tag 就不会重新拉，你会对着一个"已修复"的题调试很久。
   有改动就发新 tag（`v1` → `v2`），并在建题页同步改掉镜像名。

### 可以复用的自测清单

上线前逐条跑通（这次全部实测过）：

- 首页、`robots.txt` 的状态码符合预期
- 泄露的备份是**纯文本源码**、带 `charset=utf-8`，不是被 PHP 执行后的一片空白
- 注入点报错会回显，UNION 的列数对得上
- sqlmap 一条命令能 dump 出 flag，并且自动识别出后端是哪个数据库
- 换一个 flag 重建容器，dump 出来的值跟着变（证明动态 flag 真的生效）
- 数据库文件和 `/flag` 都不能从 web 拿到
- nginx / php-fpm 的 environ 里搜不到 flag
- 在平台给的内存限制下连打几十次请求不崩
- 镜像里搜 `flag{`，只剩本地调试的默认值
