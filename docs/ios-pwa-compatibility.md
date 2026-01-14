# iOS Safari & PWA 兼容性优化技术文档

在 CineVocab 的开发过程中，针对 iOS 平台（尤其是 PWA 模式）下的视觉一致性和状态栏（灵动岛区域）颜色同步问题，我们实施了一系列底层优化。本文档总结了这些问题的根源及其最终解决方案。

## 1. 状态栏与安全区颜色同步 (Safe Area)

### 核心问题
在 iOS PWA 模式下，顶部的灵动岛（或状态栏）区域通常会锁定在应用启动时解析到的第一个 `meta[name="theme-color"]` 标签。即使用户通过 JavaScript 切换了主题，Safari 往往不会主动刷新该区域的背景色，导致界面出现“断层”。

### 解决方案：Nuke and Pave (推倒重来)
仅仅修改 `content` 属性是不够的。我们在 `utils/theme.ts` 中采用了“移除并重新注入”的策略：
- **操作**：每次切换主题时，先通过 `querySelectorAll` 查找并彻底删除所有现有的 `theme-color` 元标签。
- **目的**：强制 Safari 重新评估页面头部配置，从而触发状态栏颜色的重绘。

---

## 2. 解决启动/刷新时的“紫屏闪烁” (Theme Flashing)

### 核心问题
HTML 解析是静态的，而用户的主题偏好（如“海洋蓝”）存储在 LocalStorage 中。在 React 框架加载和 `useEffect` 执行之前，浏览器会按照 HTML 定义的默认值（紫色）进行首屏渲染（First Paint）。这会导致用户在刷新时看到零点几秒的紫色背景闪烁。

### 解决方案：同步预加载脚本 (Inline Critical Script)
在 `index.html` 的 `<head>` 区域最前方注入了一段原生 JavaScript：
- **逻辑**：在浏览器解析 `<body>` 之前，直接读取 `localStorage`。
- **操作**：
    1. 计算出正确的 `targetColor`。
    2. 同步设置 `document.documentElement.style.backgroundColor`。
    3. 动态创建一个 ID 为 `theme-critical-styles` 的 `<style>` 标签，使用 `!important` 强行覆盖 CSS 变量。
- **效果**：确保浏览器在进行“第一次绘制”时，背景色已经与用户设置的一致。

---

## 3. 解除 CSS 优先级死锁 (Style Override)

### 核心问题
由于预加载脚本为了防止闪烁使用了 `!important`，这导致应用进入 React 运行阶段后，`utils/theme.ts` 通过内联样式修改背景的操作被拦截（内联样式优先级低于 `!important` 的 Style 标签）。

### 解决方案：控制权交接
在 `utils/theme.ts` 的 `applyTheme` 函数中加入清理逻辑：
- **操作**：检测并删除 ID 为 `theme-critical-styles` 的临时样式表。
- **时机**：在 React 完成首屏数据准备并准备接管 UI 渲染时。
- **效果**：由静态预加载平滑过渡到动态 JS 控制，恢复主题切换的实时响应。

---

## 4. 视口与手势适配 (Viewport & Gestures)

### 基础配置
为了让 Web 应用更像原生 App，我们在 `viewport` 和 `meta` 标签中做了以下处理：
- **`viewport-fit=cover`**：允许内容扩展到安全区下方（如刘海屏/灵动岛区域）。
- **`apple-mobile-web-app-status-bar-style: default`**：配合动态 `theme-color` 标签，实现状态栏文字自动根据背景深浅切换黑白。
- **`overscroll-behavior-y: none`**：在 `body` 上禁用橡皮筋效果，防止用户下拉导致整个 Webview 偏移，影响沉浸感。
- **`env(safe-area-inset-top/bottom)`**：在 CSS 中使用环境变量为导航栏预留安全间距。

## 5. 渲染时机优化 (Layout Timing)

### 问题
使用 `useEffect` 应用主题在某些高性能设备上仍可能察觉到细微的颜色跳变。

### 解决方案
在 `App.tsx` 中使用 `useLayoutEffect` 代替 `useEffect` 来执行 `applyTheme`。这保证了在 DOM 突变之后、浏览器绘制（Paint）之前，所有的 CSS 变量已经更新完毕。

---
*文档更新日期：2025年1月*