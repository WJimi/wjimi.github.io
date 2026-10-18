---
title: "shell 启动文件的四种读法"
updated: 2026-10-13
published: 2026-10-07
description: "交互式/非交互式、登录/非登录这四种 shell 各读哪个启动文件；.bashrc 的守卫为什么会让脚本拿不到变量"
tags:
  - "Linux"
  - "bash"
  - "shell"
  - "启动文件"
category: "02_知识"
slug: "knowledge-base/02_kownledge/why-bashrc-needs-new-terminal"
draft: false
---

# shell 启动文件的四种读法

## 来源

接着 [[环境变量是进程启动那一刻的复印件]] 产生的问题：为什么把 `export` 写在 `~/.bashrc` 里，
手敲 `codex` 有密钥，脚本和 IDE 里却拿不到？

问题本身记在 [[为什么改了 .bashrc 要重开终端]]。

## 它解决的问题

shell 每次启动都要先决定"该读哪些启动文件"。读哪个不由人规定，而是由两个问题决定。

## 当前理解

两个问题：

1. 有没有人坐在键盘前敲？→ 有 = 交互式，没有 = 非交互式
2. 它是不是这次会话的第一个 shell？→ 是 = 登录 shell

四种组合读不同的文件。Ubuntu 上交互式非登录 shell 读 `~/.bashrc`，登录 shell 读 `~/.profile`
（而 `.profile` 第 13-15 行又会转手加载 `.bashrc`，所以登录 shell 两条路都走）。

关键在 `.bashrc` 开头的那段守卫：

```bash
case $- in
    *i*) ;;
      *) return;;
esac
```

不是交互式就立刻 return，后面的行全部不读。

`cron`、IDE 插件这些名字说的不是 shell 的种类，而是**启动者**——是谁创建了这个进程。
它们不经过你的终端，环境由它们自己决定。

同一台机器上的实测：

- `env -u DEEPSEEK_API_KEY bash -c '...'` → 空：非交互式 shell 根本不读 `.bashrc`
- 同一个命令加上 `BASH_ENV=/tmp/envdemo.sh` → 有值：非交互式 shell 有自己的投递通道

由此得到的结论：把 `export` 挪到守卫**之前**也救不了非交互式场景，因为那个场景压根不打开这个文件。
问题不在"写在第几行"，而在"选错了文件"。

## 相关问题

- [[环境变量是进程启动那一刻的复印件]]

## 实践

- 密钥放在 `~/.config/codex/secrets.env`（600），`.bashrc` 里只用 `.` 引用它。这样交互式终端有密钥，
  而这个文件同时也是脚本可以显式 `. ` 进来的唯一来源。
- 想知道某个变量在某种启动方式下到底存不存在，不要凭记忆，直接对照着跑：
  `env -u VAR bash -c 'echo ${VAR:-空}'` 和 `env -u VAR bash -i -c 'echo ${VAR:-空}'`。
- 待探索：cron 和 IDE 插件各自注入环境变量的正规做法（systemd user environment、工具自身的 env 配置）。
