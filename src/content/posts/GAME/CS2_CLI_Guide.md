---
title: CS2控制台指令
published: 2026-08-14
description: 该星球第一梯队的竞技 FPS，CS 早已不只是一个热门游戏，更像是一项长久运行的数字竞技项目。本文整理常用 CS2 控制台指令，从基础设置到投掷物练习。
image: ../images/cs2_260814.jpg
tags: [游戏理解,CS2]
category: GAME
draft: false
---

「像笨蛋一样」热爱着CS
<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1WqVA6QEkv&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0> </iframe>

> 该星球最具代表性的竞技 FPS 游戏之一，Counter-Strike 系列已经走过了二十余年的发展历程。从早期的 Counter-Strike，到 CS:GO，再到如今的 Counter-Strike 2，它已经很难再被简单地定义为一款普通的热门游戏，而更像是一项长期运行的数字竞技项目。
> 
> CS2 保留了开发者控制台（Developer Console）这一重要功能。通过控制台，玩家可以执行各种命令，对游戏环境和部分参数进行调整，并在本地服务器中进行武器、地图和投掷物等方面的测试与练习。
> 
> 本文整理了一些常用且实用的 CS2 控制台指令，并说明它们的用途和使用场景，方便玩家快速查阅。

### 命名规律 ###

| 前缀 | 规律 |  
| -----: | :---- | 
| cl_ | 通常与客户端相关 | 
| sv_ | 通常与服务器相关 | 
| mp_ | 通常与比赛/游戏规则相关 | 
| bot_ | 与 Bot 相关 | 

### 首要指令
**sv_cheats 1**  
开启作弊模式,以下指令的必要指令

bind alt"noclip"  
按" **alt** "键飞行穿墙

bind n"sv_rethrow_last_grenade"  
按" **n** "键重现上一个投掷物

bind 9"toggle host_timescale 1 20"  
按数字键“9”一键加快游戏速度，以跳过失误的烟雾弹  
toggle 的意思是在几个值之间循环切换  

bind 9 "..."
按下键盘上的 9，执行后面的命令
### 基础设置
mp_team_intro_time 0  
禁用队伍出场动画

mp_restartgame 1  
在1秒内重启游戏

mp_warmup_end  
结束热身

mp_freezetime 0  
每回合开始游戏暂停时间

mp_roundtime 60  
mp_roundtime_defuse 60  
mp_roundtime_hostage 60  
每回合持续多少分钟

mp_maxrounds 数字  
设置最大回合数

两边语音互通到指令
sv_alltalk 1或者 sv_full_alltalk 1

map 地图名称  
切换地图  

r_drawothermodels 2 或者 r_aoproxy_show 1  
透视

### 商店购买
ammo_grenade_limit_total 5  
最大可携带投掷物数量

mp_startmoney 99999  
mp_maxmoney 99999  
金钱控制

mp_buytime 3600  
mp_buy_anywhere 1  
解除地点时间购买限制

### 子弹穿透与伤害
sv_infinite_ammo 1  
无限子弹,1主,2副

sv_showimpacts 1  
sv_showimpacts_time 10  
显示子弹落点,显示时长

player_debug_print_damage 1  
在控制台显示玩家伤害信息

sv_showimpacts_penetration 1  
显示子弹穿透效果数据

### 电脑玩家控制
bot_place  
放置到准星位置  
bot_dont_shoot 1  
禁止开火  
bot_stop 1  
禁止移动  
bot_add(_ct)  
添加  
bot_kick  
踢出  
bot_kill  
击杀

bot_mimic 1  
电脑玩家模仿模式  
bot_mimic_yaw_offset 0  
电脑玩家同步玩家水平方向视角  
bot_crouch 1  
电脑玩家蹲下

getpos  
得到坐标  
set_player 玩家id 位置坐标  
设置玩家位置坐标

mp_respawn_on_death_ct 1  
启动反恐精英死亡立即重生  
mp_autoteambalance 0  
禁用队伍自动平衡  
mp_limitteams 0  
队伍间最大玩家人数差

custom_bot_difficulty 5  
bot难度控制

### 其他设置
bot_chatter off  
关闭电脑玩家语音交流  
cl_drawhud 0  
关闭游戏界面UI

give weapon_healthshot  
给予治疗针

mp_drop_knife_enable true;  
subclass_create 515  
刀具鉴赏
> 500—刺刀  
> 503—海豹短刀  
> 505—折叠刀  
> 506—穿肠刀  
> 507—爪子刀  
> 508—M9刺刀  
> 509—猎杀者匕首  
> 512—弯刀  
> 514—鲍伊猎刀  
> 515—蝴蝶刀  
> 516—暗影双匕  
> 517—系绳匕首  
> 518—求生匕首  
> 519—熊刀  
> 520—折刀  
> 521—流浪者匕首  
> 522—短剑  
> 523—锯齿爪刀  
> 525—骷髅匕首  
> 526—廓尔喀刀  

cl_prop_debug 1  
显示所有可破坏实体的指令  
third(first)person  
第三一人称视角切换

### 同好友玩自建房
房主先选择任意地图进入  
然后打开控制台输入：status  
控制台会弹出一大堆绿数字，在这些数字的上半部分找到“steamid”，将冒号后的一长串代码复制给好友   
好友打开控制台，输入 connect xxxxx  其中xxxxx即为上述steamid后的代码，即可进入同一个房间