---
title: CS2控制台指令
published: 2026-08-14
description: CS2作为一款历史悠久的竞技FPS游戏，其存在着控制台功能，我认为有控制台的游戏，通常意味着游戏有很高的安全性和可玩性。玩家可以通过控制台指令来调整游戏设置、测试武器性能、练习投掷物等。本文将列出一些常用的CS2控制台指令，供玩家参考和使用。
tags: [游戏攻略]
category: GAME
draft: false
---

### 首要指令
**sv_cheats 1**  
开启作弊模式,以下指令的必要指令

bind alt"noclip"  
按" **alt** "键飞行穿墙

bind n"sv_rethrow_last_grenade"  
按" **n** "键重现上一个投掷物

### 回合时间

mp_team_intro_time 0  
禁用队伍出场动画

mp_restartgame 1  
在1秒内重启游戏

mp_freezetime 0  
每回合开始游戏暂停时间

mp_roundtime 60  
mp_roundtime_defuse 60  
mp_roundtime_hostage 60  
每回合持续多少分钟

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
放置  
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

mp_respawn_on_death_ct 1  
启动反恐精英死亡立即重生  
mp_autoteambalance 0  
禁用队伍自动平衡  
mp_limitteams 0  
队伍间最大玩家人数差

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