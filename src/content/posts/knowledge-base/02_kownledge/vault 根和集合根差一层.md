---
title: "vault 根和集合根差一层"
published: 2026-09-28
description: "src/content 是 Obsidian 的 vault 根，src/content/posts 才是博客集合根；写错位置不会报错，但会让链接指到空文件"
tags:
  - "Obsidian"
  - "Firefly"
  - "知识管理"
category: "02_知识"
slug: "knowledge-base/02_kownledge/vault-root-vs-collection-root"
draft: false
---

# vault 根和集合根差一层

## 来源

在 `src/content` 直下发现过这样的残留：`knowledge-base/01_questions/which-direction.md`、
`knowledge-base/03_projects/automation/buff-trade-automation.md`——都是 0 字节，
文件名正好是某篇真笔记 slug 的最后一段。

它们是把 **slug 当成相对 `src/content` 的路径**写下来的产物：真正该落的位置是
`src/content/posts/<slug>.md`，少写了 `posts/` 这一层。

## 它解决的问题

笔记到底该写到哪一层？为什么写到 `src/content` 直下既不报错、又确实会出问题？

## 当前理解

两个"根"只差一层，但归属完全不同：

| | 路径 | 谁在用 |
| --- | --- | --- |
| Obsidian 的 vault 根 | `src/content` | `.obsidian` 在这里，文件树从这里展开 |
| 博客的集合根 | `src/content/posts` | Astro 的 `postsCollection`，glob 的 base 就是它 |

另有 `src/content/dynamic`（动态）和 `src/content/spec`（特殊页）两个独立集合。

后果分两半，这也是它难被发现的原因：

- **博客侧没事**：`src/content/knowledge-base/...` 不在任何集合的 base 里，Astro 直接忽略，
  既不报错也不上站，`check_links.py` 也扫不到它。
- **Obsidian 侧出事**：vault 根是 `src/content`，所以在 Obsidian 眼里它是真文件。
  文件树里会多出一个 `knowledge-base` 文件夹；重名时 Obsidian 要在多个候选里挑一个，
  挑中的不一定是那篇真笔记（它偏好更短的路径）。`app.json` 里
  `alwaysUpdateLinks: true`，改名或移动时还会顺手把链接改写成指向它。

所以症状是"链接点开是空的、或者指到别处"，而不是构建失败。

## 相关问题

- [[knowledge-base/01_questions/why-wiki-links-404|为什么双链会指不到笔记？]]
- [[knowledge-base/02_kownledge/firefly-wiki-link-resolution|Firefly 双链解析规则]]

## 实践

查一遍有没有写错位置的残留：

```bash
# src/content 直下应该只有这几个目录
ls src/content        # .obsidian  .trash  dynamic  posts  spec

# 全库找"不在 posts 下的空 md"
find src/content -name "*.md" -size 0 -not -path "*/posts/*"
```

真正的知识库根只有一条路径：`src/content/posts/knowledge-base`。
写笔记一律走 `new_note.py`（它的 `--kb` 默认就是这个绝对路径，`--dir` 只填
`02_kownledge` 这种子目录），别自己按 slug 拼路径。
