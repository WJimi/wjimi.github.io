---
title: "为什么脚本写出的 frontmatter 会校验失败？"
published: 2026-09-25
description: "手写的 frontmatter 一直没问题，脚本生成的却过不了内容校验"
tags:
  - "YAML"
  - "Astro"
category: "01_问题"
slug: knowledge-base/01_questions/why-generated-frontmatter-fails-validation
draft: false
---

# 为什么脚本写出的 frontmatter 会校验失败？

## 状态

 已解决

## 为什么现在出现

给 Codex 写 learning-system skill 时，脚本要自动生成笔记的 frontmatter。手写的 frontmatter 一直能过校验，脚本生成的却让 Firefly 报类型错误。

## 它依赖什么

只要知道"frontmatter 会被解析成数据结构"这一层就够了，不需要先学 YAML 规范。

## 它连接什么

- [[YAML 标量类型推断]] —— 结论记在这里

## 结论

字符串字段必须加引号，日期字段必须不加引号。原因是 YAML 会按写法推断类型，而内容 schema 对类型有硬要求。
