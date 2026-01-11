# 🎬 CineVocab - 语境驱动的电影英语学习利器

CineVocab 是一款遵循 **Material You (Material 3)** 设计规范的英语单词学习应用。它突破了传统“孤立背单词”的局限，主张将单词放回其原始的影视对白语境中，通过高频、多维度的互动练习实现深度记忆。

![React](https://img.shields.io/badge/React-19-blue)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Framer_Motion](https://img.shields.io/badge/Framer-Motion-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 核心特性

### 🎨 极致的 Material You 体验
- **动态配色**：预置紫色 (Violet)、海洋 (Ocean)、自然 (Nature)、火山 (Volcano) 多款主题，支持自定义种子颜色，并完美适配深色模式。
- **流畅动画**：基于 Framer Motion 实现的丝滑过渡、列表折叠及卡片翻转效果。
- **响应式设计**：从桌面端到移动端，均能提供完美的 UI 交互体验。

### 🧠 深度学习模式
- **闪卡 (Flashcards)**：经典的记忆巩固方式，正反面切换查看语境与定义。
- **听写 (Dictation)**：强化听力理解，要求精准拼写影视剧中的原单词。
- **填空 (Cloze Test)**：根据上下文及音频提示补全台词，锻炼语感。
- **四选一 (Multiple Choice)**：通过干扰项快速自测词义理解。

### 🛠️ 强大的工程化功能
- **TTS 语音系统**：支持多国语音引擎选择，可调节语速与音调。
- **历史记录管理**：自动保存最近的导入内容，支持重命名及快速加载。
- **开发者工具**：支持一键获取远程测试数据集，方便调试。
- **导出复习**：结果页面支持将错题一键导回标准的 LaTeX 格式。

---

## 📄 数据格式说明

应用识别特定的 LaTeX 风格语法，建议配合 **AI 单词书助手** 生成数据：

```latex
\SentenceBlock[0:09:57]{His story is credible.}{他的故事是可信的。}{
    \Word{credible}{credible}{adj.}{able to be believed; convincing}[ˈkredəbl]
}
```

- `\SentenceBlock[时间戳]{原句}{翻译}{单词块}`
- `\Word{句中形式}{原型}{词性}{英文释义}[音标]`

---

## 🌐 学习生态闭环

CineVocab 是影视英语学习闭环中的重要一环：
1. **CineGlot**：从字幕文件中锁定生词并提取原始语境。
2. **AI 单词书助手**：利用大模型自动加工生词，生成释义、音标并整理为 LaTeX 格式。
3. **AI Word Book**：将数据制作成可打印的纸质版单词书，进行深度阅读。
4. **CineVocab**：数字化互动复习，利用碎片时间巩固记忆。

---

## 🚀 快速开始

### 开发环境
本项目采用现代前端技术栈，无需复杂的后端配置：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产环境
npm run build
```

### 部署
项目支持通过 GitHub Actions 自动构建并部署至静态服务器（如通过 rsync/SSH 部署至个人 VPS）。

---

## 🛠️ 技术栈
- **核心框架**：React 19
- **样式方案**：Tailwind CSS
- **动效引擎**：Framer Motion
- **图标库**：Lucide React
- **辅助功能**：Web Speech API (TTS), Canvas Confetti (庆祝动画)

---

## 📜 许可证
本项目基于 **MIT License** 开源。

© 2025 [ipangbo.cn](https://ipangbo.cn)
