---
title: AI Agent
updated: 2026-11-07
published: 2026-11-07
description: 代替还是替代
tags:
  - 快捷键
category: 02_知识
slug: knowledge-base/02_kownledge/AIgent
draft: false
---

**注意：还有一个未纳入本次删除范围的第三代 fork：`01a148fb-9094-7ea0-8f99-f8897b56e680`。** 它原本是从你刚刚删除的第二个会话 fork 出来的，因此现在可能成为 lineage 不完整的孤立会话；选择器里仍可能看到一条 `Navigate with cd command`。

## Codex CLI
### `/delete` 为什么失败了

从 0.167 的日志看：

- 客户端和后台 daemon 都已经是 `0.167.0`。
- `/delete` 请求确实发送到了后台。
- 两次尝试时都明确记录 `had_active_turn=false`。
- 后台已经关闭会话监听器，但没有产生最终的 `thread/deleted` 成功事件。
- 当时的 SQLite 数据库完整性正常。

所以失败原因不是“任务正在运行”，也不是 SQLite 损坏，更像是后台删除 fork/线程树时出现了失败，而 TUI 只显示了笼统的 `Failed to delete session`。数据库和日志没有保留更底层的原因。

### Active 到底是什么

Codex 里有两种容易混淆的“Active”：

1. **选择器中的 Active 状态**
   
   表示会话已经保存且没有归档。它可以是空闲的、几个月没打开的，也可以是正在运行的。`Archived` 只是从常用列表隐藏，文件仍然保留。

2. **正在运行中的 active turn**
   
   表示此刻模型正在推理、调用工具或运行子 agent。只有这种 Active 才会阻止 `/delete`。

你截图里显示 `Conversation interrupted`，而日志也是 `had_active_turn=false`，所以属于第一种 Active：**未归档，但当前空闲**。

### Codex CLI 核心功能

| 操作            | 命令                                | 含义                      |
| ------------- | --------------------------------- | ----------------------- |
| 新建会话          | `codex`                           | 在当前目录启动新会话              |
| 在同一 CLI 中新建会话 | `/new`                            | 创建新的 thread             |
| 清屏并新建会话       | `/clear`                          | 清空界面并开始新上下文             |
| 恢复会话          | `codex resume`、`/resume`          | 继续原 thread，不创建副本        |
| 指定 UUID 恢复    | `codex resume <UUID>`             | 最准确的恢复方式                |
| Fork          | `codex fork`、`/fork`              | 复制历史并生成新的 UUID          |
| 重命名           | `/rename`                         | 给会话设置可识别名称              |
| 归档            | `/archive`、`codex archive <UUID>` | 隐藏但保留 transcript        |
| 恢复归档          | `codex unarchive <UUID>`          | 重新放入 Active 列表          |
| 删除当前会话        | `/delete`                         | 只能删除当前聊天                |
| CLI 外删除       | `codex delete <UUID> --force`     | 建议先准备 UUID              |
| 查看当前状态        | `/status`                         | 目录、模型、权限、UUID、token     |
| 释放上下文         | `/compact`                        | 压缩长会话，保留问题主线            |
| 修改权限          | `/permissions`                    | 在只读、审批、完全访问间切换          |
| 修改模型          | `/model`                          | 切换模型和 reasoning effort  |
| 查看子 agent     | `/subagents`                      | 切换当前会话的 subagent thread |
| 导出会话          | `/export`                         | 导出 Markdown transcript  |
| 非交互调用         | `codex exec "任务"`                 | 适合脚本、CI 和批处理            |
| 诊断环境          | `codex doctor`                    | 检查配置、服务、版本和线程状态         |

### 管理会话的正确心智模型

Codex 中最重要的对象是：

- **Session/Thread**：一条有独立 UUID 的会话。
- **Turn**：一次“用户提出请求到 agent 完成响应”的执行周期。
- **Task**：当前正在执行的 turn，可能包含工具调用或多个子任务。
- **Fork**：复制原历史的新 thread，UUID 不同、标题通常相同。
- **Subagent**：主会话派生出来的子 thread，用于并行调查或分工。
- **Archive**：收纳，不删除。
- **Delete**：永久删除 transcript 和相关文件。

推荐规则：

1. 一个 thread 只承载一个连续目标。
2. 同一问题的后续修改用 resume，不要反复 fork。
3. 真正需要比较两个方案时才 fork。
4. 临时问题用 `/side` 或 `/btw`，不要制造新的主会话。
5. 会话变长但目标没变，用 `/compact`。
6. 完成的任务优先 `/archive`，确定不要时才删除。
7. 用 UUID 做删除等破坏性操作，不要依赖重复标题。
8. Fork 后立即 `/rename`，例如 `ZL-原始`、`ZL-方案B`。
9. `/status` 先检查目录和权限，避免 agent 在错误目录工作。
10. CLI、TUI 和后台 daemon 尽量保持同一版本。
11. 不要经常直接修改 SQLite；只在备份后进行最小范围事务，并在结束后重启 TUI。
12. 让 Codex 修改代码前先建立 Git checkpoint，修改后要求测试和审查。

### 调用 AI Agent 的技巧

高质量任务描述应包含五项：

```text
目标：要实现或解决什么
上下文：相关文件、错误、约束和历史
范围：允许改哪些地方，不能改哪些地方
验收：运行哪些测试，什么结果算成功
交付：需要代码、解释、报告还是提交
```

复杂任务可以这样下指令：

```text
先检查现状，不要立即修改。
列出关键证据和风险。
制定最小改动方案。
执行后运行相关测试。
最后汇报改了什么、为什么改、验证结果和剩余风险。
```

需要并行调查时，明确说：

```text
用 subagent 分别调查 A、B、C，保留主线程汇总。
```

Agent、Subagent、Skill、MCP 的区别：

- **Agent**：负责理解目标、决策和执行。
- **Subagent**：围绕独立子任务并行工作，最后回到主线程汇总。
- **Skill**：沉淀下来的固定工作方法和步骤。
- **MCP**：连接数据库、搜索、浏览器、第三方系统等外部能力。
- `AGENTS.md`：约束某个仓库内所有 agent 的长期规则。
