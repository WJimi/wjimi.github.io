import type { BooknavGroup, BooknavPageConfig } from "../types/booknavConfig";

// 书签导航页面配置
export const booknavPageConfig: BooknavPageConfig = {
	// 页面标题
	title: "书签导航",

	// 页面描述文本
	description: "收藏常用站点，也记录它们的使用场景",

	// favicon 自动获取配置
	favicon: {
		// 书签未填写 icon 时，是否自动获取目标站点的 favicon 图标
		enabled: true,

		// favicon 接口地址，{domain} 为占位符，会被替换成目标站点域名
		// 更换接口只需保证地址里含有 {domain}，例如：
		//   https://a.favicon.im/{domain}
		//   https://favicon.im/{domain}
		api: "https://a.favicon.im/{domain}",
	},
};

// 书签导航配置
// 每个数组项是一个分类组，分类组内的 items 是该分类下的书签
export const booknavConfig: BooknavGroup[] = [
	{
		id: "projects",
		name: "项目",
		icon: "material-symbols:folder-open-rounded",
		desc: "自己的站点、仓库与作品",
		weight: 100,
		items: [
			{
				title: "WJimi GitHub",
				url: "https://github.com/wjimi",
				desc: "个人 GitHub 仓库",
				weight: 30,
			},
			{
				title: "WJimi Gitee",
				url: "https://gitee.com/wjimi",
				desc: "个人 Gitee 仓库",
				weight: 20,
			},
			{
				title: "Firefly",
				url: "https://github.com/CuteLeaf/Firefly",
				desc: "清晰美观的 Astro 个人博客主题模板",
				icon: "/favicon/firefly-32.png",
				weight: 10,
			},
			{
				title: "Firefly Docs",
				url: "https://docs-firefly.cuteleaf.cn",
				desc: "Firefly 主题模板文档",
				icon: "https://docs-firefly.cuteleaf.cn/logo.png",
			},
			{
				title: "夏夜流萤",
				url: "https://blog.cuteleaf.cn",
				desc: "飞萤之火自无梦的长夜亮起",
			},
		],
	},
	{
		id: "events",
		name: "赛事与排名",
		icon: "material-symbols:event-list-rounded",
		desc: "比赛、报名与战队信息",
		weight: 95,
		items: [
			{
				title: "CTFtime",
				url: "https://ctftime.org/",
				desc: "全球赛事日历与排名",
				weight: 30,
			},
			{
				title: "NSSCTF 竞赛",
				url: "https://www.nssctf.cn/contest",
				desc: "比赛、题库与战队入口",
				weight: 20,
			},
			{
				title: "i春秋赛事",
				url: "https://www.ichunqiu.com/competition",
				desc: "比赛信息与赛事服务",
				weight: 10,
			},
			{
				title: "全国大学生信安竞赛",
				url: "https://www.ciscn.cn/",
				desc: "全国大学生信安竞赛官网",
			},
		],
	},
	{
		id: "labs",
		name: "靶场与练习",
		icon: "material-symbols:terminal-rounded",
		desc: "从新手题开始慢慢练手",
		weight: 90,
		items: [
			{
				title: "BUUCTF",
				url: "https://buuoj.cn/challenges",
				desc: "热门赛题复现平台",
				weight: 30,
			},
			{
				title: "攻防世界",
				url: "https://adworld.xctf.org.cn/home",
				desc: "题量大、方向全的练习平台",
				weight: 20,
			},
			{
				title: "Hello CTF",
				url: "https://hello-ctf.com/index.html",
				desc: "从零开始学习 CTF",
				weight: 10,
			},
			{
				title: "FXZ::CTF",
				url: "https://ctf.jxnusec.cn/",
				desc: "校内 CTF 练习平台",
			},
			{
				title: "FLZ::CTF",
				url: "http://101.200.39.193:8000/",
				desc: "校内 CTF 练习平台",
			},
			{
				title: "CTF+ 题库",
				url: "https://www.ctfplus.cn/learning/problem/problem-bank",
				desc: "CTF 题单与学习大厅",
			},
			{
				title: "循镜题库",
				url: "https://platform.cyclens.tech/#/challenge",
				desc: "在线挑战与题目列表",
			},
			{
				title: "Bugku CTF",
				url: "https://ctf.bugku.com/",
				desc: "经典 CTF 题库",
			},
			{
				title: "Command Challenge",
				url: "https://cmdchallenge.com/",
				desc: "命令行实战练习",
			},
			{
				title: "ctf.show",
				url: "https://ctf.show/challenges#",
				desc: "综合 CTF 练习平台",
			},
			{
				title: "CTF²",
				url: "https://ctf2.dasctf.com/explorer",
				desc: "DASCTF 在线挑战",
			},
			{
				title: "CTFHub",
				url: "https://www.ctfhub.com/#/skilltree",
				desc: "技能树式靶场练习",
			},
			{
				title: "Review::CTF",
				url: "https://gz.imxbt.cn/",
				desc: "在线靶场入口",
			},
			{
				title: "SDPC::CTF",
				url: "http://www.sdpcsec.cn/",
				desc: "在线靶场入口",
			},
			{
				title: "bWAPP",
				url: "http://www.itsecgames.com/",
				desc: "Web 漏洞练习环境",
			},
			{
				title: "cmdchallenge 源码",
				url: "https://gitlab.com/jarv/cmdchallenge",
				desc: "命令挑战开源代码",
			},
			{
				title: "N1BOOK",
				url: "https://book.nu1l.com/tasks/#/",
				desc: "Nu1L 出品的 CTF 题集",
			},
		],
	},
	{
		id: "security-tools",
		name: "安全工具",
		icon: "material-symbols:security-rounded",
		desc: "编码、取证与逆向的常用工具",
		weight: 85,
		items: [
			{
				title: "CyberChef",
				url: "https://gchq.github.io/CyberChef/",
				desc: "编码、解码与取证工具",
				weight: 30,
			},
			{
				title: "Burp Suite 入门",
				url: "https://portswigger.net/burp/documentation/desktop/getting-started",
				desc: "Burp Suite 官方入门文档",
				weight: 20,
			},
			{
				title: "CTF 在线工具",
				url: "http://www.hiencode.com/",
				desc: "编码、密码与 CTF 工具",
				weight: 10,
			},
			{
				title: "Hackbar 安装教程",
				url: "https://www.cnblogs.com/cainiao-chuanqi/p/14016644.html",
				desc: "Burp 浏览器插件安装说明",
			},
			{
				title: "jd-gui",
				url: "https://gitcode.com/gh_mirrors/jd/jd-gui",
				desc: "Java Class 反编译工具",
			},
			{
				title: "随波逐流",
				url: "http://www.1o1o.xyz/index.html",
				desc: "在线安全工具集合",
			},
			{
				title: "CyberChef 中文版",
				url: "https://cyberchef.kumakaiha.com/",
				desc: "CyberChef 中文在线版",
			},
			{
				title: "W3School 百宝箱",
				url: "https://www.w3school.com.cn/howto/index.asp",
				desc: "常用网页开发工具",
			},
			{
				title: "HexEd.it",
				url: "https://hexed.it/",
				desc: "在线十六进制编辑器",
			},
			{
				title: "TXT 文本工具",
				url: "https://www.txttool.com/",
				desc: "文本清洗与转换工具",
			},
			{
				title: "二维码识别",
				url: "https://online-barcode-reader.inliteresearch.com/",
				desc: "二维码与条形码识别",
			},
			{
				title: "CrackStation",
				url: "https://crackstation.net/",
				desc: "在线哈希查询与破解",
			},
			{ title: "SOMD5", url: "https://www.somd5.com/", desc: "MD5 在线查询" },
			{ title: "CMD5", url: "https://www.cmd5.com/", desc: "MD5 在线查询" },
			{
				title: "FactorDB",
				url: "http://www.factordb.com/",
				desc: "整数分解与计算工具",
			},
			{ title: "JWT.io", url: "https://www.jwt.io/", desc: "JWT 编解码与调试" },
			{
				title: "Splitbrain 编码工具",
				url: "https://www.splitbrain.org/services/encode",
				desc: "常用编码转换工具",
			},
			{
				title: "中文电码",
				url: "https://dianma.bmcx.com/",
				desc: "中文电码查询",
			},
			{
				title: "W3Cschool 工具库",
				url: "https://123.w3cschool.cn/webtools",
				desc: "常用 Web 工具导航",
			},
			{
				title: "StegSolve 使用笔记",
				url: "https://www.cnblogs.com/haiouxiansheng/p/19199410",
				desc: "图片隐写工具使用教程",
			},
			{
				title: "CTF Flags",
				url: "http://flags.1o1o.xyz/",
				desc: "CTF Flags 查询",
			},
			{
				title: "RSA 证书生成",
				url: "https://www.usey.cn/rsa?bits=2048",
				desc: "RSA 证书在线生成",
			},
			{
				title: "互联网安全管理平台",
				url: "https://beian.mps.gov.cn/#/query/webSearch",
				desc: "网站备案信息查询",
			},
		],
	},
	{
		id: "intel",
		name: "漏洞与情报",
		icon: "material-symbols:shield-radar-outline-rounded",
		desc: "漏洞、动态与安全观察",
		weight: 80,
		items: [
			{
				title: "CNNVD",
				url: "https://www.cnnvd.org.cn/frontend/childHome",
				desc: "国家信息安全漏洞库",
				weight: 30,
			},
			{
				title: "CNVD",
				url: "https://www.cnvd.org.cn/",
				desc: "国家漏洞共享平台",
				weight: 20,
			},
			{
				title: "CNCERT",
				url: "https://www.cert.org.cn/portal/index.htm",
				desc: "国家互联网应急中心",
				weight: 10,
			},
			{
				title: "网站验证码防护",
				url: "https://help.yunaq.com/faq/634/index.html",
				desc: "验证码保护入门说明",
			},
			{
				title: "补天",
				url: "https://www.butian.net/",
				desc: "企业安全响应平台",
			},
			{
				title: "EDUSRC",
				url: "https://src.sjtu.edu.cn/",
				desc: "高校漏洞报告平台",
			},
			{
				title: "漏洞盒子",
				url: "https://www.vulbox.com/projects/list",
				desc: "漏洞盒子项目大厅",
			},
			{
				title: "XVI 漏洞情报",
				url: "https://xvi.vulbox.com/",
				desc: "扩展漏洞情报",
			},
			{
				title: "Qualys 社区",
				url: "https://community.qualys.com/",
				desc: "安全社区与漏洞讨论",
			},
			{
				title: "神龙漏洞库",
				url: "https://cve.imfht.com/",
				desc: "CVE 查询、分析与 POC",
			},
			{
				title: "首个 CVE 申请指南",
				url: "https://zone.ci/secarticles/wx/576697.html",
				desc: "首个 CVE 申请流程",
			},
			{
				title: "阿里云漏洞库",
				url: "https://avd.aliyun.com/",
				desc: "阿里云漏洞情报",
			},
			{
				title: "Secure Flow",
				url: "https://secureflow.scope-sentry.top/all",
				desc: "网络安全信息流",
			},
			{
				title: "信息安全知识库",
				url: "https://wx.secv.cc/",
				desc: "信息安全知识库",
			},
			{
				title: "探知 AI 话题",
				url: "https://techzhi.com/c/5-category/5",
				desc: "AI 话题与技术动态",
			},
		],
	},
	{
		id: "writeups",
		name: "题解与博客",
		icon: "material-symbols:article-outline-rounded",
		desc: "别人踩过的坑，值得多看",
		weight: 75,
		items: [
			{
				title: "离别歌",
				url: "https://www.leavesongs.com/",
				desc: "Web 安全与代码审计博客",
				weight: 30,
			},
			{
				title: "神域博客",
				url: "https://godyu.com/",
				desc: "安全文章与赛题复盘",
				weight: 20,
			},
			{
				title: "BUUCTF Web 合集",
				url: "https://www.cnblogs.com/guoli0628/p/18115377",
				desc: "Web 题目合集",
				weight: 10,
			},
			{
				title: "Web Security Learning",
				url: "https://chybeta.github.io/2017/08/19/Web-Security-Learning/",
				desc: "Web 安全学习资料合集",
			},
			{
				title: "CTF-Web 修炼手册",
				url: "https://wilesangh.github.io/ctf-web/",
				desc: "CTF Web 方向学习手册",
			},
			{
				title: "LitCTF 2026 官方 WP",
				url: "https://godyu.com/16488.html",
				desc: "LitCTF 2026 官方题解",
			},
			{
				title: "RCE-labs 靶场日记",
				url: "https://jishuzhan.net/article/1950725521066733569",
				desc: "RCE-labs 靶场记录",
			},
			{
				title: "SUCTF 2026 CyberTrack WP",
				url: "https://mnzn.me/archives/suctf2026#%E9%A2%98%E8%A7%A3",
				desc: "CyberTrack 出题人题解",
			},
			{
				title: "SUCTF 2026 攻防世界",
				url: "https://adworld.xctf.org.cn/community/knowledge/detail/5d2c745f7fd49773a4cc0e1a7bb3111c",
				desc: "SUCTF 2026 赛题复盘",
			},
			{
				title: "JTaoX 的博客",
				url: "https://blog.csdn.net/2501_93740701?type=blog",
				desc: "CTF 与安全文章",
			},
			{
				title: "攻防世界 Reverse 100",
				url: "https://www.cnblogs.com/Maggieissm/p/12002019.html",
				desc: "x64 ELF 逆向题解",
			},
			{
				title: "攻防世界 MISC：stegano",
				url: "https://www.cnblogs.com/LY613313/p/16180152.html",
				desc: "Stegano 隐写题解",
			},
			{
				title: "攻防世界 MISC 新手题",
				url: "https://blog.csdn.net/mastergu2/article/details/106564450",
				desc: "Misc 新手题题解",
			},
			{
				title: "攻防世界 Web 合集",
				url: "https://blog.csdn.net/qq_52364123/article/details/135236605",
				desc: "攻防世界 Web 题解",
			},
			{
				title: "Normal RSA 题解",
				url: "https://www.cnblogs.com/zhengna/p/13497028.html",
				desc: "RSA 与工具使用",
			},
			{
				title: "easychallenge 题解",
				url: "https://www.cnblogs.com/zhengna/p/13477114.html",
				desc: "Pyc 反编译题解",
			},
			{
				title: "Normal RSA 新手题",
				url: "https://www.jianshu.com/p/b412de427503",
				desc: "RSA 新手题思路",
			},
			{
				title: "攻防世界 MISC：ext3",
				url: "https://www.cnblogs.com/LY613313/p/16180148.html",
				desc: "Ext3 取证题解",
			},
			{
				title: "攻防世界 Reverse 新手题",
				url: "https://www.cnblogs.com/luckymx/p/13293909.html",
				desc: "Reverse 新手题思路",
			},
			{
				title: "托马斯·杰斐逊密码",
				url: "https://www.cnblogs.com/0yst3r-2046/p/11810574.html",
				desc: "古典密码题解",
			},
			{
				title: "BUUCTF Web 详解",
				url: "https://blog.csdn.net/m0_52923241/article/details/119641325",
				desc: "BUUCTF Web 题解",
			},
			{
				title: "BUUCTF Crypto 题解",
				url: "https://blog.csdn.net/ao52426055/article/details/109304646",
				desc: "BUUCTF Crypto 题解",
			},
			{
				title: "BUUCTF Reverse1",
				url: "https://blog.csdn.net/weixin_62387234/article/details/126270239",
				desc: "Reverse1 入门题解",
			},
			{
				title: "BUUCTF Reverse 题解",
				url: "https://www.cnblogs.com/qjsswz/p/18392428#2-reverse1",
				desc: "Reverse 系列题解",
			},
			{
				title: "BUUCTF Pwn 1-12",
				url: "https://blog.csdn.net/qq_29912475/article/details/129247665",
				desc: "Pwn 入门题解",
			},
			{
				title: "BUUCTF Pwn 入门",
				url: "https://www.cnblogs.com/Woxuany1/p/18508196",
				desc: "Pwn 方向入门记录",
			},
			{
				title: "BUUCTF Misc 合集",
				url: "https://www.cnblogs.com/lordtianqiyi/articles/17591672.html",
				desc: "Misc 题目合集",
			},
			{
				title: "BUUCTF Crypto WP",
				url: "https://www.cnblogs.com/ForBreeze/p/17938936#_label3",
				desc: "Crypto 题目合集",
			},
			{
				title: "sqli-labs 通关笔记",
				url: "https://www.cnblogs.com/1ink/category/2002703.html",
				desc: "SQL 注入练习笔记",
			},
			{
				title: "ctf.show Web 笔记",
				url: "https://blog.csdn.net/m0_75233418/article/details/151362133",
				desc: "Web 安全课程笔记",
			},
			{
				title: "一句话木马绕过",
				url: "https://www.cnblogs.com/toki-plus/p/16058785.html#%E4%B8%80%E5%8F%A5%E8%AF%9D%E6%9C%A8%E9%A9%AC%E7%BB%95%E8%BF%87",
				desc: "一句话木马绕过笔记",
			},
			{
				title: "文件包含漏洞总结",
				url: "https://blog.csdn.net/Hardworking666/article/details/116609849",
				desc: "LFI 与 RFI 漏洞总结",
			},
			{
				title: "RCE 与文件包含",
				url: "https://luo-kaihong.github.io/p/rce%E4%B8%8E%E6%96%87%E4%BB%B6%E5%8C%85%E5%90%AB%E6%80%BB%E7%BB%93/",
				desc: "RCE 与文件包含笔记",
			},
			{
				title: "VulnHub 靶场入门",
				url: "https://blog.csdn.net/weixin_46428928/article/details/143108153",
				desc: "VulnHub 靶场实战",
			},
			{
				title: "小转风 CTF",
				url: "http://index.ctfwiki.cn/",
				desc: "CTF 爱好者资源站",
			},
			{
				title: "极客指北",
				url: "https://www.90svip.cn/",
				desc: "计算机与安全学习资源",
			},
			{
				title: "Tr0y's Blog",
				url: "https://www.tr0y.wang/",
				desc: "安全研究与技术博客",
			},
			{
				title: "一行栗子",
				url: "https://iucoder99.github.io/blog_pages/",
				desc: "开发与安全技术博客",
			},
			{ title: "道言", url: "https://lhn.wang/", desc: "安全与技术个人博客" },
			{
				title: "猫不吃鱼",
				url: "https://starsei.com/",
				desc: "安全与技术个人博客",
			},
			{
				title: "PHP 到 Webshell",
				url: "https://www.nssctf.cn/note/set/4321",
				desc: "PHP Web 安全笔记",
			},
			{
				title: "Fqzlr 的博客",
				url: "https://fqzlr.com/posts/",
				desc: "CTF 与安全技术文章",
			},
			{
				title: "Mugzx's Blog",
				url: "https://blog.mugzx.top/",
				desc: "安全与技术博客",
			},
			{
				title: "Modern Blog",
				url: "https://blog.andyjin.website/",
				desc: "安全与技术博客",
			},
			{
				title: "Carm's Home",
				url: "https://www.carm.cc/",
				desc: "编程与摄影记录",
			},
			{
				title: "小毛毛熊",
				url: "https://xiaommx.cn/",
				desc: "个人作品与技术记录",
			},
			{
				title: "I Love PIKAQIANG",
				url: "https://pikaqiang-up.github.io/",
				desc: "技术个人博客",
			},
			{
				title: "Rainbow's Blog",
				url: "https://rainbow-blog-ubaue6c9.edgeone.cool/",
				desc: "二进制安全与 Pwn",
			},
			{
				title: "zhizuijimi",
				url: "https://luo-kaihong.github.io/",
				desc: "安全实战与题目笔记",
			},
			{
				title: "F0xm1ao",
				url: "https://foxmiao.fun/",
				desc: "安全技术个人博客",
			},
			{
				title: "DOUCUBE",
				url: "https://www.d0ucube.com/",
				desc: "安全技术个人博客",
			},
			{
				title: "liernian",
				url: "https://liernian.github.io/",
				desc: "安全与技术个人博客",
			},
			{
				title: "洛尧的小窝",
				url: "https://luo.tianyi.love/theme_common/index.html#articles",
				desc: "技术个人博客",
			},
			{
				title: "ming's Blog",
				url: "https://jzzt.cc.cd/archive/",
				desc: "安全与技术博客",
			},
			{
				title: "落叶师傅",
				url: "https://luoyeye.cn/",
				desc: "Web 安全技术博客",
			},
			{
				title: "Asa 的博客",
				url: "https://asa12138.github.io/index.html?lang=zh",
				desc: "代码与安全技术记录",
			},
		],
	},
	{
		id: "learning",
		name: "计算机学习",
		icon: "material-symbols:menu-book-outline-rounded",
		desc: "课程、路线与计算机基础",
		weight: 70,
		items: [
			{
				title: "CS 自学指南",
				url: "https://csdiy.wiki/",
				desc: "计算机科学自学指南",
				weight: 30,
			},
			{
				title: "Missing Semester",
				url: "https://missing-semester-cn.github.io/",
				desc: "计算机教育基础课",
				weight: 20,
			},
			{
				title: "CTF Wiki Web 篇",
				url: "https://ctf-wiki.org/web/introduction/",
				desc: "CTF Web 基础教程",
				weight: 10,
			},
			{
				title: "图数据结构可视化",
				url: "https://www.ilab-x.com/details/page?id=12170&isView=true",
				desc: "算法与数据结构可视化",
			},
			{ title: "极客百科", url: "https://baike.io/", desc: "开放技术百科" },
			{
				title: "CTF Wiki 简介",
				url: "https://zh.wikipedia.org/wiki/%E5%A5%AA%E6%97%97_(%E7%B6%B2%E8%B7%AF%E5%AE%89%E5%85%A8)",
				desc: "CTF 概念与基础介绍",
			},
			{
				title: "VMware 安装教程",
				url: "https://jishuzhan.net/article/2039708959719297026",
				desc: "VMware 安装与配置",
			},
			{
				title: "CTF 入门与学习方法",
				url: "https://marlous.github.io/2018/12/09/%E4%BF%A1%E6%81%AF%E5%AE%89%E5%85%A8%E3%80%81CTF%20%E5%85%A5%E9%97%A8%E4%B8%8E%E5%AD%A6%E4%B9%A0%E6%96%B9%E6%B3%95%E7%AC%94%E8%AE%B0%EF%BC%88%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0%EF%BC%89/#5-CTF-%E5%86%85%E5%AE%B9%E3%80%81%E8%B5%84%E6%96%99%E3%80%81%E5%B7%A5%E5%85%B7%E3%80%81%E6%BC%94%E7%BB%83%E5%B9%B3%E5%8F%B0",
				desc: "CTF 入门与学习路线",
			},
			{
				title: "网络安全入门综述",
				url: "https://xp0int-team.feishu.cn/wiki/wikcnnWbXXGELt1xHkyBhvdQKrh",
				desc: "网络安全入门知识",
			},
			{
				title: "KanaDE Web 安全",
				url: "https://kanade-chan.top/ctf/02-web/",
				desc: "Web 安全学习笔记",
			},
			{
				title: "Linux 命令面试题",
				url: "https://xiaolincoding.com/interview/linux.html#linux%E7%9A%84%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4%E4%BA%86%E8%A7%A3%E8%BF%87%E5%93%AA%E4%BA%9B",
				desc: "Linux 常用命令整理",
			},
			{
				title: "CS 自学路线图",
				url: "https://www.learncs.site/docs/roadmap",
				desc: "计算机自学路线图",
			},
			{
				title: "Web 安全学习笔记",
				url: "https://freebsd-study.readthedocs.io/zh-cn/latest/index.html",
				desc: "Web 安全系统笔记",
			},
			{
				title: "it小窝",
				url: "https://app.itxiaowo.cn/",
				desc: "计算机学习平台",
			},
			{
				title: "廖雪峰 Java 教程",
				url: "https://liaoxuefeng.com/books/java/introduction/index.html",
				desc: "Java 基础中文教程",
			},
			{
				title: "C 语言中文网",
				url: "https://m.biancheng.net/sitemap/",
				desc: "C 语言学习资料",
			},
			{
				title: "Road 2 Coding",
				url: "https://www.r2coding.com/#/README?id=%e7%bc%96%e7%a8%8b%e8%87%aa%e5%ad%a6%e8%b7%af%e7%ba%bf%e7%9f%a5%e8%af%86%e5%a4%a7%e6%a2%b3%e7%90%86",
				desc: "编程自学路线图",
			},
			{
				title: "缺失的计算机课",
				url: "https://www.criwits.top/missing/",
				desc: "计算机基础课程",
			},
			{
				title: "0xFFFF CS Wiki",
				url: "https://www.yuque.com/0xffff.one/cs-learning",
				desc: "计算机科学学习 Wiki",
			},
			{
				title: "0xFFFF 入门专题",
				url: "https://wiki.0xffff.one/getting-started/",
				desc: "计算机入门路线",
			},
			{
				title: "计算机学习札记",
				url: "https://www.criwits.top/",
				desc: "计算机技术学习札记",
			},
			{
				title: "大学之道",
				url: "https://daxuezhidao.feishu.cn/wiki/wikcnlUOnzUPzQ2ZlRY9TtxPhob",
				desc: "大学学习方法与规划",
			},
			{
				title: "学习工作流",
				url: "https://sspai.com/post/75969",
				desc: "个人学习工作流",
			},
			{
				title: "OI Wiki 字符串",
				url: "https://oi-wiki.org/string/",
				desc: "字符串与算法专题",
			},
			{
				title: "Keybr 打字练习",
				url: "https://www.keybr.com/",
				desc: "在线打字练习",
			},
			{
				title: "Troy Hunt 工作坊",
				url: "https://www.troyhunt.com/workshops/",
				desc: "Web 安全与云安全课程",
			},
			{
				title: "Protocol Explorer",
				url: "https://protocol-explorer-alpha.vercel.app/",
				desc: "网络协议交互式学习",
			},
			{
				title: "DeepTutor",
				url: "https://juejin.cn/post/7672747532376899619",
				desc: "AI 导师与学习方法",
			},
			{
				title: "Linux 入门教程",
				url: "https://blog.csdn.net/bigbangbangbang1/article/details/131575669",
				desc: "Linux 入门教程",
			},
			{
				title: "AC 自动机",
				url: "https://www.cnblogs.com/hyfhaha/p/10802604.html",
				desc: "AC 自动机算法讲解",
			},
			{
				title: "HTTP GET 与 POST",
				url: "https://www.cnblogs.com/williamjie/p/9099940.html",
				desc: "HTTP 请求方法讲解",
			},
			{
				title: "机工教育",
				url: "http://www.cmpedu.com/index.htm",
				desc: "机械工业出版社教育服务",
			},
			{
				title: "Linux Journey",
				url: "https://labex.io/zh/lesson/debian",
				desc: "Debian 入门课程",
			},
			{
				title: "洛谷题单",
				url: "https://www.luogu.com.cn/training/list",
				desc: "洛谷算法题单",
			},
			{
				title: "Nowcoder Tracker",
				url: "https://www.nowcoder.com/problem/tracker#/problems",
				desc: "牛客刷题进度管理",
			},
			{
				title: "0xFFFF 社区",
				url: "https://0xffff.one/p/2-0xffff-intro",
				desc: "校园技术社区介绍",
			},
			{
				title: "大学培养方案",
				url: "https://blog.csdn.net/sxhelijian/article/details/86152950",
				desc: "大学培养方案思考",
			},
			{
				title: "PythonEdu",
				url: "http://www.studyz.cn/manage/72/wiki/?wiki_id=281",
				desc: "Python 在线学习",
			},
		],
	},
	{
		id: "dev",
		name: "开发与文档",
		icon: "material-symbols:code-rounded",
		desc: "写代码时离不开的文档",
		weight: 65,
		items: [
			{
				title: "GitHub",
				url: "https://github.com",
				desc: "全球最大的代码托管平台",
				icon: "fa7-brands:github",
				weight: 30,
			},
			{
				title: "MDN Web Docs",
				url: "https://developer.mozilla.org/zh-CN/",
				desc: "最权威的 Web 技术文档",
				weight: 20,
			},
			{
				title: "Python 内置函数",
				url: "https://docs.python.org/zh-cn/3/library/functions.html",
				desc: "Python 官方内置函数文档",
				weight: 10,
			},
			{
				title: "Astro",
				url: "https://astro.build",
				desc: "内容驱动型网站的 Web 框架",
			},
			{
				title: "Svelte",
				url: "https://svelte.dev",
				desc: "把组件编译成高效原生 JS 的框架",
			},
			{
				title: "Tailwind CSS",
				url: "https://tailwindcss.com",
				desc: "一个功能强大且灵活的 CSS 框架",
			},
			{
				title: "Requests 中文文档",
				url: "https://requests.pythonlang.cn/en/latest/user/quickstart/",
				desc: "Python HTTP 请求库文档",
			},
			{
				title: "ThinkPHP 文档",
				url: "https://www.thinkphp.cn/doc",
				desc: "ThinkPHP 官方文档",
			},
			{
				title: "GeekHour",
				url: "https://geekhour.net/",
				desc: "开发者社区与技术课程",
			},
			{
				title: "OnlineGDB",
				url: "https://www.onlinegdb.com/",
				desc: "在线 C/C++ 编译调试",
			},
			{
				title: "Pandoc",
				url: "https://pandoc.org/",
				desc: "多格式文档转换工具",
			},
			{
				title: "Python 内置函数速查",
				url: "https://labex.io/pythoncheatsheet/zh/cheatsheet/built-in-functions",
				desc: "Python 内置函数速查",
			},
			{
				title: "ASCII 表",
				url: "https://www.runoob.com/w3cnote/ascii.html",
				desc: "ASCII 编码对照表",
			},
			{
				title: "PHP 类型比较表",
				url: "https://www.php.net/manual/zh/types.comparisons.php",
				desc: "PHP 类型比较参考",
			},
			{
				title: "Regex Vis",
				url: "https://regex-vis.com/",
				desc: "正则表达式可视化",
			},
			{
				title: "RegExr",
				url: "https://regexr.com/",
				desc: "正则表达式在线测试",
			},
			{
				title: "VS Code 数据科学",
				url: "https://code.visualstudio.com/docs/datascience/overview",
				desc: "VS Code 数据科学文档",
			},
			{
				title: "Jinja 模板",
				url: "https://www.cnblogs.com/aopstudio/p/19473655",
				desc: "Jinja 模板入门",
			},
			{
				title: "Yanki",
				url: "https://www.npmjs.com/package/yanki",
				desc: "笔记同步 npm 包",
			},
			{
				title: "SakuraFrp 文档",
				url: "https://doc.natfrp.com/",
				desc: "内网穿透帮助文档",
			},
			{
				title: "在线 C 运行环境",
				url: "https://www.jyshare.com/compile/11/",
				desc: "C 语言在线编译运行",
			},
		],
	},
	{
		id: "ai",
		name: "AI 与效率",
		icon: "material-symbols:smart-toy-outline-rounded",
		desc: "提问、翻译与整理资料",
		weight: 60,
		items: [
			{
				title: "DeepSeek",
				url: "https://chat.deepseek.com/",
				desc: "通用 AI 对话助手",
				weight: 30,
			},
			{
				title: "Kimi",
				url: "https://www.kimi.com/",
				desc: "长文本 AI 助手",
				weight: 20,
			},
			{
				title: "通义千问",
				url: "https://www.qianwen.com/",
				desc: "通义千问 AI 助手",
				weight: 10,
			},
			{
				title: "有道翻译",
				url: "https://fanyi.youdao.com/",
				desc: "文本与文档在线翻译",
			},
			{
				title: "网易有道词典",
				url: "https://dict.youdao.com/",
				desc: "中英文在线词典",
			},
			{
				title: "Obsidian 高级玩法",
				url: "https://juejin.cn/post/7145351315705577485#heading-1",
				desc: "Obsidian 进阶用法",
			},
			{
				title: "Ai好记",
				url: "https://aihaoji.com/",
				desc: "音视频转图文工具",
			},
			{
				title: "AIGC 工具导航",
				url: "https://www.aigc.cn/",
				desc: "生成式 AI 工具导航",
			},
			{
				title: "当贝 AI",
				url: "https://ai.dangbei.com/chat",
				desc: "大模型聚合对话",
			},
			{
				title: "OpenCode",
				url: "https://opencode.ai/",
				desc: "AI 编程协作工具",
			},
			{
				title: "Tavily",
				url: "https://www.tavily.com/",
				desc: "面向 AI 的搜索 API",
			},
			{
				title: "沉浸式翻译",
				url: "https://immersivetranslate.com/docs/",
				desc: "网页双语翻译工具",
			},
			{
				title: "Doc2X",
				url: "https://doc2x.noedgeai.com/parse",
				desc: "PDF 与图片 OCR 解析",
			},
			{
				title: "Obsidian 使用经验",
				url: "https://juejin.cn/post/7372400694765158441",
				desc: "Obsidian 配置与同步",
			},
			{
				title: "Lucy Agent",
				url: "https://lucy.run/",
				desc: "ComfyUI AI 助手",
			},
			{
				title: "Cephalon Cloud",
				url: "https://cephalon.cloud/",
				desc: "AIGC 应用平台",
			},
			{
				title: "huangdihd 大脑",
				url: "https://agent.shouldbe.top/",
				desc: "个人 AI 知识助手",
			},
			{
				title: "Markdown Editor",
				url: "https://md-to.com/markdown-editor/",
				desc: "在线 Markdown 编辑器",
			},
			{
				title: "Coddy",
				url: "https://aitools.fyi/zh/coddy",
				desc: "AI 编程学习工具",
			},
			{
				title: "Edge TTS",
				url: "https://edge.text-to-speech.cn/",
				desc: "在线文字转语音",
			},
		],
	},
	{
		id: "campus",
		name: "校园服务",
		icon: "material-symbols:school-outline-rounded",
		desc: "上课、作业与校园事务",
		weight: 55,
		items: [
			{
				title: "学习通",
				url: "https://i.chaoxing.com/",
				desc: "课程、作业与资料入口",
				weight: 30,
			},
			{
				title: "智慧树",
				url: "https://onlineweb.zhihuishu.com/onlinestuh5",
				desc: "在线课程学习平台",
				weight: 20,
			},
			{
				title: "江西师大教务在线",
				url: "https://jwc.jxnu.edu.cn/Portal/Index.aspx",
				desc: "教务与课程信息查询",
				weight: 10,
			},
			{
				title: "头歌实践教学平台",
				url: "https://www.educoder.net/",
				desc: "课程实验与编程练习",
			},
			{
				title: "WE Learn",
				url: "https://welearn.sflep.com/index.aspx",
				desc: "大学英语在线学习",
			},
			{
				title: "江西师大软件学院",
				url: "https://rjxy.jxnu.edu.cn/",
				desc: "学院新闻与通知",
			},
			{
				title: "BJFUOJ",
				url: "https://www.bjfuacm.com/",
				desc: "在线算法评测平台",
			},
			{
				title: "江西师大财务处",
				url: "https://cwc.jxnu.edu.cn/",
				desc: "校园财务事务入口",
			},
			{
				title: "网教盟人才服务",
				url: "https://cstc.cncstea.cn/cstc/personalHome",
				desc: "网络安全人才培养平台",
			},
		],
	},
	{
		id: "design-tools",
		name: "设计与工具",
		icon: "material-symbols:palette-outline",
		desc: "图标、配色与顺手工具",
		weight: 50,
		items: [
			{
				title: "Iconify",
				url: "https://icon-sets.iconify.design",
				desc: "海量开源图标集合搜索",
				weight: 30,
			},
			{
				title: "iconfont",
				url: "https://www.iconfont.cn",
				desc: "阿里巴巴矢量图标库",
				weight: 20,
			},
			{
				title: "TinyPNG",
				url: "https://tinypng.com",
				desc: "在线压缩 PNG / JPEG 图片",
				weight: 10,
			},
			{
				title: "Squoosh",
				url: "https://squoosh.app",
				desc: "Google 出品的图片压缩与格式转换",
			},
			{
				title: "Carbon",
				url: "https://carbon.now.sh",
				desc: "把代码片段生成漂亮的图片",
			},
			{
				title: "路由器百科",
				url: "https://www.juyuwang.cn/baike/",
				desc: "局域网与路由器知识",
			},
			{ title: "IP.SB", url: "https://ip.sb/", desc: "IP 地址与网络信息查询" },
			{
				title: "机械师驱动下载",
				url: "https://www.machenike.com/driver/download/?id=342",
				desc: "机械师官方驱动下载",
			},
			{
				title: "菜鸟图标",
				url: "https://icon.sucai999.com/",
				desc: "免费商用矢量图标",
			},
			{
				title: "draw.io",
				url: "https://app.diagrams.net/",
				desc: "在线流程图与画图",
			},
			{
				title: "菜鸟工具",
				url: "https://www.jyshare.com/",
				desc: "常用在线工具箱",
			},
			{
				title: "IP138",
				url: "https://www.ip138.com/",
				desc: "IP、手机号与归属地查询",
			},
			{
				title: "百度百科",
				url: "https://baike.baidu.com/#home",
				desc: "中文百科知识查询",
			},
			{
				title: "巧笔在线",
				url: "https://hanzi.unihan.com.cn/Qpen",
				desc: "在线汉字字典",
			},
		],
	},
	{
		id: "life",
		name: "生活与兴趣",
		icon: "material-symbols:sports-esports-outline-rounded",
		desc: "技术之外的一点快乐",
		weight: 35,
		items: [
			{
				title: "哔哩哔哩",
				url: "https://www.bilibili.com/",
				desc: "视频学习与娱乐",
				weight: 30,
			},
			{
				title: "多抓鱼",
				url: "https://www.duozhuayu.com/book",
				desc: "二手图书交易",
				weight: 20,
			},
			{
				title: "Puni Go",
				url: "https://puyogo.app/?size=8",
				desc: "自由围棋在线游戏",
				weight: 10,
			},
			{
				title: "抖音",
				url: "https://www.douyin.com/",
				desc: "短视频与生活内容",
			},
			{ title: "歌词网", url: "https://lyrics.net.cn/", desc: "歌词检索" },
			{
				title: "盐线 SALTLINE",
				url: "https://xiaommx.cn/saltline.html",
				desc: "中文独立游戏",
			},
			{
				title: "CS2Util 道具攻略",
				url: "https://www.cs2util.com/zh/mirage",
				desc: "CS2 荒漠迷城道具攻略",
			},
			{
				title: "CS2 Learn",
				url: "https://cs6657.top/#/tutorial/5",
				desc: "CS2 战术教程",
			},
			{
				title: "CS2 升级合约指南",
				url: "https://community.skin.club/zh-hans/articles-zh-hans/trade-up-contracts-guide-cs2#2026-7",
				desc: "CS2 升级合约说明",
			},
		],
	},
];
