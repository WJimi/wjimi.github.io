---
title: "Tavily 还能用吗，怎么接成 MCP"
published: 2026-10-09
description: "一个闲置的搜索 API key 是否还有价值，以及 Tavily MCP 怎么接进 Codex"
tags:
  - "Tavily"
  - "MCP"
  - "搜索"
  - "待探索"
category: "04_待探索"
slug: "knowledge-base/04_explore/tavily-and-its-mcp"
draft: false
---

# Tavily 还能用吗，怎么接成 MCP

## 来源

清理 moon-bridge 遗留时发现，旧 `config.yml` 里配过一个 Tavily key——它是那套
`web_search: injected` 的搜索后端。整套删掉之后的问题变成：这个 key 还留着干嘛。

## 它解决的问题

一个已经没人调用的第三方 API key，怎么判断它还有没有价值、值不值得接成工具。

## 待答问题

- ❓ MCP 是启动时加载还是能热加载？写出配置之后，当前这个会话里新工具会出现吗？
- ❓ 1000 credits/月里，一次 `tavily_search` / `tavily_extract` / `tavily_crawl` 各扣几次？
  先预测，再跑一次 `/usage` 对照。
- ❓ key 塞在 URL query（`?tavilyApiKey=`）和用 `--bearer-token-env-var` 传，区别在哪，哪种会被写进日志？

## 事实

- key 当前有效：`POST https://api.tavily.com/search` 返回 200，能正常拿到结果。
- 额度查询：`GET https://api.tavily.com/usage`，带 `Authorization: Bearer <key>`。返回
  `account.current_plan = "Researcher"`、`plan_limit = 1000`、`plan_usage = 0`。
- Tavily 有官方**远程 MCP**：`https://mcp.tavily.com/mcp/?tavilyApiKey=<key>`，
  `initialize` 握手返回 protocolVersion `2025-06-18`、serverInfo `tavily-mcp 4.0.4`。
- 它暴露 5 个工具：`tavily_search`、`tavily_extract`、`tavily_crawl`、`tavily_map`、`tavily_research`。
- Codex 侧注册：`codex mcp add tavily --url "https://mcp.tavily.com/mcp/?tavilyApiKey=<key>"`；
  本地 stdio 版本是 `npx -y tavily-mcp` 配 `TAVILY_API_KEY` 环境变量（npm 包 `tavily-mcp`）。
- 实际现象：`codex mcp add` 已经把 `[mcp_servers.tavily]` 写进 `config.toml`，但命令本身
  没有退出，挂了两分多钟，最后手动 kill；配置是生效的。

## 我的理解

## 相关问题

- [[DeepSeek 官方脚本会覆盖 Codex 配置]]
- [[API key 的副本与吊销]]

## 实践
