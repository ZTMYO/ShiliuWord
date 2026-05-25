# 石榴刷词（ShiliuWord）

前后端分离的刷词/词汇训练项目。支持纯本地模式，也可选接入 AI：根据当前词书出题、生成干扰项/形近词/近义词/例句/阅读材料。

## 主要功能

- 匹配：随机词 / 形近词 / 近义词
- 闪卡：本地或 AI 出题、朗读、收藏、历史
- 阅读：AI 生成双语短文（句卡展开中文），支持“重点单词”弹窗
- 多用户：注册/登录，跨设备同步收藏与历史
- 词书：按词书词表出题

## AI 与词书

- 后端会将 `bookName`（当前词书名，如“考研英语(二)…”）注入提示词，让 AI 按对应人群/难度出题
- AI 接口与提示词位置：
  - `backend/lib/aiService.js`：DeepSeek 请求与 API Key 校验
  - `backend/config.js`：提示词（出题/干扰项/近义词/例句/阅读等）
- 无个人 API Key 时的降级：仅 `随机词`、`闪卡刷词` 可用；`形近词`、`近义词`、`阅读训练` 禁用

## 技术栈

- 前端：Vite + 原生 JavaScript + CSS
- 后端：Node.js + Express
- 数据存储：JSON 词库 + SQLite 单文件数据库
- AI：DeepSeek API
- 发音：有道词典语音接口

## 目录结构

```text
backend/
  data/              数据文件
  lib/               服务层
  router/            路由
  tools/             独立工具页与小型服务
  .env.example       环境变量示例
  config.js          后端配置
  server.js          后端入口

frontend/
  public/            静态资源
  src/               前端源码
  index.html         前端入口
```

## 本地运行

### 1. 安装依赖

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env`，可参考 `backend/.env.example`。

最简配置只需要：

```env
SESSION_SECRET=your_long_random_session_secret_here
```

常用可选项：

```env
PORT=3000
SQLITE_FILE=./data/app.sqlite
USE_MOCK_DATA=false
```

### 3. 启动项目

后端：

```bash
cd backend
npm run dev
```

前端：

```bash
cd frontend
npm run dev
```

默认情况下：

- 后端地址：`http://localhost:3000`
- 前端由 Vite 启动，控制台会输出实际访问地址

## 数据文件

- `backend/data/books/book-*.txt`：词书词表（第一行是 `# id=...; name=...; count=...` 的 header；后续为单词列表）
- `backend/data/word-data.json`：单词释义缓存，保存 `wordCn`、`defEn`、`defCn`
- `backend/data/word-examples.json`：例句与中文释义补充池，保存 `examples`、`paraphrase`、`accent`
- `backend/data/app.sqlite`：用户、收藏、匹配历史、闪卡刷词历史

数据同步要点：

- AI 生成的新释义写入 `word-data.json`；例句优先读 `word-examples.json`，缺失时可由 AI 补齐并回写
- 本地模式下不会调用 AI，直接使用本地缓存与词书词表出题

独立工具：

- `cd backend && npm run user-delete`：本地删除 SQLite 用户数据
