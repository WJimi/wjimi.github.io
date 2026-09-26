---
title: Firefly 双链解析规则
published: 2026-09-25
updated: 2026-09-26
description: 链接目标按 slug、文件路径、裸文件名三步匹配，和 Obsidian 不是一套规则
tags:
  - Firefly
  - Obsidian
  - 知识管理
category: 02_知识
slug: knowledge-base/02_kownledge/firefly-wiki-link-resolution
draft: false
---

# Firefly 双链解析规则

## 来源

解决 [[为什么双链会指不到笔记？]] 时产生。

## 它解决的问题

同一句 `[[...]]`，为什么在 Obsidian 里点得动，构建出来的站点上却是死链？

## 当前理解

Obsidian 和 Firefly 是两套独立的解析器，规则不一样，不能拿一方的直觉推另一方。

Firefly 的解析顺序（`src/plugins/remark-wiki-link.js`，前一步命中就不看后面）：

| 顺序 | 目标写法 | 例子 |
| --- | --- | --- |
| 1 | frontmatter 的 `slug` | `[[firefly-wiki-link]]` |
| 2 | 相对 `posts/` 的文件路径 | `[[guide/firefly-layout-system]]` |
| 3 | 裸文件名，全站唯一才成立 | `[[firefly-layout-system]]` |

由此推出几条会踩的：

- `slug` 是 Firefly 独有的概念，Obsidian 不读 frontmatter 的 slug，所以按 slug 写的链接在 Obsidian 里点不动。
- 裸文件名撞名时 Firefly 只警告然后跳过，链接变死链；Obsidian 在自己的 vault 里可能照样点得动。同一句链接两边表现不同，就出在这里。
- 匹配不到任何文章时 Firefly 仍然生成链接，只是指向不存在的 URL。**没有"悬空链接只是提示"这回事。**
- 目标开头多写 `posts/` 会被自动去掉，`../` 不行，会按原文显示。
- `[[目标#标题]]` 是文章内锚点，`[[#标题]]` 是本页锚点，单独成段的 `[[目标]]` 渲染成卡片。

### 文件名还会影响链接，这是第二个环节

目标找得到不等于点得开。URL 是两边分别生成的：

| 环节 | URL 从哪来 |
| --- | --- |
| 页面本身 | **slug 化后的文件名**：空格 → `-`、大写变小写、标点丢掉 |
| 链接插件 | **原始文件名**，原样编码 |

两者不一致，链接点开就是 404。中文标点、空格、大写都会踩到（`frontmatter 会` → `frontmatter-会`，`？` 直接丢掉，`README` → `readme`）。

修法是在 frontmatter 里声明 `slug:`（ASCII，形如 `knowledge-base/02_kownledge/xxx`）。声明之后两边都用 slug，文件名和标题怎么写都不影响链接，URL 也更干净。

这条是被真实 404 打出来的：四篇中文文件名的笔记全部点不开，加了 slug 之后恢复正常。

## 图片的位置、命名和清理

### 图片没有解析器，框架一步都不管

链接有三步解析，图片一步都没有。正文里的 `![alt](../../images/x.png)` 对 Firefly 来说就是一条普通相对路径：文件不存在不报错、不提示，只是静默裂图；图片没被任何笔记引用也没人管。`![[图片]]` 附件嵌入至今不支持，会按原文显示。

所以图片的秩序没有机制兜底，只能靠约定。三种失效都真实出现过：

| 失效 | 例子 |
| --- | --- |
| 裂图 | `SXCTF_WP.md` 引用 `Pasted image 20260718112519.png`，目录里实际叫 `image-20260718112519.png` |
| 孤儿 | `images/cs2_260814.jpg`、`images/image-20230616171958437.png` 等没有任何笔记引用 |
| 名字带空格 | 就是上面那处裂图：markdown 的 `![]()` 目标遇空格即断，链接本身就是坏的 |

### 位置：图片全放 `posts/images/`，正文写相对路径

`posts/images/` 是知识库和博客共用的一层，图片不放笔记目录里。好处是知识目录只剩 `.md`，图和正文互不干扰。

**但相对路径的写法取决于笔记的层级**，这一点比想象中容易错：

| 笔记位置 | 正文写法 |
| --- | --- |
| `knowledge-base/02_kownledge/x.md` | `../../images/名字` |
| `knowledge-base/review/x.md` | `../../images/名字` |
| `knowledge-base/03_projects/web/x.md` | `../../../images/名字` |

前两个是两层，回退两次到 `posts/`；`03_projects/web/` 多一层，就得多回退一次。`GAME/` 里那套「图和笔记同目录 + `![](图名.png)`」是另一种写法，在它自己那层能用，但笔记一挪目录就断，知识库里不要用。

### 命名：图片名要说清属于哪篇

| 名字 | 问题 |
| --- | --- |
| `ascii_1.png` | 通用名，会撞车；删笔记时找不到该清理哪张 |
| `image-20260726120849958.png` | 唯一，但没有归属 |
| `sqli-ascii-printable.png` | 前缀 = 笔记 slug 末段，一眼看出属于谁 |

规则：**图片名 = 笔记 slug 的最后一段 + 内容**，短横线连接，不要空格（markdown 目标遇空格即断），不要中文标点。同一篇的所有图共享前缀，`ls images | grep ^sqli` 一次捞全，删笔记时也一次删干净。

不按笔记建子目录（`images/sqli/...`）：现在建会得到一堆只装一个文件的目录，而且 Obsidian 粘贴时还得手动挪。等某个主题的图超过十来张再开子目录，正文改成 `../../images/主题/名字`，位置规则不变。

### 清理：没有机制，得自己扫

两个方向：引用了但不存在的图（裂图），存在但没人引用的图（孤儿）。`check_links.py` 只管 `[[...]]` 双链，图片一律不看，所以得单独扫。

在 `src/content/posts/` 下跑：

```python
python3 - <<'PY'
import re, pathlib

body_ref  = re.compile(r"!\[[^\]]*\]\((?:\.\./)+images/([^\s)\"'`）]+)\)")
cover_ref = re.compile(r"^\s*image:\s*[\"']?[^\"'\s]*?images/([^\"'\s]+)", re.M)

def strip_code(text):        # 去掉围栏代码块和行内代码，别把示例路径当真引用
    kept, in_fence = [], False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            kept.append(re.sub(r"`[^`\n]*`", "", line))
    return "\n".join(kept)

used = set()
for md in pathlib.Path(".").rglob("*.md"):
    text = md.read_text("utf-8", errors="replace")
    used |= set(cover_ref.findall(text)) | set(body_ref.findall(strip_code(text)))

have = {p.relative_to("images").as_posix() for p in pathlib.Path("images").rglob("*") if p.is_file()}
print("裂图:", sorted(used - have))
print("孤儿:", sorted(have - used))
PY
```

两个盲区：它只认正文 `![](.../images/x)` 和 frontmatter `image:` 封面这两种写法，路径也必须是 `../` 开头的相对路径（`/images/x` 走的是站点根，不在范围里）；围栏和行内代码里的路径会被剔除——这条是写这篇笔记时被打出来的，在代码里举一个 `![](...)` 的例子，扫描就把它当真引用报出来了。

第一次跑的结果（2026-09-26）：裂图 0，孤儿 7 张，全是 `image-2026*.png` 那批粘贴图和一张 `cs2_260814.jpg`。

### 顺带

frontmatter 里的 `image:` 是文章封面，走的是站点那套，和正文里 `![]()` 的相对路径不是一回事，这里的位置、命名规则不管它。

Obsidian 侧：vault 在 `src/content`，把「附件默认位置」指到 `posts/images`，粘贴的图就落对地方，省掉手动搬这一步；但 Obsidian 会自动写 `![[...]]`，Firefly 不渲染，所以引用还得手写成 `![](相对路径)`。这个摩擦靠设置消不掉。

## 相关问题

- 图片和附件走同一套规则吗？（不一样，`![[图片]]` 至今不支持，图片走 `../../images/` 相对路径）

## 实践

```bash
python3 ~/.codex/skills/learning-system/scripts/check_links.py
```

脚本照抄框架的三步解析，报死链、裸文件名撞名和 slug 撞车。权威文档是 `src/content/posts/guide/firefly-wiki-link.md`。

知识库的约定：**每篇笔记都写 slug**，格式 `knowledge-base/<子目录>/<小写短名>`。`new_note.py` 会自动补（文件名 URL 安全时用文件路径）或在需要时强制要求；`check_links.py` 会列出缺 slug 的笔记。`README.md`、`core-questions.md`、`SXCTF_WP.md` 也补上了，取的 slug 就是它们原来的 URL，地址没变。

Obsidian 侧建议：vault 开在 `src/content/posts`，内部链接类型选「基于仓库根目录的绝对路径」，这样写出的路径和框架要的完全一致。本仓库的 `.obsidian` 目前在 `src/content`，写出来会带 `posts/` 前缀，插件能吃掉，所以也能用；但别选「基于当前笔记的相对路径」。
