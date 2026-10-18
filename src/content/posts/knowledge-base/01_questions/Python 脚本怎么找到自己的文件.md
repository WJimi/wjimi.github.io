---
title: "Python 脚本怎么找到自己的文件？"
published: 2026-10-13
description: "CWD、__file__、sys.path 各管什么，决定脚本能不能搬家"
tags:
  - "Python"
  - "路径"
  - "健壮性"
category: "01_问题"
slug: "knowledge-base/01_questions/how-a-script-finds-its-own-files"
draft: false
---

# Python 脚本怎么找到自己的文件？

## 状态

已解决（结论在 [[脚本的路径依赖]]）。

## 为什么现在出现

想把 buff-trade 里的 `.py` 全收进 `src/`，担心的是一句很模糊的话——
"感觉要改动的地方很多，而且可能出 bug"。AI 把它拆成了这个问题。

## 它依赖什么

知道"命令里写的是路径，程序按路径找文件"就够。

## 它连接什么

- [[脚本的路径依赖]] —— 结论记在这里
- [[读懂 Python 脚本需要的语法点]]
- [[CS2 炼金配方的自动取材]]

## 待答问题

- ❓ 换个工作目录启动同一份脚本，哪些文件还能找到、哪些会丢？
  （在项目目录外 `cd` 一次，把 `src/` 里几个脚本都跑一遍对照）
- ❓ 把路径收敛到一处之后，搬目录还要改几个地方？（拿 `src/paths.py` 数一遍）

## 事实

- `CWD` 是你敲命令时所在的目录，`__file__` 是脚本自己的位置，`sys.path` 决定去哪找模块。
- `python src\shell.py` 会把 `src\` 放进 `sys.path`，所以脚本可以平铺在 `src/` 下。

## 结论
