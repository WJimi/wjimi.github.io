---
title: "Windows 与 Linux 命令行快捷键"
published: 2026-10-06
description: "CMD / PowerShell / Bash 三套命令行里编辑和浏览时最常用的快捷键对照，以及它们为什么不一样"
tags:
  - "命令行"
  - "快捷键"
  - "Windows"
  - "Linux"
category: "02_知识"
slug: "knowledge-base/02_kownledge/windows-linux-cli-shortcuts"
draft: false
---

下面分别列出 **Windows 命令行** 与 **Linux 命令行** 常用的编辑快捷键。  
需要先说明一点：Windows 下不同命令行环境的编辑能力差异很大——**CMD（命令提示符）** 的快捷键比较古老，而 **PowerShell** 因为内置了 `PSReadLine` 模块，支持大量类似 Linux 的快捷键。Linux 下则通常以 **Bash / Readline** 为准，Zsh 等也高度兼容。

---

## 一、Windows 命令行编辑快捷键

### 1. CMD（命令提示符）常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `F1` | 逐个字符复制上一条命令 |
| `F2` | 复制上一条命令到指定字符 |
| `F3` | 重复上一条命令 |
| `F4` | 删除到指定字符 |
| `F5` | 向前循环浏览历史命令 |
| `F6` | 插入文件结束符 `^Z` |
| `F7` | 显示历史命令菜单 |
| `F8` | 搜索历史命令 |
| `F9` | 按编号选择历史命令 |
| `Alt + F7` | 清除历史命令 |
| `Esc` | 清除当前命令行 |
| `Insert` | 切换插入 / 覆盖模式 |
| `↑ / ↓` | 浏览历史命令 |
| `← / →` | 左右移动光标 |
| `Home / End` | 移动到行首 / 行尾 |
| `Ctrl + C` | 取消当前命令 |
| `Tab` | 自动补全文件名 / 目录 |

> CMD 的编辑能力有限，不支持 `Ctrl+A`、`Ctrl+E` 这类行内跳转。

### 2. PowerShell（PSReadLine）常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + A` | 移到行首 |
| `Ctrl + E` | 移到行尾 |
| `Ctrl + B` | 左移一个字符 |
| `Ctrl + F` | 右移一个字符 |
| `Alt + B` | 左移一个单词 |
| `Alt + F` | 右移一个单词 |
| `Ctrl + U` | 删除从光标到行首 |
| `Ctrl + K` | 删除从光标到行尾 |
| `Ctrl + W` | 删除光标前一个单词 |
| `Ctrl + Backspace` | 删除前一个单词 |
| `Ctrl + Y` | 粘贴之前删除的文本 |
| `Ctrl + R` | 反向搜索历史命令 |
| `Ctrl + L` | 清屏 |
| `Ctrl + C` | 取消当前命令 |
| `Tab` | 自动补全 |
| `↑ / ↓` | 浏览历史命令 |
| `← / →` | 左右移动光标 |
| `Home / End` | 行首 / 行尾 |

> PowerShell 的快捷键由 `PSReadLine` 提供，风格接近 Bash，但部分组合键可能与 Windows 系统快捷键冲突。

---

## 二、Linux 命令行编辑快捷键（Bash / Readline）

以下快捷键适用于大多数 Linux 终端中的 Bash shell，也适用于 Zsh、Python 交互式环境等使用了 Readline 库的程序。

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + A` | 移到行首 |
| `Ctrl + E` | 移到行尾 |
| `Ctrl + B` | 左移一个字符 |
| `Ctrl + F` | 右移一个字符 |
| `Alt + B` | 左移一个单词 |
| `Alt + F` | 右移一个单词 |
| `Ctrl + U` | 删除从光标到行首 |
| `Ctrl + K` | 删除从光标到行尾 |
| `Ctrl + W` | 删除光标前一个单词 |
| `Alt + D` | 删除光标后一个单词 |
| `Ctrl + Y` | 粘贴之前删除的文本 |
| `Ctrl + R` | 反向搜索历史命令 |
| `Ctrl + S` | 正向搜索历史命令（可能被终端流控占用） |
| `Ctrl + G` | 退出搜索模式 |
| `Ctrl + L` | 清屏 |
| `Ctrl + C` | 中断当前命令 |
| `Ctrl + D` | 退出当前 shell / 发送 EOF |
| `Ctrl + Z` | 挂起当前进程 |
| `Ctrl + P` | 上一条历史命令 |
| `Ctrl + N` | 下一条历史命令 |
| `↑ / ↓` | 浏览历史命令 |
| `Tab` | 自动补全命令 / 文件名 |
| `Alt + .` | 插入上一条命令的最后一个参数 |
| `Ctrl + _` | 撤销上一次编辑 |
| `Ctrl + T` | 交换光标处两个字符 |
| `Alt + T` | 交换两个单词 |
| `Ctrl + V` | 插入特殊字符 |
| `Ctrl + Q` | 恢复终端输出（流控） |

> 如果 `Ctrl + S` 无效，通常是因为终端流控（XON/XOFF）占用了它，可以用 `stty -ixon` 关闭流控后再使用。

---

## 三、 WSL 环境

- 在 **WSL 里的 Kali / Ubuntu 终端**中，遵循的是上面 **Linux 表**的快捷键。
- 在 **Windows PowerShell** 中，遵循的是 **PowerShell 表**（PSReadLine），大部分与 Linux 一致。
- 在 **CMD** 中，只能用第一张表的古老快捷键，建议尽早过渡到 PowerShell 或 WSL。

掌握这些快捷键后，你在命令行里编辑长命令、快速修改参数、搜索历史都会顺手很多。想深入某一条快捷键的底层机制（比如 Readline 如何管理编辑缓冲区）别问我
