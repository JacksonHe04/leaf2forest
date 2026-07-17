# DESIGN

## 视觉方向

整体视觉参考：

* 老式学校档案馆
* 大学图书馆
* 复古相册
* 植物标本册
* 手工装订书籍

避免：

* 现代 SaaS Dashboard 风格
* 社交媒体风格
* 强商业产品感
* 大量卡片堆叠

Leaf2Forest 应该像：一本二十年后依然愿意打开的数字纪念册。

## 设计系统 Design System

为了保证长期维护和视觉一致性，Leaf2Forest 必须建立统一 Design System。

禁止：

* 页面内重复定义颜色
* 重复书写 spacing
* 不同页面产生不同 Button/Card 样式
* 随意添加新的 UI 风格

所有视觉变量统一管理。

---

## 技术基础

UI 基础：

* Shadcn UI
* Radix UI Primitive
* Tailwind CSS

组件原则：

> 使用 Shadcn UI 提供基础能力，在其上构建 Leaf2Forest 专属视觉层。

不直接修改第三方组件。

---

## Design Token

所有设计变量集中维护。

例如：

```
design-system

colors
typography
spacing
radius
shadow
animation
```

---

## 色彩系统

### Primary Background

页面主背景：

```
Archive Paper

#F7F3EA
```

用于：

* 页面背景
* 卡片区域

---

### Foreground

主要文字：

```
Ink

#29251F
```

模拟墨水颜色。

---

### Forest Green

辅助色：

```
Forest

#53654A
```

用于：

* 标签
* Icon
* 强调信息

---

### Antique Gold

点缀：

```
Gold

#B79A62
```

用于：

* 时间节点
* 分割线
* 特殊标识

---

## Typography

字体体系：

### Display Font

用于：

* 首页标题
* 页面标题
* 大型数字

推荐：

* Cormorant Garamond
* Playfair Display

---

### Body Font

中文正文：

推荐：

* 思源宋体
* Noto Serif SC

---

字体规则：

标题：

```
serif
font-weight: 500
letter-spacing: 0.02em
```

正文：

```
serif
line-height: 1.8
```

---

### 圆角系统

避免现代 SaaS 的大圆角。

采用轻微书籍感：

```
sm:
6px

md:
10px

lg:
16px
```

---

### 阴影系统

不使用强烈卡片阴影。

采用纸张浮起效果：

```
shadow-paper

0 4px 20px rgba(0,0,0,0.05)
```

---

### 动效系统

使用 Framer Motion。

原则：

慢、轻、自然。

禁止：

* 弹跳
* 夸张动画
* 游戏化效果

适用：

页面进入：

* fade
* translateY

卡片：

* hover lift

音频：

* waveform animation