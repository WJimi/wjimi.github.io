---
title: MySQL_进阶
published: 2026-09-05
description: An advanced guide to MySQL, focusing on constraints, queries, and data manipulation techniques for effective database management.
tags:
  - SQL
  - MySQL
category: SQL
draft: false
---

# 七.SQL约束

### 主键约束: 非空唯一

```properties
主键约束关键字: primary key

主键约束特点: 非空唯一(限制主键列的数据不能为空,不能重复)
```

```sql
# 四.演示约束
# 1.主键约束特点: 限制数据非空唯一
create table stu2(
    sid int PRIMARY KEY ,  -- 建议: 建表的时候添加主键约束
    name varchar(100),
    class int
);

# 验证主键约束的限制作用
# 限制了主键不能重复
insert into stu2 values(1,'张三',52); -- 第一条正常插入
insert into stu2 values(1,'李四',53); -- 插入失败,因为有主键限制不能重复
# 限制了主键不能为空
insert into stu2 values(null,'李四',53); -- 插入失败,因为有主键限制不能为空
```

### 主键自增约束

```properties
主键自增关键字: PRIMARY KEY auto_increment

主键自增特点: 每次自动加1       

注意: 设置了自增后null和0就是一个占位符,代表使用自增  或者  插入数据的时候不指定主键,默认自增
```

```sql
# 演示主键自增
create table stu4(
    sid int PRIMARY KEY auto_increment ,  -- 建议: 建表的时候添加主键自增约束
    name varchar(100),
    class int
);
# 查看表结构
desc stu4;

# 演示主键自增特点: 自动加1
# 注意: 如果设置了主键自增,null和0都代表自动使用自增
# 没有指定字段插入数据,默认所有字段,null和0其实就是一个占位代表自增
insert into stu4 values(null,'李四',53);
insert into stu4 values(0,'王五',53);
# 指定字段的时候不指定id字段,默认自增
insert into stu4(name,class) values('赵六',54);
```

### 非空约束: 不能为空

```properties
非空约束关键字: not null

非空约束特点: 修饰的字段对应数据不能为空
```

```sql
# 演示非空约束
# 非空约束关键字: not null
# 非空约束特点: 修饰的字段对应数据不能为空
create table stu5(
    sid int PRIMARY KEY auto_increment , 
    name varchar(100) not null,
    class int not null
);
# 查看表结构
desc stu5;
# 演示非空约束的特点: 限制对应的数据不能为空
insert into stu5(name,class) values(null,52); -- 插入失败,因为有限制
insert into stu5(name,class) values('张三',null); -- 插入失败,因为有限制
insert into stu5(name,class) values('张三',52); -- 插入成功
```

### 唯一约束: 不能重复

```properties
唯一约束关键字: unique

唯一约束特点: 修饰的字段对应数据不能重复
```

```sql
# 演示唯一约束
create table stu7(
    sid int PRIMARY KEY auto_increment ,  
    name varchar(100) unique ,
    class int
);
# 查看表结构
desc stu7;
# 演示唯一约束的特点: 限制数据不能重复
insert into stu7(name,class) values('张三',null); -- 第一次插入成功
insert into stu7(name,class) values('张三',null); -- 插入失败,因为有限制
```

### 默认约束: 设置默认值

```properties
默认约束关键字: default

默认约束特点: 可以提前为某列设置默认值
```

```sql
# 5.默认约束
create table stu9(
    sid int PRIMARY KEY auto_increment ,  
    name varchar(100),
    class int default 52
);
# 查看表结构
desc stu9;

# 演示默认约束的特点: 插入数据的时候不指定,使用默认值
insert into stu9(name) values('张三');
insert into stu9(name) values('李四');
# -- 注意: 如果你插入数据的时候指定了具体值,以你的为主
insert into stu9(name,class) values('李四',53);
```





# day02_基础查询

## 1.准备工作

```sql
# 操作库的前提: 先启动mysql服务并连接它
# 操作表的前提: 先有库并使用它
create database day03;
use day03;
# 创建商品表
CREATE TABLE product(pid INT PRIMARY KEY,pname VARCHAR(20),price DOUBLE,category_id VARCHAR(32));
# 插入数据
INSERT INTO product(pid,pname,price,category_id) VALUES(1,'联想',5000,'c001');
INSERT INTO product(pid,pname,price,category_id) VALUES(2,'海尔',3000,'c001');
INSERT INTO product(pid,pname,price,category_id) VALUES(3,'雷神',5000,'c001');
INSERT INTO product(pid,pname,price,category_id) VALUES(4,'杰克琼斯',800,'c002');
INSERT INTO product(pid,pname,price,category_id) VALUES(5,'真维斯',200,'c002');
INSERT INTO product(pid,pname,price,category_id) VALUES(6,'花花公子',440,'c002');
INSERT INTO product(pid,pname,price,category_id) VALUES(7,'劲霸',2000,'c002');
INSERT INTO product(pid,pname,price,category_id) VALUES(8,'香奈儿',800,'c003');
INSERT INTO product(pid,pname,price,category_id) VALUES(9,'相宜本草',200,'c003');
INSERT INTO product(pid,pname,price,category_id) VALUES(10,'面霸',5,'c003');
INSERT INTO product(pid,pname,price,category_id) VALUES(11,'好想你枣',56,'c004');
INSERT INTO product(pid,pname,price,category_id) VALUES(12,'香飘飘奶茶',1,'c005');
INSERT INTO product(pid,pname,price,category_id) VALUES(13,'海澜之家',1,'c002');

```

## 2.简单查询

### 知识点:

```properties
简单查询关键字:  select 和 from

简单查询格式:  select [distinct]字段名...  from 表名;       select * from 表名;
	[] : 代表括号中内容可以省略
	...: 省略号,代表可以指定多个字段
	*  : 代表查询所有字段
	
	distinct关键字: 给指定字段去重,此关键字必须放到select之后
```

### 示例:

```sql
# 2.简单查询练习
# 注意: 以下查询操作统一都使用day03库下的表
use day03;
# 格式: select [distinct]字段名|* from 表名;
# 需求1: 查询product表所有数据
select * from product;

# 需求2: 只查询所有商品的名称和价格
select pname,price from product;

# 需求3: 查询商品的分类,要求去重
select distinct category_id from product;
```

## 3.条件查询

### 知识点:

```properties
条件查询关键字: where

条件查询基础格式: select 字段名 from 表名 where 条件;

		比较运算符:  >:大于  <:小于  >=:大于等于  <=:小于等于    !=和<> : 不等于
		
		逻辑运算符:  and:并且  or:或者  not:取反
		
		范围 查询:  between x and y: x到y的连续范围       in(x,y): x或者y
		
		模糊 查询:  like:模糊查询关键字   %:0个或者多个字符   _: 1个字符   
		
		空 判 断 :  is null: 判断为空    is not null: 判断不为空
```

### 示例:

```sql
# 3.条件查询练习
# 3.1 比较运算符练习
# 比较运算符:  >:大于  <:小于  >=:大于等于  <=:小于等于    !=和<> : 不等于
# 需求1: 查询商品价格大于2000的商品信息
select * from product where price > 2000;
# 需求2: 查询商品价格小于2000的商品信息
select * from product where price < 2000;
# 需求3: 查询商品价格大于等于2000的商品信息
select * from product where price >= 2000;
# 需求4: 查询商品价格小于等于2000的商品信息
select * from product where price <= 2000;
# 需求5: 查询商品价格不等于2000的商品信息
select * from product where price != 2000;
select * from product where price <> 2000;

# 3.2逻辑运算符练习
# 逻辑运算符:  and:并且  or:或者  not:取反
# 需求6: 查询商品价格大于等于200并且小于等于2000的商品信息
select * from product where price >= 200 and price <=2000;
# 需求7: 查询商品价格等于3000 或者 等于5000的商品信息
select * from product where price = 3000 or price = 5000;
# 需求8: 查询商品价格不等于2000的商品信息
select * from product where not(price = 2000); # 此种方式相比!=是麻烦的,仅用于演示取反效果
# 需求9: 查询商品价格不在200到2000之间的商品信息
select * from product where not (price >= 200 and price <=2000);

# 3.3范围查询练习
# 范围查询: between x and y: x到y的连续范围       in(x,y): x或者y
# 需求6: 查询商品价格大于等于200并且小于等于2000的商品信息
select * from product where price between 200 and 2000;
# 需求7: 查询商品价格等于3000 或者 等于5000的商品信息
select * from product where price in(3000,5000);


# 3.4 模糊查询练习
# 模糊 查询:  like:模糊查询关键字   %:0个或者多个字符   _: 1个字符
# 需求10: 查询商品名称以'香'开头的所有商品信息
select * from product where pname like '香%';
# 需求11: 查询商品名称以'香'开头并且名称是3个字的商品信息
select * from product where pname like '香__';


# 3.5 空判断练习
# 空 判 断 :  is null: 判断为空    is not null: 判断不为空
# null: mysql中就代表空值,没有任何意义 ,它并不等于空字符串'',也不等于字符串'null'
# 因为原始数据没有null值,为了方便演示插入一条
INSERT INTO product(pid,pname,price,category_id) VALUES(14,'小米',1999,null);
INSERT INTO product(pid,pname,price,category_id) VALUES(15,'红米',1999,'null');
INSERT INTO product(pid,pname,price,category_id) VALUES(16,'华为',1999,'');
# 需求1: 查询没有分类的商品
select * from product where category_id is null;
# 需求2: 查询有分类的商品
# 注意: 不要写成not is null,这种写法是错误的
select * from product where category_id is not null;
```

## 4.排序查询kown

### 知识点:

```properties
排序查询关键字: order by

排序查询基础格式: select 字段名 from 表名 order by 排序字段名 asc|desc;
		asc: 升序  注意: 是默认升序,order by后不写排序规则默认就是升序   123456
		desc: 降序   654321
```

### 示例:

```sql
# 4.排序查询
# 排序查询格式: select 字段名 from 表名 order by 排序字段名 asc|desc;
# 需求1: 查询所有商品信息,并且按照价格升序排序
select * from product order by price ; -- 此处默认升序

# 需求2: 查询所有商品信息,并且按照价格降序排序
select * from product order by price desc;
```

## 5.聚合查询

### 知识点:

```properties
聚合查询函数:  count()数量  sum()求和   avg()平均值  max()最大值  min()最小值

聚合查询基础格式: select 聚合函数 from 表名;

注意1: 默认一个表就是一个大的分组

注意2: 聚合函数又叫统计函数,也叫分组函数
```

### 示例:

```sql
# 5.聚合查询
# 聚合查询基础格式: select 聚合函数 from 表名;
# 需求1: 查询所有商品的个数
select count(*) from product; -- -- 结果16 

# 需求2: 查询商品价格总和
select sum(price) from product;

# 需求3: 查询商品价格平均值
select avg(price) from product;

# 需求4: 查询商品最大价格
select max(price) from product;

# 需求5: 查询商品最小价格
select min(price) from product;
```

## 6.分组查询kown

### 知识点:

```properties
分组查询关键字:  group by

分组查询基础格式: select 分组字段名,聚合函数(字段名)  from 表名 group by 分组字段名;
							这个括号不是或者的意思，就是放个函数在这
```

### 示例1: 

```sql
# 6.分组查询
# 分组查询基础格式: select 聚合函数 from 表名 group by 分组字段名;
# 需求1: 查询每个商品分类内商品的个数
# 方式1: 笨方法
select count(*) from product where category_id = 'c001'; -- c001 3
select count(*) from product where category_id = 'c002'; -- c002 5
select count(*) from product where category_id = 'c003'; -- c003 3
select count(*) from product where category_id = 'c004'; -- c004 1
select count(*) from product where category_id = 'c005'; -- c005 1
select count(*) from product where category_id is null; -- <null> 1
select count(*) from product where category_id = 'null'; -- 'null' 1
select count(*) from product where category_id = '';     -- '' 1
# 方式2: 用group by先分组,再组内聚合
select category_id,count(*) from product group by category_id;
```



## 7.分页查询

### 知识点:

```properties
分页查询关键字:  limit

分页查询基础格式: select 字段名 from 表名 limit x,y;
		x: 整数,代表查询的起始索引 注意: 索引默认是从0开始数
		y: 整数,代表查询的条数(每页展示的数量)
	x可省去，以仅限定查询条数		
```

### 分页练习:

```sql
# 7.分页查询
# 分页查询基础格式: select 字段名 from 表名 limit x,y;
# 需求1: 查询表中前五条数据
select * from product limit 0,5;
# 注意: 如果起始索引是0,那么可以省略不写
select * from product limit 5;

# 需求: 数据共有16条，每页显示4条,依次查询出每页展示的数据
# 查询第1页数据
select * from product limit 0,4;
# 查询第2页数据
select * from product limit 4,4;
# 查询第3页数据
select * from product limit 8,4;
# 查询第4页数据
select * from product limit 12,4;
# 推出起始索引计算结论: (页数-1)*每页展示的条数
```



## 8.表连接查询kown

### 准备数据

```sql
# 准备数据
# 创建hero表
CREATE TABLE hero
(
    hid       INT PRIMARY KEY,
    hname     VARCHAR(255),
    kongfu_id INT
);

# 创建kongfu表
CREATE TABLE kongfu
(
    kid   INT PRIMARY KEY,
    kname VARCHAR(255)
);
# 插入hero数据
INSERT INTO hero VALUES(1, '鸠摩智', 9),(3, '乔峰', 1),(4, '虚竹', 4),(5, '段誉', 12);
# 插入kongfu数据
INSERT INTO kongfu VALUES(1, '降龙十八掌'),(2, '乾坤大挪移'),(3, '猴子偷桃'),(4, '天山折梅手');
```

### 内连接

#### 知识点:

```properties
内连接(常用): 就是保留两个表数据的交集,用on过滤其他无效数据

内连接关键字:  inner join ... on       注意: inner 可以省略

内连接格式: select 字段名 from 左表 inner join 右表 on 左右表关联条件;

内连接特点: 只保留两个表有交集的数据,其他数据直接过滤掉

注意: 左右表没有特殊含义只是位置关系,在前面的是左表,在后面的是右表
```

```sql
# 演示内连接查询
# 需求: 查询有对应功夫的英雄,要求展示英雄名和他的功夫
# 方式:显式内连接格式: select 字段名 from 左表 inner join 右表 on 左右表关联条件;
select hname,kname from hero inner join kongfu on hero.kongfu_id=kongfu.kid;

```

### 外连接

#### 知识点:

#### 左外连接示例

```properties
外连接(根据实际情况定): 就是两个表数据的并集,用on过滤其他无效数据

左外连接关键字: left outer join ... on        注意: outer 可以省略
左外连接格式:  select 字段名 from 左表 left outer join 右表 on 左右表关联条件;
左外连接特点:  以左表为主,左表所有数据都保留,右表只保留交集的部分

右外连接关键字: right outer join ... on       注意: outer 可以省略
右外连接格式:  select 字段名 from 左表 right outer join 右表 on 左右表关联条件;
右外连接特点:  以右表为主,右表所有数据都保留,左表只保留交集的部分

注意: 左右表没有特殊含义只是位置关系,在前面的是左表,在后面的是右表
注意: 左外连接和右外连接记忆一种格式即可,只要左右表换下顺序就能达到对应的需求
```

```sql
# 需求: 查询所有英雄对应的功夫,注意:没有对应功夫的用null补全
# 分析:  如果使用左外连接,左表: 英雄表
# 左外连接
select hname,kname from hero left join kongfu on hero.kongfu_id=kongfu.kid;
```

#### 右外连接示例

```sql
# 演示右外连接查询
# 需求: 查询所有英雄对应的功夫,注意:没有对应功夫的用null补全
# 分析:  如果使用右外连接,右表: 英雄表
select hname,kname from kongfu right join hero on hero.kongfu_id=kongfu.kid;
```

## 9.UNION查询

UNION是一种用于合并两个或多个SELECT语句结果集的操作符（合并阅览）。

**语法：**

```sql

  SELECT   列1,  列2,...    FROM   表1   UNION   SELECT   列1,  列2,...   FROM   表2;
  
```

- 假设有两个表，user1表和user2表，它们都有id、name和age这三列。

- user1表的数据如下：

| id   | name     | age  |
| ---- | -------- | ---- |
| 1    | zhangsan | 18   |
| 2    | lisi     | 19   |

- user2表的数据如下：

| id   | name    | age  |
| ---- | ------- | ---- |
| 3    | wangwu  | 20   |
| 4    | zhaoliu | 21   |

使用UNION查询的sql语句为：

```sql
SELECT id, name, age FROM user1 UNION SELECT id, name, age FROM user2;
```

