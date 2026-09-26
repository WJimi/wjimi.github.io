---
title: "读懂 Python 脚本需要的语法点"
published: 2026-09-25
description: "learning-system 两个校验脚本里用到、我目前还不熟的 Python 语法"
tags:
  - "Python"
  - "待探索"
category: "04_待探索"
slug: knowledge-base/04_explore/python-syntax-for-reading-scripts
draft: false
---

# 读懂 Python 脚本需要的语法点

## 来源

读完 learning-system skill 里的 `new_note.py` 和 `check_links.py` 之后，发现里面有一批我不熟的语法。

## 它解决的问题

> 脚本能跑，我知道它大概在干什么，但改不动它。

这是"能使用"和"能排错、能改"之间的差距。当前不影响用脚本，所以整体放进待探索，不急着一次学完。

## 待补的语法点

按"读脚本会先撞上什么"的顺序：

| 语法点 | 它解决什么问题 | 出现在哪 |
| --- | --- | --- |
| `f"{变量}"` | 把变量插进字符串 | 两个脚本到处都在用 |
| 类型标注 `str \| None`、`list[str]`、`dict[str, list[Path]]` | 只说明"这个变量该装什么"，运行时不检查 | `existing_stem()`、`build_note()`、`main()` |
| `from __future__ import annotations` | 让新式的类型标注在旧版 Python 上也能写 | 两个脚本开头 |
| `pathlib.Path` | 把路径当对象用，而不是一堆字符串 | `Path(args.kb)` |
| `路径 / "文件名"` | 用 `/` 拼路径 | `target_dir / f"{stem}.md"` |
| `.stem`、`.parts`、`.name` | 取"不带扩展名的文件名"、"路径的每一段"、"最后一段" | `existing_stem()`、`main()` |
| `.rglob("*.md")` / `.glob("*.md")` | 递归找所有 md / 只找当前这一层 | `existing_stem()`、`collect_posts()` |
| `read_text` / `write_text` + `encoding="utf-8"` | 读写文本；不写编码在 Windows 上会乱码 | `read_frontmatter()`、`extract_links()`、`new_note.py` 结尾 |
| `argparse` | 把命令行参数变成变量（`--dir x` → `args.dir`） | 两个脚本的 `main()` |
| `action="store_true"` / `required=True` / `nargs="*"` | 参数"出现就是 True" / "必须有" / "后面可以跟任意个" | `--draft`、`--dir`、`notes` |
| `json.dumps(..., ensure_ascii=False)` | 生成带引号的字符串，中文不转成 `\uXXXX` | `quoted()` |
| `collections.Counter` | 数每个值出现几次，不用先判断有没有 | `detect_category()` |
| `sorted(key=lambda ...)` 与元组排序 | 自定义排序；`(-次数, 名字)` = 次数多的在前，同次数按名字 | `detect_category()`、`collect_posts()` |
| `set` 与 `&` | 求"两个集合共有哪些元素" | `ILLEGAL_FILENAME_CHARS`、非法字符检查 |
| `*(...)` 解包 | 把一串东西摊开塞进集合或参数 | `WINDOWS_RESERVED`、`kb.joinpath(*parts)` |
| 列表推导式 / 生成器表达式 | 一行写完"从一堆东西里挑出另一堆" | `main()`、`collect_posts()`、`extract_links()` |
| 三元表达式 `a if 条件 else b` | 一行写完选择 | `build_note()`、`check_links.py` 的 `main()` |
| `re.compile` / `finditer` / `sub` | 找、遍历、替换符合模式的文本 | `check_links.py` 的链接正则、`extract_links()` |
| `dict.setdefault(k, [])` | 字典里没这个 key 就先塞个默认值 | `seen_slugs`、`broken` |
| `sys.stderr` 与退出码 | 正常输出和错误输出分开；退出码告诉调用者成没成 | 两个脚本的 `main()` |
| `if __name__ == "__main__":` 与 `raise SystemExit(main())` | 区分"被运行"还是"被 import"；把返回值当退出码 | 两个脚本结尾 |

## 最小起步

先补四个就够读懂大部分：**f-string、类型标注、`pathlib.Path`、列表推导式**。剩下的可以在真正要改脚本时再逐个补。

## 相关笔记

- [[YAML 标量类型推断]]
- [[Firefly 双链解析规则]]
