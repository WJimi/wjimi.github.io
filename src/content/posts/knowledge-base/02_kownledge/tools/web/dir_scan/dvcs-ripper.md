---
title: dvcs-ripper
published: 2026-03-28
description: 目录扫描工具
tags:
  - web安全
category: 02_知识
slug: knowledge-base/02_kownledge/dir_scan/dvcs-ripper
draft: false
---
好的，我们来逐字解析这条命令：

```c
perl rip-hg.pl -u http://node4.anna.nssctf.cn:28617/.hg/
```

这条命令的作用是使用 **dvcs-ripper** 工具中的 `rip-hg.pl` 脚本，从指定的 URL 下载 Mercurial (HG) 版本控制系统的泄露文件。

---

### 1. `perl`
- **含义**：Perl 语言的解释器。因为 `rip-hg.pl` 是用 Perl 写的脚本，所以需要调用 Perl 来运行它。
- **记忆点**：看到 `.pl` 结尾的文件，通常就需要用 `perl` 来执行（除非文件本身有可执行权限且开头有 `#!/usr/bin/perl`，但加 `perl` 总是安全的）。

### 2. `rip-hg.pl`
- **含义**：dvcs-ripper 工具中专门处理 **Mercurial (HG)** 泄露的脚本。  
  `rip-` 表示“拉取/提取”，`hg` 是 Mercurial 的缩写。
- **记忆点**：不同的版本控制系统有对应的脚本：
  - Git → `rip-git.pl`
  - SVN → `rip-svn.pl`
  - HG → `rip-hg.pl`
  - Bazaar → `rip-bzr.pl`
  - CVS → `rip-cvs.pl`

### 3. `-u`
- **含义**：选项参数，表示 **URL**，即要下载的目标地址。
- **记忆点**：几乎所有网络工具都会用 `-u` 或 `--url` 来指定目标，例如 `curl -u` 是用户名，这里不是，但注意区分。`-u` 后紧跟 URL。

### 4. `http://node4.anna.nssctf.cn:28617/.hg/`
- **含义**：目标网址，包含协议、主机、端口和路径。
  - `http://`：使用 HTTP 协议（而不是 HTTPS）。
  - `node4.anna.nssctf.cn`：域名，是 NSSCTF 平台提供的靶机地址。
  - `:28617`：端口号，表示该服务监听在 28617 端口（默认 HTTP 是 80，这里用了非标准端口）。
  - `/.hg/`：Mercurial 仓库的元数据目录。如果网站存在 HG 泄露，那么通过访问 `/.hg/` 可以获取到版本控制信息。
- **记忆点**：路径必须以 `/.hg/` 结尾，因为这是 HG 仓库的标准位置。同样，Git 泄露对应 `/.git/`，SVN 对应 `/.svn/`。

---

### 整体作用
该命令会启动 Perl 解释器，执行 `rip-hg.pl` 脚本，并告诉它去 `http://node4.anna.nssctf.cn:28617/.hg/` 这个地址下载所有可获取的 HG 元数据文件（如 `requires`、`dirstate`、`store/00manifest.i` 等），从而还原出网站的源代码。

---

### 扩展记忆：为什么用 `rip-hg.pl` 而不是手动下载？
- 手动下载需要逐个访问很多文件，而该脚本会智能地解析仓库结构，自动下载所有必要文件，并处理 404 等错误。
- 对于 CTF 题目，这种工具能快速、完整地获取源码，提高解题效率。

---

### 常见搭配
- 加上 `-v` 参数可以显示详细过程（verbose），便于观察下载了哪些文件：
  ```java
  perl rip-hg.pl -v -u http://xxx/.hg/
  ```

- 下载完成后，通常需要安装 Mercurial 客户端（`hg`）来恢复工作区：
  ```bash
  hg update
  ```

---

### 总结记忆口诀
- **`perl` + 脚本名** → 执行 Perl 脚本。
- **`rip-` + 版本缩写** → 选择对应工具。
- **`-u` + 目标路径** → 指定下载地址。
- **路径以 `/.hg/` 结尾** → 确保是 HG 泄露的正确入口。

现在你可以将这条命令作为模板，根据题目类型替换脚本名和 URL，快速进行源码泄露类的题目。

我们从头开始，以“第一性原理”的方式理解 dvcs-ripper 是什么、为什么存在、怎么用。

------

## 一、第一性原理：dvcs-ripper 的诞生原因

在软件开发中，团队会用 **版本控制系统**（如 Git、SVN、Mercurial）来管理代码。这些系统会在项目目录下创建一个隐藏的文件夹（如 `.git`、`.svn`、`.hg`），里面存储了**整个项目的完整历史记录**，包括所有文件的所有版本。

**正常情况下**，Web 服务器会配置为**禁止访问**这些隐藏目录（比如返回 403 或 404）。
**但有时开发者疏忽或配置错误**，导致这些目录可以通过 HTTP 直接访问。那么攻击者就可以**下载整个源码仓库**，从而获取源代码、数据库密码、配置文件，甚至 flag。

**dvcs-ripper** 就是专门用来**自动化下载**这些泄露的版本控制目录的工具。它能够：

- 识别不同版本控制系统（Git/SVN/HG 等）的目录结构。
- 智能地解析元数据，下载所有必要的文件。
- 即使服务器返回 404，也能通过探测和算法还原出文件位置。

------

## 二、dvcs-ripper 能干什么？

- **Git 泄露**：拉取 `.git/` 目录，包括对象库、索引、HEAD 等，最终可以恢复完整源码。
- **SVN 泄露**：拉取 `.svn/` 目录（支持 1.6 及 1.7+ 格式），提取历史版本。
- **HG 泄露**：拉取 `.hg/` 目录，恢复工作区文件。
- **其他**：Bazaar (`.bzr/`)、CVS (`.cvs/`) 等。

在 CTF 中，当遇到“源码泄露”类题目时，dvcs-ripper 就是你的**自动化提取器**。

------

## 三、玩转 dvcs-ripper 的核心流程

### 1. 确认泄露类型

- 题目提示或手动探测：访问 `http://target/.git/`、`/.svn/`、`/.hg/` 等，看是否返回 200 或目录列表。
- 常见工具：`curl -I http://target/.git/HEAD`，返回 200 则存在。

### 2. 选择对应脚本并运行

- Git: `rip-git.pl -v -u http://target/.git/`
- SVN: `rip-svn.pl -v -u http://target/.svn/`
- HG: `rip-hg.pl -v -u http://target/.hg/`

参数 `-v` 显示详细信息，`-u` 指定 URL。

### 3. 恢复源码（针对 Git 和 HG）

- **Git**：下载后，进入目录，执行 `git checkout -- .` 或 `git reset --hard` 恢复工作区文件。
- **HG**：需要安装 Mercurial (`hg`)，然后执行 `hg update` 恢复。
- **SVN**：SVN 1.6 及以下可以用 `svn checkout`；1.7+ 使用 `sqlite3` 查询 `.svn/wc.db` 提取文件路径。

### 4. 在恢复的源码中寻找 flag

- 使用 `grep -r "flag" .` 搜索关键词。
- 查看配置文件（如 `config.php`、`.env`）、敏感文件、历史记录等。

  ------

### 命令模板

- **Git 泄露**：`perl rip-git.pl -v -u http://目标/.git/` → `git checkout .`（恢复）
- **HG 泄露**：`perl rip-hg.pl -v -u http://目标/.hg/` → `hg update`（恢复）
- **SVN 泄露**：`perl rip-svn.pl -v -u http://目标/.svn/` → 查看 `.svn/entries` 或 `sqlite3 .svn/wc.db`（SVN 1.7+）