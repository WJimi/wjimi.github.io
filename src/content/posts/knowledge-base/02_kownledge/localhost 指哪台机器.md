---
title: localhost 指哪台机器
published: 2026-09-26
description: loopback、0.0.0.0、NAT/桥接、端口映射：为什么虚拟机里的 localhost 不是宿主机
tags:
  - 网络
  - 虚拟机
  - Docker
  - HTTP
category: 02_知识
slug: knowledge-base/02_kownledge/which-machine-is-localhost
draft: false
---

# localhost 指哪台机器

## 来源

出 [[knowledge-base/03_projects/web/ivn-duty-challenge|IVN 值班日志]] 时，
想用 Kali 虚拟机里的 dirsearch 去扫 Windows 物理机上跑的容器，卡在了地址上：
「我可以用 kali 扫物理机上的 `http://localhost:8899` 吗？」

## 它解决的问题

在 Kali 里访问 `http://localhost:8899`，为什么扫不到物理机上跑的东西？
跨机器访问时，到底该填哪个地址？

## 当前理解

`localhost` 和 `127.0.0.1` 永远指**发出请求的那台机器自己**。
物理机、虚拟机、容器各自是独立的机器，每台都有自己私有的 loopback 地址——
同一个 `127.0.0.1` 在不同机器上指向完全不同的东西。

所以要跨机器访问，必须用「对方在某张网卡上的真实 IP」。

### 0.0.0.0 不是地址，是"监听所有网卡"的写法

`0.0.0.0` 出现在 **bind（监听）** 语境里，意思是「本机所有网卡都监听这个端口」。
它不是一个可以用来连接的目标地址。

Docker 的 `-p 8899:80` 做的事，就是把它发布成物理机上的 `0.0.0.0:8899`——
所以物理机上**任何一张网卡**（包括专门给虚拟机用的那张虚拟网卡）在 8899 上都是通的。

### 虚拟机眼里的"宿主机地址"取决于网络模式

| 模式 | 虚拟机里访问宿主机的地址 | 关系 |
| --- | --- | --- |
| NAT（默认） | VirtualBox 是 `10.0.2.2`；VMware 是 vmnet8 网段里的宿主机地址（`ip route` 看网关） | 虚拟机藏在宿主后面，宿主相当于路由器 |
| 桥接 Bridged | 宿主机在局域网里的 IP，如 `192.168.1.23` | 两者平级，各拿一个局域网 IP |
| Host-only | vmnet1 / vboxnet1 网段里的宿主机地址 | 两者组成一个私有小网络 |

### WSL2 是个例外：localhost 居然能用

在 WSL 里访问 `http://localhost:8899` 能连到 Windows 上发布的端口，
是因为 WSL2 做了 localhost 转发，把两边的 loopback 打通了。
这是 WSL 的特权，不是通用规律——换成 VMware / VirtualBox 里的 Kali 就不成立。

### 还有一层：防火墙

地址对了、服务也在跑，还可能被宿主机的防火墙拦下来。
症状上的区别很好认：

- `Connection timed out` → 大概率是防火墙没放行
- `Connection refused` → 网络通了，只是那个端口上没有服务在听

## 相关问题

- 容器和它所在的宿主机之间，网络又是什么关系？

## 实践

排查顺序（这次就是这么走通的）：

```bash
# 1. 在虚拟机里看自己的网络和网关
ip -brief addr
ip route | head -3

# 2. 拿三个候选地址各试一次
curl -sv --max-time 5 http://<宿主机IP>:8899/robots.txt
```

宿主机放行端口（Windows，管理员 PowerShell）：

```powershell
New-NetFirewallRule -DisplayName "web-ivn-duty 8899" -Direction Inbound -Protocol TCP -LocalPort 8899 -Action Allow
```

**结论**：如果目的只是验证"扫描器能不能命中某个文件名"，在 WSL 里直接扫最省事，
`localhost:8899` 本来就是通的；只有想练"跨机扫靶机"的真实工作流，才值得去折腾
虚拟机的网络模式和防火墙。

顺带一个反直觉的点：虚拟机和宿主机虽然是两台机器，但如果虚拟机用的是 NAT，
它和宿主机仍然在同一个"虚拟局域网"里，只是地址要按 NAT 的规则去找。
