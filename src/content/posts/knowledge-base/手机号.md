## **中国手机号由 11 位数字组成，结构为：1 + 运营商号段（3–9） + 用户序列号（共 9 位），即典型的 3-4-4 格式，如 139‑1234‑5678。**

## 一、手机号的标准结构

根据权威资料，中国手机号采用固定的 11 位结构： [![xtechtools.com](https://www.bing.com/th?id=ODF.ItMPxo56wJKHUXF0ZcqfUA)xtechtools.com](https://xtechtools.com/guides/phone/)

- **首位：1**（中国移动通信号码专用标识）
- **第二位：3–9**（运营商号段范围）
- **后 9 位：用户序列号**
- 显示格式通常为 **3‑4‑4**（如 138 1234 5678）

百度百科进一步说明其三段式结构：网络识别号（前 3 位）+ 地区编码（中 4 位）+ 用户号码（后 4 位）。 [![Baidu](https://www.bing.com/th?id=ODF.gDnJqmfa_THR4N6naMFvbw)Baidu](https://baike.baidu.com/item/%E6%89%8B%E6%9C%BA%E5%8F%B7%E7%A0%81/1417348)

---

## 二、运营商号段分布（2026 最新）

来源：XTechTools 指南与百度百科综合整理。 [![xtechtools.com](https://www.bing.com/th?id=ODF.ItMPxo56wJKHUXF0ZcqfUA)xtechtools.com+1](https://xtechtools.com/guides/phone/)

### ✅ 中国移动

134、135、136、137、138、139  
147、148  
150、151、152  
157、158、159  
172、178、179  
182、183、184  
187、188  
195、197、198  
（含物联网号段：1440）

### ✅ 中国联通

130、131、132  
145  
155、156  
166、167  
171、175、176  
185、186  
196

### ✅ 中国电信

133、149  
153  
162、163、164  
171、173、174、177  
180、181、182  
189  
190、191、193  
199

### ✅ 中国广电

192、1610

### ✅ 虚拟运营商（MVNO）

170、171、172 等多个子号段。

---

## 三、手机号的技术组成（更专业视角）

根据百度开发者中心技术文章，手机号在通信系统中由以下层级构成： [![Baidu](https://www.bing.com/th?id=ODF.qe5qgSZa9PGCxOnBWqH1iw)Baidu](https://developer.baidu.com/article/detail.html?id=5805658)

1. **国家码（CC）**：+86
2. **HLR 识别码（4 位）**：用于定位归属地交换中心
3. **移动接入码（MAC）/运营商号段（3 位）**
4. **用户号（ABCD，后 4 位）**

---

## 四、手机号正则表达式（验证规则）

标准合法手机号正则： [![xtechtools.com](https://www.bing.com/th?id=ODF.ItMPxo56wJKHUXF0ZcqfUA)xtechtools.com](https://xtechtools.com/guides/phone/)

`^1[3-9]\d{9}$   `

---

## 五、携号转网对号段的影响

- 号段只能**大致推断**运营商，准确率约 95%。
- 携号转网后，**号段不再代表运营商**，需通过官方查询确认。 [![xtechtools.com](https://www.bing.com/th?id=ODF.ItMPxo56wJKHUXF0ZcqfUA)xtechtools.com](https://xtechtools.com/guides/phone/)

---

## 六、为什么是 11 位？

1999 年中国将手机号从 10 位升级到 11 位，原因包括：

- 用户量激增导致号码资源不足
- 升位后容量从约 1 亿扩展到约 10 亿以上
- 在第三位后加 “0” 保留原号段记忆性（如 139 → 1390） [![Baidu](https://www.bing.com/th?id=ODF.gDnJqmfa_THR4N6naMFvbw)Baidu](https://baike.baidu.com/item/%E6%89%8B%E6%9C%BA%E5%8F%B7%E7%A0%81/1417348)

---

## 总结

中国手机号采用固定的 **11 位结构（1 + 号段 + 用户号）**，号段决定运营商类别，但携号转网后需实时查询才能确定。该结构兼顾容量、记忆性与通信系统路由需求，是当前移动通信体系的标准设计。

## 手机号码段

### 中国电信号段

[133](https://baike.baidu.com/item/133/5861335?fromModule=lemma_inlink)、149、[153](https://baike.baidu.com/item/153/6725910?fromModule=lemma_inlink)、[173](https://baike.baidu.com/item/173/22077155?fromModule=lemma_inlink)、[177](https://baike.baidu.com/item/177/19140332?fromModule=lemma_inlink)、180、[181](https://baike.baidu.com/item/181/19140217?fromModule=lemma_inlink)、[189](https://baike.baidu.com/item/189/8794797?fromModule=lemma_inlink)、[190](https://baike.baidu.com/item/190/24224539?fromModule=lemma_inlink)、[191](https://baike.baidu.com/item/191/3545545?fromModule=lemma_inlink)、193、[199](https://baike.baidu.com/item/199/22069069?fromModule=lemma_inlink)

### 中国联通号段

[130](https://baike.baidu.com/item/130/19140430?fromModule=lemma_inlink)、[131](https://baike.baidu.com/item/131/19140423?fromModule=lemma_inlink)、[132](https://baike.baidu.com/item/132/19140164?fromModule=lemma_inlink)、[145](https://baike.baidu.com/item/145/9395462?fromModule=lemma_inlink)、[155](https://baike.baidu.com/item/155/5312110?fromModule=lemma_inlink)、[156](https://baike.baidu.com/item/156/8728206?fromModule=lemma_inlink)、[166](https://baike.baidu.com/item/166/22068995?fromModule=lemma_inlink)、167、[171](https://baike.baidu.com/item/171/20194959?fromModule=lemma_inlink)、175、[176](https://baike.baidu.com/item/176/17042064?fromModule=lemma_inlink)、[185](https://baike.baidu.com/item/185/16011858?fromModule=lemma_inlink)、[186](https://baike.baidu.com/item/186/19140255?fromModule=lemma_inlink)、[196](https://baike.baidu.com/item/196/24224544?fromModule=lemma_inlink)

### 中国移动号段

134、[135](https://baike.baidu.com/item/135/16012389?fromModule=lemma_inlink)、136、137、[138](https://baike.baidu.com/item/138/8794441?fromModule=lemma_inlink)、[139](https://baike.baidu.com/item/139/12978237?fromModule=lemma_inlink)、1440、[147](https://baike.baidu.com/item/147/1161498?fromModule=lemma_inlink)、[148](https://baike.baidu.com/item/148/22069016?fromModule=lemma_inlink)、[150](https://baike.baidu.com/item/150/19140137?fromModule=lemma_inlink)、[151](https://baike.baidu.com/item/151/19140132?fromModule=lemma_inlink)、[152](https://baike.baidu.com/item/152/19140119?fromModule=lemma_inlink)、[157](https://baike.baidu.com/item/157/19140437?fromModule=lemma_inlink)、[158](https://baike.baidu.com/item/158/19140441?fromModule=lemma_inlink)、[159](https://baike.baidu.com/item/159/1877704?fromModule=lemma_inlink)、172、178、[182](https://baike.baidu.com/item/182/19140241?fromModule=lemma_inlink)、[183](https://baike.baidu.com/item/183/19140245?fromModule=lemma_inlink)、[184](https://baike.baidu.com/item/184/19140249?fromModule=lemma_inlink)、[187](https://baike.baidu.com/item/187/3670200?fromModule=lemma_inlink)、[188](https://baike.baidu.com/item/188/3687815?fromModule=lemma_inlink)、195 [1]、197、[198](https://baike.baidu.com/item/198/22067959?fromModule=lemma_inlink)

### 中国广电号段

[192](https://baike.baidu.com/item/192/24224546?fromModule=lemma_inlink)、1610 [14]

### 其他号段

14号段部分为[上网卡](https://baike.baidu.com/item/%E4%B8%8A%E7%BD%91%E5%8D%A1/2807977?fromModule=lemma_inlink)专属号段：[中国联通](https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A/194673?fromModule=lemma_inlink)145，[中国移动](https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E7%A7%BB%E5%8A%A8/237216?fromModule=lemma_inlink)147，[中国电信](https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E7%94%B5%E4%BF%A1/138709?fromModule=lemma_inlink)149.

[虚拟运营商](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E8%BF%90%E8%90%A5%E5%95%86/4530533?fromModule=lemma_inlink)：

电信：1700、1701、1702、162

移动：1703、1705、1706、[165](https://baike.baidu.com/item/165/23239979?fromModule=lemma_inlink)

[联通](https://baike.baidu.com/item/%E8%81%94%E9%80%9A/0?fromModule=lemma_inlink)：1704、1707、1708、1709、[171](https://baike.baidu.com/item/171/20194959?fromModule=lemma_inlink)、167

[卫星通信](https://baike.baidu.com/item/%E5%8D%AB%E6%98%9F%E9%80%9A%E4%BF%A1/413212?fromModule=lemma_inlink)：[1349](https://baike.baidu.com/item/1349/16129632?fromModule=lemma_inlink)、174

[物联网](https://baike.baidu.com/item/%E7%89%A9%E8%81%94%E7%BD%91/7306589?fromModule=lemma_inlink)：140、[141](https://baike.baidu.com/item/141/22069633?fromModule=lemma_inlink)、[144](https://baike.baidu.com/item/144/22069941?fromModule=lemma_inlink)、[146](https://baike.baidu.com/item/146/22068997?fromModule=lemma_inlink)、[148](https://baike.baidu.com/item/148/22069016?fromModule=lemma_inlink)