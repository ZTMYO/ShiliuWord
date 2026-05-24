# 石榴刷词（ShiliuWord）

一个面向考研英语刷词的前后端分离项目。前端使用原生 JavaScript + Vite，后端使用 Node.js + Express，保留本地 JSON 词库，同时通过 SQLite 提供多用户登录、收藏、历史同步和轻量管理能力。

## 主要功能

- 匹配模式：随机词、形近词、近义词
- 百词斩模式：本地或 AI 出题、释义查看、上一题 / 下一题、朗读
- 收藏功能：支持在列表、历史和答案解析中收藏 / 取消收藏
- 收藏专项训练：收藏夹单词超过 5 个后，可直接按收藏词表生成百词斩题目
- 历史功能：匹配历史、百词斩历史、清空历史记录
- 多用户：注册、登录、退出登录、跨设备同步收藏和历史
- 个人信息：保存 / 清空个人 API Key，查看当前可用状态
- 发音功能：统一接入有道发音接口
- 独立工具页：本地启动用户删除页，便于清理 SQLite 用户数据

## 模式说明

- `随机词`：支持 AI 出题，也支持无 API Key 时走本地词库
- `百词斩`：支持 AI 选项生成，也支持无 API Key 时走本地实时出题
- `形近词`：当前需要 AI 能力；无 API Key 时禁用
- `近义词`：当前需要 AI 能力；无 API Key 时禁用

## 无 API Key 模式

项目支持“纯本地可用”的降级路径：

- 无个人 API Key，且未开启公共 AI 时，自动切换到本地模式
- 本地模式下会跳过 AI 生成动画，直接出题
- 本地模式可用：`随机词`、`百词斩`
- 本地模式禁用：`形近词`、`近义词`
- 百词斩本地错误选项来自本地中文释义池，而不是同批题目互相干扰
- 收藏专项训练同样支持进入百词斩流程，但题目范围会限制在当前账号收藏夹

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
  scripts/           数据处理脚本
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
PUBLIC_MODEL_ENABLED=false
DEEPSEEK_API_KEY=your_deepseek_api_key_here
USE_MOCK_DATA=false
```

说明：

- `SESSION_SECRET`：必填，用于会话签名
- `PUBLIC_MODEL_ENABLED=true` 且配置 `DEEPSEEK_API_KEY` 后，可启用站点公共 AI
- 不启用公共 AI 时，用户仍可在前端个人信息页填写自己的 API Key
- 当前默认按 DeepSeek 接口进行校验与调用，因此个人 API Key 也默认填写 DeepSeek API Key
- 用户个人 API Key 只保存在浏览器本地，不写入后端数据库

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

## 常用命令

后端：

```bash
npm run dev
npm run start
npm run extract:book
npm run extract:examples
npm run user-delete
```

前端：

```bash
npm run dev
npm run build
npm run preview
```

命令说明：

- `npm run extract:book`：从原始词库提取 `source-word.txt`
- `npm run extract:examples`：生成 / 更新 `word-examples.json`
- `npm run user-delete`：启动独立用户删除工具页

## 数据文件

- `backend/data/source-word.txt`：主词池，决定项目使用哪些单词
- `backend/data/word-data.json`：单词释义缓存，保存 `wordCn`、`defEn`、`defCn`
- `backend/data/word-examples.json`：例句与中文释义补充池，保存 `examples` 与 `paraphrase`
- `backend/data/app.sqlite`：用户、收藏、匹配历史、百词斩历史

## 数据同步规则

- AI 返回的新词义会写入 `word-data.json`
- 同一份 `wordCn` 会同步写入 `word-examples.json` 的 `paraphrase`
- 例句优先读取 `word-examples.json`
- 本地百词斩选项会综合使用本地词义缓存和 `paraphrase` 释义池
- AI 百词斩选项会过滤掉 `word` 为空或与当前题单词相同的干扰项，避免出现伪重复释义

## 收藏专项训练

- 入口位于“我的收藏”页面 header
- 只有当收藏夹单词数大于 5 时才会显示按钮
- 点击后会以当前账号收藏夹中的单词作为百词斩题池
- 该模式仍复用普通百词斩页面、朗读、历史和收藏交互

## 独立工具

项目内置一个轻量用户删除工具：

- 启动命令：`cd backend && npm run user-delete`
- 功能：列出用户并删除指定用户
- 适合本地维护 SQLite 测试数据，不依赖主站页面

## 当前说明

- 项目品牌已统一为“石榴刷词”
- 登录态、收藏、历史记录均为账号级数据
- 个人 API Key 不上传服务端、不写入数据库
- 无 API Key 时依然可以直接使用本地模式进行部分刷题
- 形近词与近义词当前都依赖 AI，未配置可用 API Key 时会禁用
