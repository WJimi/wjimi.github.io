---
title: "localhost 指哪台机器？"
published: 2026-10-13
description: "loopback、绑定地址和端口映射决定 localhost 落在谁的机器上"
tags:
  - "网络"
  - "虚拟机"
  - "容器"
category: "01_问题"
slug: "knowledge-base/01_questions/which-machine-is-localhost"
draft: false
---

# localhost 指哪台机器？

## 状态

已解决（结论在 [[localhost、loopback 与端口映射]]）。

## 为什么现在出现

出 IVN 题时想用 Kali 虚拟机里的 dirsearch 去扫 Windows 物理机上跑的容器，
卡在地址上："localhost 到底是谁的 localhost？"

## 它依赖什么

知道"每台机器都有自己的地址"就够。

## 它连接什么

- [[localhost、loopback 与端口映射]] —— 结论记在这里
- [[IVN 值班日志 · 出题记录]]

## 待答问题

- ❓ 容器里的服务分别监听 `127.0.0.1` 和 `0.0.0.0` 时，从宿主机各有几种访问方式？
  （两种各起一个容器，从宿主机和另一个容器各请求一次，画出能通的路径）
- ❓ WSL 里的服务，Windows 侧浏览器要用什么地址访问？
  （两边各跑一个 `python3 -m http.server` 对照）

## 事实

- `localhost` 解析到 loopback（`127.0.0.1` / `::1`），永远指"发起连接的那台机器自己"。
- 绑定 `127.0.0.1` 和绑定 `0.0.0.0` 决定的是"谁能连进来"。

## 结论
