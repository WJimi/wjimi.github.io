---
title: "DSH 工作流落地记录"
published: 2026-11-16
description: "把知识接到一个可落地的循环上：目标、问题、交付物、沉淀、新问题"
tags:
  - "AI"
  - "工作流"
  - "待归类"
category: "KB"
slug: "knowledge-base/00_inbox/dsh-learning-flow"
draft: true
---

# DSH 工作流落地记录

## 来源

从 [[Web 安全 8 周目标]] 往下拆时暴露的缺口：目标和靶场都有了，但写出来的工具没有沉淀的地方，对话里的结论活不过一个会话。

## 它解决了什么问题

结论没有固定落点。循环是：目标 -> 问题 -> 动手 -> 交付物 -> 一句话沉淀 -> 新问题。缺了"沉淀"这一步，问题就停在脑子里，下次重新想一遍。

## 现在的分工

| 层 | 落点 | 谁写 |
|---|---|---|
| 红线 | `dsh-lab/AGENTS.md` | 只有我 |
| 技能 | `dsh-lab/.dsh/skills/` | 我点头才写 |
| 知识 | 本知识库 | 我思考我写 |
| 脚本 | `dsh-lab/scripts/` | 交付物 |

## 待答问题

- 一个问题从"当前"走到"已解决"，平均要几天？
- 一个技能被复用三次之后，要不要升级成 `02_kownledge/tools/` 的一篇？
- `00_inbox` 里躺着的笔记，多久不动就该归档或删掉？

## 事实

- DSH 会沿目录链自动加载 `AGENTS.md`，写入 `.dsh/skills/` 的技能下一轮即可用，无需重启。
- 本机 Python 3.14.5 + 系统代理环境下，HTTPS 需 `truststore` 接管证书，否则 `CERTIFICATE_VERIFY_FAILED`。
