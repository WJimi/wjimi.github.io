---
title: "SQL 注入为什么能拿到数据？"
published: 2026-10-13
description: "从拼接字符串讲到盲注回显，再到选哪种数据库出题"
tags:
  - "SQL注入"
  - "Web安全"
category: "01_问题"
slug: "knowledge-base/01_questions/how-sql-injection-reads-data"
draft: false
---

# SQL 注入为什么能拿到数据？

## 状态

部分解决（手工注入会用，盲注脚本和排错还没收尾）。

## 为什么现在出现

sqli-labs 前 30 关、SXCTF 四道 Web 题、自己出的 IVN 注入题用的是同一件事，
但一直没把它写成一条能复述的链路——每次都是"照着 payload 抄"。

## 它依赖什么

知道 SQL 语句是发给数据库执行的文本就够。

## 它连接什么

- [[SQLi-Notes]] —— 取数据的具体手法
- [[盲注与ASCII码]] —— 没有回显时怎么把数据一个字符一个字符问出来
- [[嵌入式数据库与客户端-服务器数据库]] —— 出题时选哪种引擎

## 待答问题

- ❓ 同一条 payload 在 SQLite 和 MySQL 上表现不同的地方有哪些？
  （同一道题在两个引擎上各跑一遍，把报错原文抄下来对比）
- ❓ 盲注脚本是"能跑"还是"能排错"？把二分次数和请求数记下来，看哪种策略更省。
- ❓ 从"有回显"到"无回显"再到"无回显且无报错"，需要换的只是取数据的方式，还是整个思路？

## 事实

- 联合查询要求前后列数一致，所以要先猜列数（`order by N` 二分）。
- `information_schema` 是 MySQL 的系统库，SQLite 没有它，改查 `sqlite_master`。
- updatexml / extractvalue 报错注入一次最多回显 32 个字符，超了要 substr 截断再拼。

## 结论
