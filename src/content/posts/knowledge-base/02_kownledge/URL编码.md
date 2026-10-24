---
title: URL编码
updated: 2026-10-24
published: 2026-05-14
description: 编码
tags:
- web
category: 02_知识
slug: knowledge-base/02_kownledge/url
draft: false
---
## URL 字符分三类：
- **保留字符（Reserved）**：有特殊语义，**不能随便直接用**，要当普通文字必须编码
	这些在 URL 里有分隔 / 语法作用，**想当普通文本必须编码**：
```css
 : / ? # [ ] @ ! $ & ' ( ) * + , ; =
```
  `:/` 协议与路径分隔
  `?` 开始查询参数
  `#` 锚点
  `&` 参数分隔
  `=` 键值对赋值
 其余都是分隔、分片语法符号
- **非保留字符（Unreserved）**：**无需 URL 编码**
	1. 大小写英文字母
	2. 数字
	3. \- _ . ~
- **其他所有字符**: **必须百分号编码**
    1. 中文
    2. 空格
    3. 特殊符号
---

## 一句话极简口诀

1. 字母数字 `- _ . ~` **不动**
2. 其他符号、空格：**转 ASCII → 转 16 进制 → 加 %**
3. 中文：**UTF-8 拆 3 字节，每字节各加一个 %**

---

## JS 现成编码 / 解码函数（直接能用）

```javascript
// 编码
encodeURIComponent("你好 123#&")

// 解码
decodeURIComponent("%E4%BD%A0%E5%A5%BD%20123%23%26")
```

区别：

- `encodeURI`：**不编码 `/ ? : #` 等保留符**，适合整网址
- `encodeURIComponent`：**全部特殊字符都编码**，适合参数值


