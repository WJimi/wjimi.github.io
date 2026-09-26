---
title: SQLite 和 MySQL 差在哪
published: 2026-09-25
description: 嵌入式数据库和客户端-服务器数据库的区别，以及出题时为什么这里选 SQLite
tags:
  - SQLite
  - MySQL
  - 数据库
  - SQL注入
category: 02_知识
slug: knowledge-base/02_kownledge/sqlite-vs-mysql
draft: false
---

# SQLite 和 MySQL 差在哪

## 来源

出 [[knowledge-base/03_projects/web/ivn-duty-challenge|IVN 值班日志]] 时，需要一道 SQL 注入题，
但不想在容器里再跑一个数据库服务。当时我对「用 SQLite 代替 MySQL」这句话完全没有画面。

## 它解决的问题

同样叫「数据库」，SQLite 和 MySQL 到底哪里不一样？为什么换个数据库能省下镜像和内存？

## 当前理解

区别在**架构**，不在有没有 SQL 功能。

| | MySQL / MariaDB | SQLite |
| --- | --- | --- |
| 形态 | 客户端-服务器：一个常驻的 `mysqld` 进程 | 嵌入式（库）：没有进程，整个库就是磁盘上一个文件 |
| PHP 怎么用 | 通过 socket / TCP 把 SQL 发给 mysqld | 用 `pdo_sqlite` 扩展在**自己进程内部**直接读写这个文件 |
| 数据库的实体 | 进程 + 数据目录 | 一个普通文件，比如 `app.db` |
| 启动 | 初始化数据目录、等它 ready、建库建表 | 打开文件 |

所以「用 SQLite」省掉的不是 SQL 能力，而是**一整个服务进程**：
镜像里不用装 `mariadb-server`，内存里不用养常驻进程，启动不用等 ready。

实测（GZCTF 官方 `ghcr.io/gzctf/challenge-base/php:alpine` 基础镜像）：

- 镜像**自带 `pdo_sqlite` / `sqlite3` 扩展，但没有 `pdo_mysql`**（要另装、还要现场编译）
- 整套 nginx + php-fpm + SQLite 在 128MB 限制下只占约 14MB

### 但对做题的人来说，差别在语法细节

注入手法、闭合方式、UNION 结构**完全一样**，sqlmap 也原生支持（能自动读 `sqlite_master`）。
变的是这些：

| 想要的东西 | MySQL | SQLite |
| --- | --- | --- |
| 表名 / 列名 | `information_schema.tables` / `.columns` | `sqlite_master`（列是 `type` / `name` / `sql`） |
| 版本 | `version()`、`@@version` | 没有，只有 `sqlite_version()` |
| 当前库 | `database()` | 没有 |
| 拼接字符串 | `CONCAT()` | `\|\|` |
| 条件函数 | `IF()` | `iif()` |
| 延时 | `SLEEP()` | 没有 |
| 读文件 | `LOAD_FILE()` | 没有 |

我做过 sqli-labs 前 30 关，那全程是 MySQL，所以「注入长什么样」的直觉是按 MySQL 建模的。
换成 SQLite 之后 payload 不能照搬——第一个被影响的人其实是出题的我。

`sqlite_master` 的 `sql` 列直接存着建表语句，所以
`SELECT sql FROM sqlite_master WHERE name='internal_notes'` 一眼就能看到列名，
比 MySQL 少绕一层。这个特性反过来可以做成题目里顺滑的一级台阶。

## 相关问题

- SQLite 没有 `SLEEP()`，那还能做时间盲注吗？
- sqlmap 是怎么判断后端是哪个数据库的？

## 实践

出题时的取舍，两边都真实：

- **选 SQLite**：镜像小、内存省、启动快、构建简单（不用编译扩展）；
  代价是语法脱离选手（和出题人）的 MySQL 直觉。
- **选 MySQL**：payload 生态和教程通用；
  代价是镜像大一截、内存得开到 256~512MB、启动慢（而平台起容器是有超时的）。

我最后选的是 SQLite + **不做任何过滤 + 报错直接回显**，
让 sqlmap 全自动完成，这样选手不写 SQLite 语法也能拿到 flag。

建库直接用 PHP 就行，因为基础镜像里根本没有 `sqlite3` 这个命令行程序：

```php
$pdo = new PDO('sqlite:/var/lib/duty/duty.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('CREATE TABLE duty_log (id INTEGER PRIMARY KEY, ...)');
```

两个必须记住的位置问题：

1. 库文件要放在 **web 根目录之外**，否则选手直接下 `.db` 文件就通关了。
2. `www-data` 要对库文件和它所在目录都有写权限（SQLite 写时会建 journal 文件），
   所以目录权限也得一起给。
