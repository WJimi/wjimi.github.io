---
title: "DeepSeek 官方脚本会覆盖 Codex 配置"
published: 2026-10-08
updated: 2026-10-13
description: "为什么改好的配置会自己变回明文：官方脚本每次重跑都会重写 provider 段，以及改成用 auth 命令取密钥的做法"
tags:
  - "Codex"
  - "DeepSeek"
  - "配置"
  - "密钥"
category: "02_知识"
slug: "knowledge-base/02_kownledge/deepseek-setup-script-overwrites-codex-config"
draft: false
---

# DeepSeek 官方脚本会覆盖 Codex 配置

## 来源

排查"把密钥改成环境变量之后，换密钥又连不上"时发现：改好的配置会自己变回去。

问题本身记在 [[密钥换掉了，为什么还是用旧的？]]。

## 它解决的问题

改好的配置莫名其妙失效，但不知道是谁改的。答案是有另一个程序在写同一个文件。

## 当前理解

`bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)`
不是一次性安装脚本，而是一个**配置管理器**，每次运行都会重写 `~/.codex/config.toml`：

- 删掉整个 `[model_providers.deepseek]` 段，然后重写，里面是**明文** `experimental_bearer_token`。
- 写入 `preferred_auth_method = "apikey"` —— 这个键 Codex 0.160 已经不认了，会报 "is ignored"。
- 它不认识的键会原样保留。`model_max_output_tokens` 就是这么活下来的，并不是脚本写的。
- 原配置备份在 `~/.codex/backup-deepseek/config.toml`，每次运行还会写 `manifest.txt`，里面有
  `installed_at` 时间戳 —— **判断"谁改了我的配置"，就看这个时间戳和文件修改时间对不对得上**。
- 它支持环境变量：如果 `DEEPSEEK_API_KEY` 已经存在，就直接用，不再问你要密钥。

## 相关问题

- [[环境变量是进程启动那一刻的复印件]]

## 实践

- 改成"让 Codex 运行命令去取密钥"，这样不依赖启动方式：

```toml
[model_providers.deepseek.auth]
command = "/bin/cat"
args = ["/home/wjimi/.config/codex/deepseek.key"]
```

- 密钥只剩 `~/.config/codex/deepseek.key`（600）一处。实测两种极端都能正常认证：
  删掉环境变量、以及故意塞一个无效的旧值 —— 说明环境变量这条路已经被彻底绕开。
- 重跑官方脚本后，跑 `bash ~/ovo/codex-fix-config.sh` 恢复（它会删掉明文段和那两个无效键、写回 auth 段、把权限收到 600）。
- 教训：改配置之前先确认**还有没有别的程序在写同一个文件**，否则自己的改动会被静默覆盖，而且很难发现。
