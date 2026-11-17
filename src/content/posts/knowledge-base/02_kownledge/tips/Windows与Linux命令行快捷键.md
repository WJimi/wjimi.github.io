---
title: Windows 与 Linux 命令行快捷键
updated: 2026-10-13
published: 2026-10-06
description: CMD / PowerShell / Bash 编辑浏览时常用的快捷键对照，它们又为何不一样
tags:
  - 命令行
  - 快捷键
  - Windows
  - Linux
category: 02_知识
slug: knowledge-base/02_kownledge/tips/windows-linux-cli-shortcuts
draft: false
---

# Windows 与 Linux 命令行快捷键

CMD、PowerShell、Bash 三套命令行里编辑和浏览的快捷键各不相同，来回切换时记不住哪套管用。

下面分别列出 **Windows 命令行** 与 **Linux 命令行** 常用的编辑快捷键。  
需要先说明一点：Windows 下不同命令行环境的编辑能力差异很大——**CMD（命令提示符）** 的快捷键比较古老，而 **PowerShell** 因为内置了 `PSReadLine` 模块，支持大量类似 Linux 的快捷键。Linux 下则通常以 **Bash / Readline** 为准，Zsh 等也高度兼容。

## 一、Linux 命令行编辑快捷键（Bash / Readline）

以下快捷键适用于大多数 Linux 终端中的 Bash shell，也适用于 Zsh、Python 交互式环境等使用了 Readline 库的程序。

| 快捷键        | 功能                  |
| ---------- | ------------------- |
| `Ctrl + A` | 移到行首                |
| `Ctrl + E` | 移到行尾                |
| `Ctrl + B` | 左移一个字符              |
| `Ctrl + F` | 右移一个字符              |
| `Alt + B`  | 左移一个单词              |
| `Alt + F`  | 右移一个单词              |
| `Alt + D`  | 删除光标后一个单词           |
| `Ctrl + U` | 删除从光标到行首            |
| `Ctrl + K` | 删除从光标到行尾            |
| `Ctrl + W` | 删除光标前一个单词           |
| `Ctrl + Y` | 粘贴之前删除的文本           |
| `Ctrl + R` | 反向搜索历史命令            |
| `Ctrl + S` | 正向搜索历史命令（可能被终端流控占用） |
| `Ctrl + G` | 退出搜索模式              |
| `Ctrl + C` | 中断当前命令              |
| `Ctrl + D` | 退出当前 shell / 发送 EOF |
| `Ctrl + Z` | 挂起当前进程              |
| `Ctrl + P` | 上一条历史命令             |
| `Ctrl + N` | 下一条历史命令             |
| `Alt + .`  | 插入上一条命令的最后一个参数      |
| `Ctrl + _` | 撤销上一次编辑             |
| `Ctrl + T` | 交换光标处两个字符           |
| `Alt + T`  | 交换两个单词              |
| `Ctrl + V` | 插入特殊字符              |
| `Ctrl + Q` | 恢复终端输出（流控）          |

> 如果 `Ctrl + S` 无效，通常是因为终端流控（XON/XOFF）占用了它，可以用 `stty -ixon` 关闭流控后再使用。


## 二、Windows 命令行编辑快捷键

### 1. PowerShell（PSReadLine）常用快捷键

| 快捷键                | 功能            |
| ------------------ | ------------- |
| `Ctrl + Home`      | 删除从光标到行首      |
| `Ctrl + W`         | 删除光标前一个单词     |
| `Ctrl + Backspace` | 删除前一个单词       |
| `Ctrl + Y`         | 粘贴之前删除的文本     |
| `Ctrl + R`         | 反向搜索历史命令      |
| `Ctrl + L`         | 顶屏(不清空历史的cls) |
| `Ctrl + C`         | 取消当前命令        |
| `Tab`              | 自动补全          |
| `↑ / ↓`            | 浏览历史命令        |
| `← / →`            | 左右移动光标        |
| `Home / End`       | 行首 / 行尾       |

> PowerShell 的快捷键由 `PSReadLine` 提供，风格接近 Bash，但部分组合键可能与 Windows 系统快捷键冲突。


### 2. CMD（命令提示符）常用快捷键

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

想深入某一条快捷键的底层机制（比如 Readline 如何管理编辑缓冲区）？以后再探索吧~

在Windows命令行中重启 `explorer.exe`，核心思路是**先强制结束该进程，再重新启动它**。操作本身很简单，但结束进程的瞬间，桌面和任务栏会暂时消失，这属于正常现象。

### 💻 方法一：使用CMD命令提示符（最常用）

**单行命令（推荐）**  
打开命令提示符（CMD），直接复制并执行下面这行命令：

cmd

taskkill /f /im explorer.exe & start explorer.exe

这条命令会先用 `/f` 参数强制结束资源管理器，紧接着 `start` 命令会重新启动它，桌面会立刻恢复。你也可以用 `&&` 替代 `&`，效果相同。[](https://cloud.tencent.cn/developer/article/2544231)

**分步执行**  
如果你想看得更清楚，也可以分两步手动操作：

1. **结束进程**：输入 `taskkill /f /im explorer.exe`，按回车。此时桌面会变黑或图标消失。
    
2. **重新启动**：立刻输入 `start explorer.exe` 或直接输入 `explorer.exe`，按回车，桌面就会恢复。
    

### ⚡ 方法二：使用PowerShell（更现代）

如果你习惯用 PowerShell，同样有一行命令可以完成重启：

powershell

Stop-Process -Name explorer -Force; Start-Process explorer

这条命令的作用与CMD版本完全一致，`Stop-Process` 负责强制结束，`Start-Process` 负责重新启动。[](https://www.ninjaone.com/blog/restart-the-explorer-exe-process-in-windows/#1)

### 📁 进阶技巧：创建一键重启的批处理文件

如果你需要频繁重启资源管理器，可以制作一个“一键重启”工具。

1. 在桌面上新建一个文本文档。
    
2. 打开文档，输入这行命令：`taskkill /f /im explorer.exe & start explorer.exe`
    
3. 保存文件，然后将文件名后缀从 `.txt` 修改为 `.bat`（例如 `重启资源管理器.bat`）。
    
4. 以后双击这个 `.bat` 文件，就能自动完成重启操作。
    

### ⚠️ 重要注意事项

- **需要管理员权限**：如果执行 `taskkill` 时提示“拒绝访问”，说明当前CMD或PowerShell窗口没有管理员权限。你需要右键点击程序，选择“**以管理员身份运行**”后再操作。
    
- **已打开的文件窗口会关闭**：重启 `explorer.exe` 会关闭当前所有已打开的文件资源管理器窗口，但**不会关闭你正在运行的应用程序**（如浏览器、Word等）。
