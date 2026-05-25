# 石榴刷词（ShiliuWord）

一个面向考研英语刷词的前后端分离项目。前端使用原生 JavaScript + Vite，后端使用 Node.js + Express，保留本地 JSON 词库，同时通过 SQLite 提供多用户登录、收藏、历史同步和轻量管理能力。

## 主要功能

- 匹配模式：随机词、形近词、近义词
- 闪卡刷词模式：本地或 AI 出题、释义查看、上一题 / 下一题、朗读
- 阅读训练：AI 基于 `word-data.json` 抽取的 5-10 个单词生成考研风格双语短文，句卡点击展开中文，标题支持点击查看中文翻译
- 阅读词表弹窗：阅读页 header 可打开“重点单词”，复用现有弹窗能力查看朗读、收藏和例句
- 收藏功能：支持在列表、历史和答案解析中收藏 / 取消收藏
- 收藏训练入口：收藏夹单词超过 5 个后，可直接按收藏词表进入“闪卡刷词”或“阅读”
- 历史功能：匹配历史、闪卡刷词历史、清空历史记录
- 多用户：注册、登录、退出登录、跨设备同步收藏和历史
- 个人信息：保存 / 清空个人 API Key，查看当前可用状态
- 发音功能：统一接入有道发音接口
- 独立工具页：本地启动用户删除页，便于清理 SQLite 用户数据

## 模式说明

- `随机词`：支持 AI 出题，也支持无 API Key 时走本地词库
- `闪卡刷词`：支持 AI 选项生成，也支持无 API Key 时走本地实时出题
- `形近词`：当前需要 AI 能力；无 API Key 时禁用
- `近义词`：当前需要 AI 能力；无 API Key 时禁用
- `阅读训练`：当前需要 AI 能力；会生成 5-8 句双语短文，不写入历史记录

## 无 API Key 模式

项目支持“纯本地可用”的降级路径：

- 无个人 API Key，且未开启公共 AI 时，自动切换到本地模式
- 本地模式下会跳过 AI 生成动画，直接出题
- 本地模式可用：`随机词`、`闪卡刷词`
- 本地模式禁用：`形近词`、`近义词`、`阅读训练`
- 闪卡刷词本地错误选项来自本地中文释义池，而不是同批题目互相干扰
- 点击 `阅读训练` 时，前端会直接提示不可用，不进入阅读页加载态
- 收藏页仍可进入“收藏闪卡刷词”，但“收藏阅读”同样需要可用 AI

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
USE_MOCK_DATA=false
```

说明：

- `SESSION_SECRET`：必填，用于会话签名
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
- `backend/data/app.sqlite`：用户、收藏、匹配历史、闪卡刷词历史

## 数据同步规则

- AI 返回的新词义会写入 `word-data.json`
- 同一份 `wordCn` 会同步写入 `word-examples.json` 的 `paraphrase`
- 例句优先读取 `word-examples.json`
- 本地闪卡刷词选项会综合使用本地词义缓存和 `paraphrase` 释义池
- AI 闪卡刷词选项会过滤掉 `word` 为空或与当前题单词相同的干扰项，避免出现伪重复释义
- 阅读训练若遇到收藏词缺少本地释义，会先调用 AI 补齐词义，再继续生成文章并写回缓存

## 阅读训练

- 首页“闪卡刷词”下方新增“阅读训练”入口
- 后端从 `word-data.json` 中抽取 5-10 个词，并调用 AI 生成 5-8 句双语短文
- 英文句子中的目标词会高亮；中文通过 `【】` 标记高亮对应词义
- 句子卡片点击后展开中文翻译；标题也支持点击展开中文标题
- 阅读页支持“重点单词”弹窗，可继续使用朗读、收藏、例句能力
- 阅读训练内容只保留在当前前端状态中，不写入匹配历史或闪卡刷词历史
- 为提升稳定性，前后端都会清洗 AI 误返回到英文句子中的标记符号

## 收藏训练

- 入口位于“我的收藏”页面 header
- 只有当收藏夹单词数大于 5 时才会显示训练按钮
- 当前提供两个入口：
- `闪卡刷词`：以当前账号收藏夹中的单词作为闪卡刷词题池
- `阅读`：以当前账号收藏夹中的单词作为阅读训练词池
- 收藏阅读在本地释义不足时会自动补词义，再生成文章
- 收藏闪卡刷词仍复用普通闪卡刷词页面、朗读、历史和收藏交互

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
