---
title: "Python 项目的层次与 JetBrains 的边界"
published: 2026-11-19
category: "02_知识"
slug: "knowledge-base/02_kownledge/python-project-structure-and-jetbrains"
draft: true
---

# Python 项目的层次与 JetBrains 的边界

## 来源

整理现有 Python 项目，并回答“Java 的项目、模块、包、类在 Python 中如何对应”时产生。

## 它解决的问题

区分 Python 工作区、发布单元、导入包、模块与 IDE 工程，避免把 PyCharm 的 `.idea`、`venv` 或单个 `.py` 文件误当成项目结构。

普通脚本目录不需要 `src/`、`pyproject.toml` 或虚拟环境；长期维护、需要导入和测试的项目才值得建立完整结构。

## 待答问题

- ❓ 把当前一个单文件脚本改成可导入包时，最小需要增加哪些文件和目录？
- ❓ 同样是 `python main.py` 和 `python -m package`，模块搜索路径分别从哪里开始？
- ❓ 删除 `.idea` 后项目还能运行吗？在 PyCharm 中把目录标记为 Sources Root 又会改变什么？

## 事实

- Python 的 module 是导入单元，通常是 `.py` 文件；package 是带层级的导入命名空间，通常对应目录。
- Java 的 project、module 主要是 IDE/构建工具概念；Python 的 project 也常用于工作区或发布单元，含义取决于上下文。
- `.idea` 和 `.iml` 是 JetBrains 的项目元数据；`pyproject.toml`、`src/`、`tests/` 和 `venv` 不是 JetBrains 专有结构。
- `venv` 保存某个解释器及依赖，不应与源码一起复制或迁移；位置改变或基础解释器改变后应重新创建。
- `__pycache__`、虚拟环境、IDE 配置是生成物或本机状态，不是项目源码的一部分。

## 我的理解

## 相关问题

## 实践
