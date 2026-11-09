---
title: Git tips
updated: 2026-11-08
published: 2026-11-08
description: 原谅没用过Git的计算机专业老师
tags:
  - 命令行
category: 02_知识
slug: knowledge-base/02_kownledge/gitsth
draft: false
---

# Git 常用命令速查指南

## 1. 基础配置与初始化 (Config & Init)

| 命令 | 说明 | 备注 |
| :--- | :--- | :--- |
| `git config --global user.name "你的名字"` | 设置全局用户名 | 首次安装 Git 必做 |
| `git config --global user.email "你的邮箱"` | 设置全局邮箱 | 建议与 GitHub/Gitee 一致 |
| `git init` | 初始化本地仓库 | 在当前目录生成隐藏的 `.git` 文件夹 |
| `git clone <url>` | 克隆远程仓库到本地 | 例如 `git clone https://github.com/...` |
| `git help <command>` | 查看某个命令的帮助文档 | 例如 `git help add` |

## 2. 日常开发工作流 (Basic Workflow)

| 命令 | 说明 | 备注 |
| :--- | :--- | :--- |
| `git status` | 查看当前工作区和暂存区状态 | **最常用命令**，随时确认改了哪些文件 |
| `git add <file>` | 将指定文件添加到暂存区 | `git add .` 代表添加所有修改和新文件 |
| `git commit -m "提交信息"` | 将暂存区内容提交到本地仓库 | 提交信息务必清晰，说明本次修改的目的 |
| `git commit -am "提交信息"` | 添加**已被跟踪**的修改并提交 | 省去 `git add`，但**不包含新建的文件** |
| `git diff` | 查看工作区与暂存区的差异 | `git diff --staged` 查看暂存区与上次提交的差异 |

## 3. 撤销与回退 (Undo & Reset) - 🌟 救命指南

| 命令 | 说明 | 危险指数 |
| :--- | :--- | :--- |
| `git restore <file>` | 撤销工作区的修改（丢弃未暂存的修改） | ⚠️ 修改会丢失 |
| `git restore --staged <file>` | 将文件从暂存区撤出（取消 `git add`） | 安全 |
| `git reset --soft HEAD~1` | 撤销上一次 `commit`，保留修改在**暂存区** | 安全 |
| `git reset --mixed HEAD~1` | 撤销上一次 `commit`，保留修改在**工作区**（默认） | 安全 |
| `git reset --hard HEAD~1` | 撤销上一次 `commit`，**丢弃所有修改** | ☠️ 极度危险 |
| `git checkout -- <file>` | 旧版撤销修改命令（同 `git restore`） | ⚠️ 修改会丢失 |

## 4. 分支管理 (Branching)

| 命令 | 说明 | 备注 |
| :--- | :--- | :--- |
| `git branch` | 查看本地分支列表 | `-a` 查看所有（含远程），`-v` 查看最后一次提交 |
| `git branch <branch-name>` | 创建新分支 | 停留在当前分支 |
| `git switch <branch-name>` | 切换到指定分支 | 新版推荐命令 |
| `git checkout <branch-name>` | 切换到指定分支 | 旧版命令，也可用于切换 |
| `git switch -c <branch-name>` | **创建并切换**到新分支 | 等于 `git checkout -b` |
| `git merge <branch-name>` | 将指定分支合并到**当前**分支 | 需先切换到接收合并的分支 |
| `git branch -d <branch-name>` | 删除已合并的分支 | `-D` 强制删除未合并的分支 |

## 5. 远程同步 (Remote & Sync)

| 命令 | 说明 | 备注 |
| :--- | :--- | :--- |
| `git remote -v` | 查看当前关联的远程仓库地址 | `origin` 是默认远程名 |
| `git remote add <name> <url>` | 添加远程仓库 | 如 `git remote add origin <url>` |
| `git pull` | 拉取远程更新并合并到本地 | 相当于 `git fetch` + `git merge` |
| `git push` | 将本地提交推送到远程 | 首次推送需 `git push -u origin <branch>` |
| `git push origin --delete <branch>` | 删除远程分支 | 危险操作需谨慎 |

## 6. 查看历史与日志 (Log)

| 命令 | 说明 | 备注 |
| :--- | :--- | :--- |
| `git log` | 查看详细提交历史 | 按 `q` 退出 |
| `git log --oneline --graph` | **图形化**查看简洁的提交历史 | 强烈推荐，分支合并一目了然 |
| `git reflog` | 查看所有分支的本地操作记录（含回退记录） | ☠️ 误操作 `reset` 后的**后悔药** |

## 7. 忽略文件 (.gitignore) - 针对你的需求

| 命令 / 操作 | 说明 | 备注 |
| :--- | :--- | :--- |
| 编辑 `.gitignore` 文件 | 写入 `文件夹名/` 或 `*.后缀` | 只对**未被 Git 跟踪**的文件生效 |
| `git rm -r --cached <文件夹>` | **取消跟踪**已被 Git 跟踪的文件夹 | 保留本地文件，仅从 Git 索引删除 |
| `git rm <file>` | 删除文件并取消跟踪 | 连本地文件一起删除 |

---

**💡 VS Code 实用小贴士：**
1. 在 VS Code 左侧源代码管理（分支图标）面板中，点击文件右侧的 `+` 号，等同于 `git add`。
2. 面板顶部的 `✓` 号等同于 `git commit`（需输入信息）。
3. 面板顶部的 `...` 菜单里，可以找到 `拉取 (Pull)`、`推送 (Push)`、`克隆 (Clone)` 等操作。