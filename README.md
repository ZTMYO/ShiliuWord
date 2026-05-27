# 石榴刷词（ShiliuWord）
一款前后端分离的词汇训练工具，**纯本地即可完整使用**，也可按需接入 AI 能力，智能生成释义、干扰项、例句与阅读材料，适配多场景单词学习。

## 设计理念 & 适用人群
本项目跳出传统艾宾浩斯复习模式，**主打无压力沉浸式刷题**：
摒弃熟练度追踪、强制打卡、定时复习等约束，以多样玩法提升学习趣味性，做到想学就学、随停随走。依托 AI 结合语境、语义关联记词，告别机械死记硬背。

### 适配人群
1. **应试备考者**：内置考研、四六级、雅思、托福、专八等定向词书，适合集中刷题保持语感。
2. **抗拒打卡约束者**：不接受强制任务，希望把背单词当作休闲而非负担。
3. **追求多元玩法者**：多种练习模式交替使用，缓解重复学习的枯燥感。

## 主要功能
- 单词匹配：支持随机词、形近词、近义词三种题型
- 智能闪卡：本地出题 / AI 辅助出题双模式
- 双语阅读：AI 生成短文，点击句子可展开中文释义
- Wordle 猜词：经典 5 字母猜词游戏，支持连胜排行
- 用户系统：支持注册登录，跨设备同步单词收藏、学习记录
- 昵称管理：支持自定义昵称（最多8字），带违规词检测
- 密码安全：支持修改密码，旧密码验证后更新
- 单词收藏：可针对收藏词汇单独开展闪卡、阅读训练
- 真人发音：一键播放单词标准读音

## AI 能力与降级规则
AI 会结合当前词书名称、难度定向生成内容，贴合对应学习场景。
- 已配置个人 API Key：全部功能正常使用
- 未配置 API Key：自动降级，仅保留**随机词匹配、基础闪卡**；形近词/近义词、AI 阅读功能临时禁用

## 技术栈
- 前端：Vite + 原生 JavaScript + CSS
- 后端：Node.js + Express
- 数据存储：JSON 词库缓存 + SQLite 单文件数据库
- 接口服务：DeepSeek API（AI）、有道词典语音接口（发音）

## 目录结构
```text
backend/
  data/              各类数据文件
  lib/               服务层代码
  router/            接口路由
  tools/             独立工具与小型服务
  .env.example       环境变量示例文件
  config.js          后端全局配置
  server.js          后端启动入口

frontend/
  public/            静态资源
  src/               前端源码
  index.html         前端入口页面
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
在 `backend` 目录新建 `.env` 文件，参考 `.env.example` 配置。
**最简必填配置**
```env
SESSION_SECRET=your_long_random_session_secret_here
```
**可选拓展配置**
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

默认地址：
- 后端：`http://localhost:3000`
- 前端地址查看 Vite 控制台输出

## 数据文件说明
- `backend/data/books/book-*.txt`：词书文件，首行为词书基础信息，后续为单词列表
- `backend/data/word-data.json`：单词释义缓存（中英释义）
- `backend/data/word-examples.json`：例句、改写、音标补充库
- `backend/data/违规词库.txt`：违规词库，用于检测用户名和昵称
- `backend/data/app.sqlite`：用户信息、收藏记录、学习历史等业务数据

### 数据逻辑
AI 生成的释义会自动写入 `word-data.json`；例句优先读取本地缓存，缺失时由 AI 补充并持久化。纯本地模式下，完全依赖现有缓存与词书运行，不调用外部接口。

### 配套工具
```bash
cd backend && npm run user-delete
```
一键清空 SQLite 内的本地用户数据。
