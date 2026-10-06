---
title: "Web 安全 8 周目标"
published: 2026-09-29
description: "8 周要交付哪几样东西、怎么算到过，以及 PortSwigger 这条主线怎么走"
tags:
  - "Web安全"
  - "CTF"
  - "PortSwigger"
category: "web"
slug: "knowledge-base/03_projects/web/web-security-8-weeks"
draft: false
---

# Web 安全 8 周目标

## 来源

从 [[我该往哪个方向走？]] 收束出来的：
不再问"方向是什么"，改成"8 周交付哪几样东西"。

## 它解决的问题

8 周后拿什么判断自己确实到过某个水平？这 8 周又拿什么当主线？

## 当前理解

### 目标（验收标准）

五条，逐条可查：

- [ ] 独立完成 PortSwigger 30–50 个 Labs
- [ ] 能写规范的漏洞报告
- [ ] 能参加 CTF Web 方向并做出简单题
- [ ] 能搭靶场、复现简单 CVE（只挑有公开 WP、环境能一键起的；卡超过两天就换一个）
- [ ] 简历上有 Writeup 和项目

### 主线：PortSwigger Web Security Academy

它是 **Burp Suite 背后的公司 PortSwigger 自己做的免费在线靶场**，配讲义，两百多个 lab，
分 Apprentice / Practitioner / Expert 三档，每个 lab 有独立实例、有明确的"解出来"判定，还附官方解答。

它和 DVWA / Pikachu / sqli-labs 那类本地靶场的区别：**不用自己搭环境**，打开浏览器就能打，
抓包改包用 Burp；每道题的边界清清楚楚，不用猜出题人想考什么。所以它适合当主线，
本地靶场留给"回头补某个具体机制"。

### 最小行动路线

纲要的最小单位是问题，所以不按周排，按"一个焦点 → 卡点 → 缺口 → 沉淀"排：

1. **一个焦点**：PortSwigger，当缺口探测器而不是课程——顺着 Track 做，卡在哪个机制上就只补那一个机制。
2. **每周一个交付物**：一篇 Writeup（`review/`）、一篇机制笔记（`02_kownledge/`）或一个能跑的脚本。按产出记，不按小时记。
3. **卡点即笔记**：卡住的题写 WP，卡住的机制写知识笔记。
4. **用自己的题当发动机**：出题 → 写 WP → 固化成能一键复现的靶场，IVN 那条路继续走。
5. **明确不做**：装环境、Python/Linux 基础；逆向、AI 安全、云安全先放 `04_explore/`。

### 进度

| 周 | 交付物 | 链接 |
| --- | --- | --- |
| 第 1 周 |  |  |

## 相关问题

- PortSwigger 从哪条 Track 开始、现在做到第几个 lab？（待填）
- 后端语言够不够用 → [[knowledge-base/04_explore/backend-language-basics|后端语言基础要补到什么程度]]
- [[Web 安全的边界在哪]]
- [[knowledge-base/02_kownledge/ctf-web-vs-real-world|CTF 的 Web 和实战差在哪]]

## 实践

验收那五条里，前三条靠 PortSwigger + CTF 的产出，第四条靠出题和复现，第五条是前四条的自然结果。
每周只记一件事：这周交付了什么。

## 待探索

- 代码审计（PHP / Java 开源项目）
- 逆向、AI 安全、云安全
