# Windows 本地轻量级 MD 文件阅读器：AI 开发计划

> 本文档面向 AI 编程 Agent 使用。目标不是写给真人程序员看的概念说明，而是将开发任务拆解为可执行、可验证、可逐步提交的步骤。

---

## 1. 项目目标

开发一个运行在 Windows 系统上的本地轻量级 Markdown 文件阅读器。

核心关键词：

- 美观：界面现代、干净、阅读体验好，支持亮色/暗色主题。
- 高效：启动快、打开文件快、滚动顺畅，适合日常阅读大量 `.md` 文件。
- 轻量：避免 Electron 这类较重方案，优先使用 Tauri + Web 前端技术。
- 本地：所有文件读取、渲染、搜索都在本机完成，不依赖云端服务。
- 阅读优先：第一版只做阅读器，不做完整 Markdown 编辑器。

---

## 2. 技术栈固定方案

AI 开发时不要再重新选择技术栈，直接按以下方案执行。

### 2.1 桌面应用框架

- Tauri 2
- 目标平台：Windows 10 / Windows 11
- 使用 Tauri 的本地能力处理文件选择、文件读取、窗口配置、打包安装。

### 2.2 前端框架

- React
- TypeScript
- Vite

### 2.3 样式与 UI

- TailwindCSS
- Radix UI 或 shadcn/ui 思路进行组件拆分
- 不强依赖完整组件库，优先自定义轻量组件

### 2.4 Markdown 渲染

- markdown-it：Markdown 解析
- markdown-it-anchor：标题锚点
- DOMPurify：清理 Markdown 中的 HTML，避免不安全内容
- Shiki：代码块高亮

### 2.5 状态管理与本地数据

第一版优先使用：

- React Context + 自定义 hooks
- localStorage 保存简单偏好

第二版如状态变复杂再引入：

- Zustand
- Tauri Store Plugin 或 SQLite

### 2.6 搜索

第一版：

- 当前文件内搜索

第二版：

- MiniSearch 或 FlexSearch 做文件夹级全文搜索

---

## 3. 第一版 MVP 范围

第一版只实现以下功能，不要提前扩展复杂功能。

### 3.1 必做功能

1. 打开单个 `.md` 文件
2. 读取并渲染 Markdown 内容
3. 支持标题、段落、列表、引用、表格、图片、链接、代码块
4. 支持代码高亮
5. 支持亮色/暗色主题切换
6. 支持目录大纲，根据 h1 / h2 / h3 自动生成
7. 支持当前文件内搜索
8. 支持最近打开文件列表
9. 支持拖拽 `.md` 文件打开
10. 支持基本错误提示，例如文件不存在、读取失败、格式不支持
11. 支持 Windows 打包成可安装文件

### 3.2 暂不做功能

第一版不要做以下功能：

- Markdown 编辑器
- 云同步
- 账号系统
- 插件市场
- 多人协作
- AI 总结
- 富文本编辑
- Git 管理
- Obsidian 级双链系统
- 多窗口复杂管理

---

## 4. 项目初始化任务

### 4.1 检查开发环境

AI Agent 需要先执行以下检查：

```bash
node -v
pnpm -v
rustc --version
cargo --version
```

如果 `pnpm` 不存在，优先安装 pnpm。

```bash
npm install -g pnpm
```

如果 Rust 不存在，需要提示安装 Rust 工具链，然后继续。

验收标准：

- Node 可以正常运行
- pnpm 可以正常运行
- Rust 和 Cargo 可以正常运行
- 终端在项目根目录执行命令不会报权限错误

---

### 4.2 创建 Tauri 项目

在目标工作目录执行：

```bash
pnpm create tauri-app md-reader-lite
```

交互选择建议：

```text
Project name: md-reader-lite
Identifier: com.local.mdreaderlite
Frontend language: TypeScript / JavaScript
Package manager: pnpm
UI template: React
UI flavor: TypeScript
```

进入项目目录：

```bash
cd md-reader-lite
pnpm install
pnpm tauri dev
```

验收标准：

- Tauri 窗口可以正常启动
- React 页面可以正常显示
- 修改前端代码后可以热更新

---

### 4.3 安装基础依赖

安装 Markdown、代码高亮、安全清洗、图标、工具依赖：

```bash
pnpm add markdown-it markdown-it-anchor dompurify shiki lucide-react clsx tailwind-merge
pnpm add -D @types/markdown-it
```

安装 Tauri 插件：

```bash
pnpm tauri add dialog
pnpm tauri add fs
```

验收标准：

- `package.json` 中出现相关依赖
- `src-tauri/Cargo.toml` 中出现 Tauri 插件依赖
- `src-tauri/src/lib.rs` 中完成插件初始化
- `pnpm tauri dev` 可以正常启动

---

## 5. 推荐项目目录结构

AI Agent 需要按以下结构整理前端代码。

```text
md-reader-lite/
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ routes.tsx
│  │  └─ providers.tsx
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ TopBar.tsx
│  │  │  └─ StatusBar.tsx
│  │  │
│  │  ├─ markdown/
│  │  │  ├─ MarkdownViewer.tsx
│  │  │  ├─ MarkdownToolbar.tsx
│  │  │  ├─ MarkdownToc.tsx
│  │  │  ├─ CodeBlock.tsx
│  │  │  └─ EmptyState.tsx
│  │  │
│  │  ├─ search/
│  │  │  ├─ SearchBox.tsx
│  │  │  └─ SearchResultList.tsx
│  │  │
│  │  └─ ui/
│  │     ├─ Button.tsx
│  │     ├─ IconButton.tsx
│  │     ├─ Tooltip.tsx
│  │     └─ Modal.tsx
│  │
│  ├─ hooks/
│  │  ├─ useMarkdownFile.ts
│  │  ├─ useRecentFiles.ts
│  │  ├─ useTheme.ts
│  │  ├─ useToc.ts
│  │  └─ useFileSearch.ts
│  │
│  ├─ lib/
│  │  ├─ markdown.ts
│  │  ├─ highlight.ts
│  │  ├─ sanitize.ts
│  │  ├─ file.ts
│  │  ├─ storage.ts
│  │  └─ utils.ts
│  │
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ markdown.css
│  │
│  ├─ types/
│  │  ├─ file.ts
│  │  ├─ markdown.ts
│  │  └─ settings.ts
│  │
│  ├─ main.tsx
│  └─ vite-env.d.ts
│
├─ src-tauri/
│  ├─ src/
│  │  ├─ lib.rs
│  │  └─ main.rs
│  ├─ capabilities/
│  ├─ icons/
│  ├─ Cargo.toml
│  └─ tauri.conf.json
│
├─ package.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig.json
└─ README.md
```

验收标准：

- 文件结构与上方基本一致
- 页面组件、hooks、工具函数不要全部堆在 `App.tsx`
- `App.tsx` 只负责组合整体结构，不写复杂业务逻辑

---

## 6. UI 布局开发任务

### 6.1 搭建 AppShell

实现整体布局：

```text
┌──────────────────────────────────────────┐
│ TopBar：文件名 / 打开文件 / 搜索 / 主题切换 │
├───────────────┬──────────────────────────┤
│ Sidebar       │ Markdown Viewer          │
│ 最近文件       │ 正文阅读区                 │
│ 目录大纲       │                          │
├───────────────┴──────────────────────────┤
│ StatusBar：文件路径 / 字数 / 行数 / 状态     │
└──────────────────────────────────────────┘
```

实现要求：

- 左侧 Sidebar 宽度默认 280px
- Sidebar 可后续扩展为可拖拽调整宽度，第一版可以固定宽度
- TopBar 高度建议 48px
- StatusBar 高度建议 28px
- Markdown 阅读区居中显示，最大宽度建议 860px 到 960px
- 空状态时显示引导文案和打开文件按钮

验收标准：

- 无文件时显示空状态
- 打开文件后显示文件内容区域
- 窗口缩小时布局不崩坏
- 暗色主题下界面仍然清晰

---

### 6.2 设计视觉风格

视觉方向：

- 类似现代知识库 / 文档阅读器
- 干净、低干扰、阅读优先
- 不要做过度拟物风格
- 不要做复杂动画

基础设计参数：

```text
背景色：亮色 #f7f7f8，暗色 #111827
内容卡片：亮色 #ffffff，暗色 #1f2937
主文字：亮色 #111827，暗色 #f9fafb
弱文字：亮色 #6b7280，暗色 #9ca3af
边框：亮色 #e5e7eb，暗色 #374151
圆角：12px ~ 16px
阴影：轻量，不要厚重
```

字体建议：

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

中文环境兼容：

```css
font-family: Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
```

验收标准：

- 英文、中文、代码内容都显示正常
- 阅读区行距舒适
- 标题层级明显
- 表格、引用、代码块不丑

---

## 7. 文件打开与读取任务

### 7.1 实现打开单个 Markdown 文件

在 `src/lib/file.ts` 中封装文件相关方法。

需要实现：

```ts
openMarkdownFile(): Promise<MarkdownFile | null>
readMarkdownFile(path: string): Promise<MarkdownFile>
isMarkdownFile(path: string): boolean
```

`MarkdownFile` 类型建议：

```ts
export interface MarkdownFile {
  path: string;
  name: string;
  content: string;
  size?: number;
  lastOpenedAt: number;
}
```

行为要求：

1. 点击 TopBar 的“打开文件”按钮
2. 调用 Tauri dialog 打开文件选择器
3. 只允许选择 `.md` / `.markdown` / `.mdown` 文件
4. 获取路径后读取文本内容
5. 更新当前文件状态
6. 将文件加入最近打开列表
7. 渲染 Markdown

验收标准：

- 可以打开 `.md` 文件
- 不能选择或打开非 Markdown 文件
- 文件读取失败时有错误提示
- 最近打开列表自动更新

---

### 7.2 实现拖拽打开文件

行为要求：

1. 用户将本地 `.md` 文件拖入应用窗口
2. 应用识别文件路径
3. 如果是 Markdown 文件，直接读取并渲染
4. 如果不是 Markdown 文件，显示轻量错误提示

验收标准：

- 拖入 `.md` 文件可以打开
- 拖入多个文件时，第一版只打开第一个 Markdown 文件
- 拖入非 Markdown 文件不会导致应用崩溃

---

### 7.3 实现最近打开文件

在 `src/hooks/useRecentFiles.ts` 中实现。

数据结构建议：

```ts
export interface RecentFileItem {
  path: string;
  name: string;
  lastOpenedAt: number;
}
```

规则：

- 最多保存 20 条
- 新打开的文件排在最上方
- 同路径文件不要重复出现
- 点击最近文件后重新读取该文件
- 文件不存在时提示“文件可能已被移动或删除”，并允许从最近列表移除

验收标准：

- 关闭应用后重新打开，最近文件仍存在
- 重复打开同一文件不会重复插入
- 最近文件按时间倒序排列

---

## 8. Markdown 渲染任务

### 8.1 建立 Markdown 渲染管线

在 `src/lib/markdown.ts` 中实现 Markdown 转 HTML。

流程：

```text
原始 Markdown 文本
→ markdown-it 解析
→ markdown-it-anchor 添加标题锚点
→ Shiki 处理代码高亮
→ DOMPurify 清理 HTML
→ React 渲染到 MarkdownViewer
```

实现要求：

- 支持 GitHub 风格表格
- 支持代码块语言标识，例如 ```ts、```js、```bash
- 未识别语言时降级为纯文本代码块
- 支持标题锚点，方便目录跳转
- 支持本地图片相对路径显示

验收标准：

- 标题、表格、引用、代码块、图片、链接均可正确显示
- Markdown 中包含 HTML 时不会造成危险脚本执行
- 大文件渲染时不会明显卡顿

---

### 8.2 代码高亮

在 `src/lib/highlight.ts` 中封装 Shiki。

要求：

- 初始化 Shiki highlighter 时做缓存
- 不要每次渲染都重复创建 highlighter
- 亮色主题使用类似 `github-light`
- 暗色主题使用类似 `github-dark` 或 `vitesse-dark`
- 代码块可横向滚动
- 保留原始缩进和换行

验收标准：

- TypeScript、JavaScript、JSON、Bash、CSS、HTML 代码块高亮正常
- 未指定语言时样式也正常
- 切换主题后代码块主题随之变化

---

### 8.3 Markdown 样式

在 `src/styles/markdown.css` 中维护所有 Markdown 正文样式。

需要覆盖：

- h1 / h2 / h3 / h4
- p
- a
- ul / ol
- blockquote
- table / th / td
- code / pre
- img
- hr
- strong / em
- checkbox list

阅读体验要求：

- 正文行高：1.7 左右
- 段落间距：适中
- 标题上方间距大于下方间距
- 表格横向溢出时允许滚动
- 图片最大宽度 100%，居中显示

验收标准：

- 常见 Markdown 文件显示美观
- 超宽表格不会撑破布局
- 超长代码行不会撑破布局
- 图片不会超出正文区域

---

## 9. 目录大纲任务

### 9.1 提取标题结构

在 `src/hooks/useToc.ts` 中实现目录提取。

输入：Markdown 原文或渲染后的 DOM。

输出类型建议：

```ts
export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}
```

要求：

- 第一版只提取 h1 / h2 / h3
- 标题 id 要与 Markdown 渲染后的锚点一致
- 空标题忽略
- 标题层级在 UI 中用缩进表现

验收标准：

- 打开文件后 Sidebar 显示目录
- 点击目录项可以滚动到对应标题
- 当前阅读位置可以高亮当前目录项，第一版可选做

---

## 10. 当前文件内搜索任务

### 10.1 实现搜索框

在 TopBar 中添加搜索入口。

交互要求：

- 快捷键：Ctrl + F 聚焦搜索框
- 输入关键词后在当前 Markdown 正文中查找
- 显示匹配数量，例如 `3 / 12`
- 支持上一个 / 下一个匹配项跳转
- Esc 关闭搜索状态

第一版实现方式：

- 可以先基于 Markdown 原文搜索
- 搜索结果跳转可以通过渲染文本位置近似处理
- 如果实现 HTML 高亮成本过高，第一版可先实现搜索结果列表

更优方案：

- 对渲染后的正文 DOM 做文本节点遍历
- 将匹配文本包裹为 `<mark>`
- 当前匹配项使用不同样式

验收标准：

- Ctrl + F 能唤起搜索
- 能看到匹配数量
- 能跳转到上一个 / 下一个匹配结果
- 清空搜索后正文恢复正常

---

## 11. 主题切换任务

### 11.1 实现亮色 / 暗色主题

在 `src/hooks/useTheme.ts` 中实现。

要求：

- 支持 light / dark / system 三种模式
- 默认跟随系统
- 用户手动选择后保存到 localStorage
- 根节点添加 `dark` class，配合 Tailwind dark mode

类型建议：

```ts
export type ThemeMode = 'light' | 'dark' | 'system';
```

验收标准：

- 点击按钮可以切换主题
- 重启应用后保留用户选择
- 系统模式下跟随 Windows 主题变化，第一版可在重启后生效
- Markdown 正文、代码块、Sidebar、TopBar 都适配主题

---

## 12. 状态栏任务

### 12.1 显示文件基础信息

StatusBar 显示：

- 当前文件名
- 当前文件路径
- 字数
- 行数
- 文件大小，若能获取
- 当前状态，例如 Ready / Loading / Error

字数统计规则：

- 英文按单词粗略统计
- 中文按字符粗略统计即可
- 第一版不需要非常精确

验收标准：

- 打开文件后状态栏信息更新
- 加载中显示 Loading
- 错误时显示 Error
- 无文件时显示 Ready

---

## 13. 错误处理任务

### 13.1 统一错误提示

需要处理以下错误：

- 用户取消文件选择：不提示错误
- 文件不存在：提示文件已移动或删除
- 文件格式不支持：提示仅支持 Markdown 文件
- 文件读取失败：提示读取失败
- Markdown 渲染失败：显示原文 fallback 或错误状态
- 图片加载失败：保持页面不崩溃

实现建议：

- 建立 `AppError` 类型
- 用轻量 Toast 或顶部提示条显示错误
- 不要使用浏览器原生 alert

验收标准：

- 所有错误不会导致白屏
- 错误提示简洁明确
- 用户可以继续打开其他文件

---

## 14. 性能优化任务

### 14.1 首屏性能

要求：

- 应用打开后先显示 Shell，不等待 Markdown 高亮初始化
- Shiki highlighter 懒加载
- 大文件渲染时显示 Loading 状态

验收标准：

- 空应用启动感觉快速
- 打开小文件几乎即时显示
- 打开大文件时不会白屏

---

### 14.2 渲染性能

优化要求：

- Markdown 渲染结果使用 memo 缓存
- 文件内容未变化时不要重复解析
- Shiki highlighter 单例缓存
- 搜索输入做 debounce，建议 150ms 到 300ms
- 大文件目录提取不要阻塞 UI 太久

验收标准：

- 1MB 左右 Markdown 文件可以正常阅读
- 快速切换主题不会明显卡死
- 搜索时输入不卡顿

---

## 15. Windows 应用配置任务

### 15.1 设置应用基础信息

在 `src-tauri/tauri.conf.json` 中设置：

```json
{
  "productName": "MD Reader Lite",
  "identifier": "com.local.mdreaderlite"
}
```

窗口建议：

```json
{
  "title": "MD Reader Lite",
  "width": 1180,
  "height": 760,
  "minWidth": 860,
  "minHeight": 560,
  "resizable": true,
  "fullscreen": false
}
```

验收标准：

- 应用标题正确
- 默认窗口尺寸舒适
- 缩小到最小尺寸时布局不崩坏

---

### 15.2 权限配置

Tauri 2 需要注意 capability / permission 配置。

至少需要允许：

- dialog 打开文件
- fs 读取用户选择的文件

要求：

- 权限尽可能收敛
- 不要直接开放整个文件系统读写权限
- 第一版只需要读取 Markdown 文件，不需要写入用户文件

验收标准：

- 打开文件选择器正常
- 读取被选择的文件正常
- 未授权路径不应被随意读取

---

## 16. 打包任务

### 16.1 开发构建检查

执行：

```bash
pnpm build
pnpm tauri build
```

验收标准：

- TypeScript 无错误
- Vite 构建成功
- Tauri 构建成功
- Windows 下生成可安装文件或可执行文件

---

### 16.2 打包产物检查

检查路径通常在：

```text
src-tauri/target/release/bundle/
```

需要验证：

- 安装包可以运行
- 安装后可以打开应用
- 应用可以打开本地 `.md` 文件
- 主题、最近文件等偏好保存正常

验收标准：

- 双击安装包或 exe 可以正常运行
- 没有依赖开发环境
- 不需要启动命令行

---

## 17. 测试样例文件

AI Agent 需要创建一个测试目录：

```text
test-files/
├─ basic.md
├─ table.md
├─ code.md
├─ image.md
├─ long.md
└─ unsafe-html.md
```

### 17.1 basic.md

需要包含：

- h1 / h2 / h3
- 段落
- 加粗
- 斜体
- 链接
- 列表
- 引用

### 17.2 table.md

需要包含：

- 普通表格
- 超宽表格

### 17.3 code.md

需要包含：

- TypeScript 代码块
- JavaScript 代码块
- Bash 代码块
- JSON 代码块
- 未指定语言代码块

### 17.4 image.md

需要包含：

- 相对路径图片
- 不存在的图片路径

### 17.5 long.md

需要模拟大文件。

要求：

- 至少 200 个标题
- 至少 1000 个段落
- 用于测试目录和滚动性能

### 17.6 unsafe-html.md

需要包含：

```html
<script>alert('xss')</script>
<img src="x" onerror="alert('xss')" />
```

验收标准：

- 渲染 unsafe-html.md 时不会执行脚本
- 应用不会弹出 alert
- 页面不会崩溃

---

## 18. 分阶段开发顺序

AI Agent 必须按以下顺序开发，不要跳跃式实现。

### Phase 1：项目跑起来

任务：

1. 创建 Tauri + React + TypeScript 项目
2. 安装基础依赖
3. 清理默认模板代码
4. 搭建 AppShell 静态布局
5. 配置 TailwindCSS
6. 实现亮色 / 暗色基础样式

完成标准：

- 应用窗口可以启动
- 有 TopBar / Sidebar / Markdown Viewer / StatusBar 四个区域
- 主题切换按钮可以切换基础颜色

---

### Phase 2：打开并读取 Markdown 文件

任务：

1. 安装并配置 dialog / fs 插件
2. 实现打开文件按钮
3. 限制文件类型为 Markdown
4. 读取文件内容
5. 显示文件名、路径和原始内容
6. 加入最近文件列表

完成标准：

- 点击按钮可以选择 Markdown 文件
- 文件内容可以显示在应用中
- 最近文件列表可用

---

### Phase 3：Markdown 渲染

任务：

1. 接入 markdown-it
2. 接入 DOMPurify
3. 建立 MarkdownViewer 组件
4. 实现基础 Markdown 样式
5. 支持表格、引用、列表、图片
6. 处理本地图片相对路径

完成标准：

- Markdown 不再显示为纯文本，而是正确渲染为文档
- 基础样式美观
- 图片、表格、链接正常显示

---

### Phase 4：代码高亮

任务：

1. 接入 Shiki
2. 建立 highlighter 缓存
3. 支持常见语言高亮
4. 处理亮色 / 暗色代码主题
5. 优化代码块样式

完成标准：

- 代码块高亮效果接近现代文档工具
- 切换主题时代码块样式也正确
- 未知语言不会报错

---

### Phase 5：目录大纲

任务：

1. 从 Markdown 或 DOM 中提取 h1 / h2 / h3
2. 生成目录列表
3. 点击目录滚动到对应标题
4. 为标题添加锚点
5. 优化目录层级样式

完成标准：

- Sidebar 能显示当前文档目录
- 点击目录可以跳转
- 长文档下目录依然可用

---

### Phase 6：当前文件搜索

任务：

1. 实现 Ctrl + F
2. 实现搜索输入框
3. 实现匹配数量统计
4. 实现上一个 / 下一个跳转
5. 实现正文匹配高亮，若成本过高可先做结果列表

完成标准：

- 可以搜索当前文件内容
- 可以跳转匹配项
- 搜索状态可关闭

---

### Phase 7：拖拽打开与错误处理

任务：

1. 实现拖拽文件打开
2. 处理不支持文件格式
3. 处理文件不存在
4. 处理读取失败
5. 统一 Toast / Banner 错误提示

完成标准：

- 拖入 Markdown 文件可打开
- 错误不会造成白屏
- 用户能继续正常使用应用

---

### Phase 8：性能与体验优化

任务：

1. Markdown 渲染结果缓存
2. Shiki 初始化缓存
3. 搜索 debounce
4. 大文件 loading 状态
5. 滚动区域优化
6. 空状态优化
7. 状态栏补全

完成标准：

- 大文件使用体验可接受
- 搜索不卡顿
- 应用整体体验像正式工具，而不是 demo

---

### Phase 9：打包与发布准备

任务：

1. 配置应用名称
2. 配置窗口尺寸
3. 配置应用图标，可先使用临时图标
4. 执行生产构建
5. 执行 Tauri 打包
6. 测试安装包
7. 编写 README

完成标准：

- Windows 下可以独立运行
- README 写明安装、开发、打包方式
- 第一版 MVP 可交付

---

## 19. README 内容要求

AI Agent 需要在项目根目录创建 `README.md`。

README 至少包含：

```text
# MD Reader Lite

## 简介
这是一个基于 Tauri + React 的 Windows 本地轻量级 Markdown 阅读器。

## 功能
- 打开本地 Markdown 文件
- Markdown 阅读预览
- 代码高亮
- 目录大纲
- 当前文件搜索
- 最近打开文件
- 亮色 / 暗色主题

## 开发
pnpm install
pnpm tauri dev

## 构建
pnpm build
pnpm tauri build

## 技术栈
Tauri 2 / React / TypeScript / Vite / TailwindCSS / markdown-it / Shiki
```

验收标准：

- README 能让后续 AI 或真人快速理解项目
- 命令准确可执行

---

## 20. 代码质量要求

### 20.1 TypeScript 要求

- 禁止滥用 `any`
- 所有核心数据结构要定义 interface/type
- 文件读取、Markdown 解析、搜索、主题设置都要有明确类型
- 异步函数必须处理错误

### 20.2 React 要求

- 组件要小而清晰
- 业务逻辑优先放到 hooks / lib 中
- 避免在 JSX 中写大段复杂逻辑
- 避免不必要的全局状态

### 20.3 CSS 要求

- 通用布局用 Tailwind
- Markdown 正文样式集中在 `markdown.css`
- 不要到处写重复 class
- 暗色主题要统一，不要局部失控

### 20.4 Tauri 要求

- 权限最小化
- 不要开放不必要的系统能力
- 文件读取只处理用户明确选择或拖入的文件
- 不要默认扫描整个硬盘

---

## 21. 最终验收清单

AI Agent 完成开发后，逐项检查：

```text
[ ] 应用可以在 Windows 上启动
[ ] 可以打开本地 .md 文件
[ ] 可以拖拽打开 .md 文件
[ ] Markdown 正文渲染正常
[ ] 代码块高亮正常
[ ] 表格显示正常
[ ] 图片显示正常
[ ] 链接显示正常
[ ] 目录大纲显示正常
[ ] 点击目录可以跳转
[ ] Ctrl + F 可以搜索当前文件
[ ] 搜索结果可以上一个 / 下一个跳转
[ ] 亮色 / 暗色主题切换正常
[ ] 最近打开文件可用
[ ] 文件不存在时有错误提示
[ ] 非 Markdown 文件有错误提示
[ ] 大文件不会导致明显白屏或崩溃
[ ] pnpm build 成功
[ ] pnpm tauri build 成功
[ ] Windows 安装包或 exe 可以运行
[ ] README 完整
```

---

## 22. AI Agent 执行原则

开发时严格遵守：

1. 每个 Phase 完成后先运行项目，不要连续堆功能。
2. 每个 Phase 完成后检查 TypeScript 错误。
3. 不要提前实现第二版功能，避免范围失控。
4. 遇到依赖报错时，优先查官方文档或错误日志，不要盲目改架构。
5. 所有文件读取能力必须经过用户选择或拖拽触发。
6. 所有 Markdown HTML 渲染前必须清理，避免危险脚本。
7. UI 优先保证清晰、稳定、轻量，不要加入复杂动效。
8. 文件结构必须清晰，避免把所有代码写进一个文件。
9. 每一个核心功能都要有可手动验证的测试方式。
10. 第一版目标是稳定可用的本地阅读器，不是完整知识库软件。

---

## 23. 第二版可选扩展方向

第一版完成后，再考虑以下功能：

1. 文件夹模式：打开一个文件夹，左侧显示 Markdown 文件树
2. 全文搜索：对文件夹内所有 Markdown 建立索引
3. Mermaid 图表渲染
4. 导出 PDF / HTML
5. 阅读进度记录
6. 收藏文件
7. 多标签页
8. 自定义字体、字号、行距、正文宽度
9. 自动监听文件变化并刷新
10. 便携版绿色运行包

---

## 24. 推荐开发里程碑

```text
Milestone 1：静态 UI + 主题切换
Milestone 2：打开文件 + 最近文件
Milestone 3：Markdown 渲染 + 样式
Milestone 4：代码高亮 + 目录大纲
Milestone 5：搜索 + 拖拽 + 错误处理
Milestone 6：性能优化 + 打包
```

每个 Milestone 都应该可以独立运行并演示。

---

## 25. 最终交付物

项目完成后应包含：

```text
[必需] 完整源代码
[必需] README.md
[必需] 测试 Markdown 文件
[必需] Windows 可运行构建产物
[建议] 安装包
[建议] CHANGELOG.md
```

---

## 26. 参考文档

- Tauri 2 Create Project: https://v2.tauri.app/start/create-project/
- Tauri File System Plugin: https://v2.tauri.app/plugin/file-system/
- Tauri Dialog Plugin: https://v2.tauri.app/plugin/dialog/
- Tauri + Vite Guide: https://v2.tauri.app/start/frontend/vite/

