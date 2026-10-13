---
title: PHP 7 未定义常量的字符串回退
updated: 2026-10-13
published: 2026-10-12
description: 字符白名单只约束你写的文本、不约束运行时的值：未定义常量回退成字符串，配上解码函数就能合成被禁字符
tags:
  - PHP
  - Web安全
  - CTF
  - 字符过滤
category: 02_知识
slug: knowledge-base/02_kownledge/php7-undefined-constant-fallback
draft: false
---

# PHP 7 未定义常量的字符串回退

## 来源

做 ctf.show 的「PHP Code Executor」时产生。题目把输入框内容直接送进 `eval()`，
再用字符白名单卡死几乎所有元字符。卡点很具体：**知道要读 flag.php，但写不出那个点**。

问题本身记在 [[为什么字符白名单挡不住代码执行？]]。

## 它解决的问题

当过滤只允许字母、数字、下划线、括号、分号时，怎样在 PHP 里表达出被禁的字符
（引号、点、斜杠、美元符），仍然构造出字符串并读到文件？

## 待答问题

- ❓ PHP 8 删掉这条回退之后，同样的白名单 `^[a-zA-Z0-9();_]+$` 还打得穿吗？
  先写下预测，再用 php:8 的镜像跑一遍 `readfile(base64_decode(ZmxhZy5waHA));` 验证。
- ❓ 白名单里还留着哪些"单参数、能把编码还原成字符"的函数？把它们依次替换掉
  `base64_decode` 试一遍，看谁能顶上来；顺便验证换成别的编码（如 hex）为什么不行。
- ❓ `DIRECTORY_SEPARATOR` 这一路完全没用到回退机制，它和回退是不是同一类东西？
  如果白名单允许引号但禁掉所有函数名，两条路各自还剩什么？

## 事实

- 题目源码原文：`if (!preg_match('/^[a-zA-Z0-9();_]+$/', $_POST['code']))` 抛异常，然后 `eval($_POST['code']);`
- 实测被禁的：`.` `$` `'` `"` 空格 `,` `=` `[` `]` —— 连 `echo 1;` 都因为空格被拒。
- 服务器的警告原文：`Warning: Use of undefined constant ZmxhZy5waHA - assumed 'ZmxhZy5waHA' (this will throw an Error in a future version of PHP) in ... eval()'d code` —— 机制被它直接写在脸上。
- 环境：PHP 7.3.29，`disable_functions` 与 `open_basedir` 均为空。
- 只用白名单字符就能做的信息收集：`echo(phpversion());`、`phpinfo();`、`echo(getcwd());`、`print_r(scandir(DIRECTORY_SEPARATOR));`
- 只用白名单字符读文件：`readfile(base64_decode(ZmxhZy5waHA));`（`base64_decode` 容忍缺少 `=` 补位）
- `base64("flag.php")` = `ZmxhZy5waHA=`，去掉补位后首字符是字母 `Z`，所以能当合法标识符。
- hex 方案不通：`hex2bin(666c61672e706870)` 里的 `666c...` 以数字开头，会被当成数字而不是标识符；标识符只能以字母或下划线开头。
- `DIRECTORY_SEPARATOR` 的值就是 `/`，是不用引号也拿得到的字符串。
- 读到 `flag.php` 只赋值不输出（`$flag = "...";`），所以要用 `readfile` 读源码，`include` 进去看不到东西。
- 环境变量 `FLAG` 的值是 `not_flag`，是诱饵。
- 该题 flag 文案是 `CTF{shell_code_base64_bypass}`，出题人自己点破了预期解法。

## 我的理解

## 相关问题

- [[Web 安全的边界在哪]]
- [[后端语言基础要补到什么程度]]

## 实践
