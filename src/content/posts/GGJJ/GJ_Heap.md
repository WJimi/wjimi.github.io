---
title: 最小堆、最大堆与优先队列详解
published: 2026-09-06
description: 大二上项目
tags:
  - 算法与数据结构
category: 算法与数据结构课程项目
draft: false
---
这三个概念紧密相关但有本质区别，下面由浅入深为你梳理。

---

## 核心概念辨析

### 堆（Heap）

堆本质上是一棵**完全二叉树**（Complete Binary Tree），同时满足**堆序性（Heap Property）**：

- 树中任意节点的值与其子节点之间存在确定的大小关系
- 堆通常用**数组**来存储，利用下标关系隐式表达父子关系：
    - 父节点下标 `i`，左子节点 `2i + 1`，右子节点 `2i + 2`
    - 子节点下标 `i`，父节点 `(i - 1) / 2`

### 最小堆（Min-Heap）

**堆序性**：每个节点的值 **≤** 其子节点的值。

```
        1
       / \
      3   2
     / \ / \
    6  5 4  8
```

- **堆顶（根节点）** 是整个堆中的 **最小值**
- 典型应用：求 Top-K 最小值、Dijkstra 最短路径、Huffman 编码

### 最大堆（Max-Heap）

**堆序性**：每个节点的值 **≥** 其子节点的值。

```
        8
       / \
      6   7
     / \ / \
    2  3 4  1
```

- **堆顶（根节点）** 是整个堆中的 **最大值**
- 典型应用：堆排序、求 Top-K 最大值

### 优先队列（Priority Queue）

优先队列是一个**抽象数据类型（ADT）**，它定义的是**行为契约**，而非具体实现：

- 每个元素带有一个**优先级**
- 出队时，优先级最高（或最低）的元素先出
- 支持操作：`insert`、`extractMin/Max`、`peek`

> **关键区别**：堆是优先队列最经典的**实现方式**，但优先队列 ≠ 堆。优先队列也可以用无序数组、有序链表、二叉搜索树等实现，只是效率不同。

|对比维度|最小堆|最大堆|优先队列|
|---|---|---|---|
|本质|数据结构|数据结构|抽象数据类型|
|堆顶元素|最小值|最大值|取决于实现|
|实现方式|数组/完全二叉树|数组/完全二叉树|堆、BST、链表等|
|典型场景|最小值优先调度|堆排序、最大值优先|任务调度、图算法|

---

## 堆的核心算法操作

### 上浮（Sift Up / Bubble Up）

**触发时机**：插入新元素时

```
将新元素放到数组末尾（完全二叉树最后一个位置）
while 当前节点 < 父节点:
    交换当前节点与父节点
    当前节点上移
```

### 下沉（Sift Down / Heapify）

**触发时机**：删除堆顶元素时

```
将堆尾元素移到堆顶
while 当前节点 > 子节点中的较优者:
    交换当前节点与较优子节点
    当前节点下移
```

### 建堆（Build Heap）

从最后一个非叶节点开始，**逆序**对每个节点执行下沉操作：

```cpp
for (int i = n / 2 - 1; i >= 0; i--) {
    siftDown(arr, n, i);
}
```

- 时间复杂度：O(n)（而非直觉上的 O(n log n)）

### 复杂度总结

|操作|时间复杂度|
|---|---|
|插入|O(log n)|
|删除堆顶|O(log n)|
|获取堆顶|O(1)|
|建堆|O(n)|
|堆排序|O(n log n)|

---

## C++ 开发中会用到的技术栈

### 1. STL 中的 `std::priority_queue`

```cpp
#include <queue>

// 默认最大堆
std::priority_queue<int> maxHeap;

// 最小堆（greater 比较器反转序关系）
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
```

底层是 `std::vector` + 堆算法（`std::push_heap` / `std::pop_heap`）。

### 2. STL 堆算法（底层实现原理）

```cpp
#include <algorithm>

std::vector<int> heap = {3, 1, 4, 1, 5};

std::make_heap(heap.begin(), heap.end());              // 建堆（默认最大堆）
std::push_heap(heap.begin(), heap.end());               // 插入后上浮
std::pop_heap(heap.begin(), heap.end());                // 弹出堆顶到末尾
std::sort_heap(heap.begin(), heap.end());               // 堆排序
```

### 3. 自定义比较器（用于对象入堆）

```cpp
struct Task {
    int priority;
    std::string name;
};

// 最大堆：优先级高的先出
struct CompareTask {
    bool operator()(const Task& a, const Task& b) {
        return a.priority < b.priority;  // 注意：STL 比较器是"小于"表示优先级低
    }
};

std::priority_queue<Task, std::vector<Task>, CompareTask> taskQueue;
```

### 4. 模板与泛型编程

你的可视化平台需要支持不同类型，模板是核心：

```cpp
template <typename T, typename Compare = std::less<T>>
class Heap {
    std::vector<T> data;
    Compare comp;

    void siftUp(int i) { /* ... */ }
    void siftDown(int i) { /* ... */ }
public:
    void insert(const T& val);
    T extractTop();
    T peek() const;
};
```

### 5. 可视化相关的 C++ 技术选型建议

|需求|推荐方案|
|---|---|
|GUI 框架|Qt（信号槽机制适合事件驱动可视化）|
|树结构渲染|QGraphicsView / QGraphicsScene|
|动画效果|QPropertyAnimation（节点移动、颜色渐变）|
|数组↔树视图联动|Model/View 架构（QAbstractItemModel）|
|算法步骤回放|命令模式 + 操作录制队列|

### 6. 智能指针管理树节点

```cpp
struct TreeNode {
    int value;
    std::shared_ptr<TreeNode> left;
    std::shared_ptr<TreeNode> right;
};
```

---

## 一句话总结

> **堆**是一种满足堆序性的完全二叉树数据结构；**最小堆/最大堆**是堆的两种变体，区别在于根节点是最小值还是最大值；**优先队列**是定义了"按优先级出队"行为的抽象接口，堆只是它最高效的实现之一。

你的可视化平台建议**手动实现堆**（而非直接用 STL），这样可以在每一步操作中插入动画回调，让用户直观看到上浮、下沉的过程，这才是教学可视化的核心价值所在。

---

需要我帮你写一份最小堆的 C++ 手动实现代码吗？包含 insert、extractMin 和 siftUp/siftDown 的完整逻辑，可以直接作为你的项目基础。