---
title: YAML 标量类型推断
published: 2026-09-25
description: 为什么同一份 frontmatter，手写的能通过校验，脚本生成的会报类型错误
tags:
  - YAML
  - Astro
  - Firefly
category: 02_知识
slug: knowledge-base/02_kownledge/yaml-scalar-type-inference
draft: false
---

# YAML 标量类型推断

## 来源

解决 [[为什么脚本写出的 frontmatter 会校验失败？]] 时产生。

## 它解决的问题

YAML 不是纯文本格式，它会**推断类型**。所以 `title: 2026` 和 `title: "2026"` 解析后不是同一个东西——前者是数字，后者才是字符串。

## 当前理解

Firefly 的 frontmatter 由 js-yaml（gray-matter 的底层）解析，裸标量会被推断成各自的类型：

| 写法 | 解析结果 |
| --- | --- |
| `title: true` | boolean |
| `title: 2026` | number 2026 |
| `title: 2026-09-25` | Date |
| `title: null` 或 `~` | null |
| `title: 0755` | number 755 |
| `title: 1_000` | number 1000 |

而 `src/content.config.ts` 要求 `title`、`description`、`category` 是 `z.string()`，`tags` 是 `z.array(z.string())`。上面这些写法会让 `pnpm check` 和构建直接报错。

反过来，`published` **必须裸写** `YYYY-MM-DD`：schema 要的是 Date，加了引号反而变成 string 而校验失败。

所以规则是：**字符串字段一律加引号，日期字段一律不加引号。**

## 相关问题

- YAML 1.1 和 1.2 对 `No` / `yes` / `on` 的类型判断不同，换解析器会不会又出问题？

## 实践

不要凭印象猜解析结果，直接用仓库里已有的解析器验一遍：

```bash
node -e "console.log(require('js-yaml').load('k: 2026-09-25'))"
```

生成 frontmatter 时用 `json.dumps(..., ensure_ascii=False)`：JSON 的双引号标量是合法 YAML，而且一定是字符串。
