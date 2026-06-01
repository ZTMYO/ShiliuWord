# 石榴刷词（ShiliuWord）

一款前后端分离的词汇训练工具，**纯本地即可完整使用**，也可按需接入 AI 能力，智能生成释义、干扰项、例句与阅读材料，适配多场景单词学习。

## 设计理念 & 适用人群

本项目跳出传统艾宾浩斯复习模式，**主打无压力沉浸式刷题**：
摒弃熟练度追踪、强制打卡、定时复习等约束，以多样玩法提升学习趣味性，做到想学就学、随停随走。依托 AI 结合语境、语义关联记词，告别机械死记硬背。

### 适配人群

1. **应试备考者**：内置考研、四六级、雅思、托福、专八等定向词书，适合集中刷题保持语感。
2. **抗拒打卡约束者**：不接受强制任务，希望把背单词当作休闲而非负担。
3. **追求多元玩法者**：多种练习模式交替使用，缓解重复学习的枯燥感。

## 功能总览

- **单词匹配**：支持随机词、形近词、近义词三种题型
- **闪卡刷词**：本地出题 / AI 辅助出题双模式
- **双语阅读**：AI 生成短文，逐句展开释义
- **Wordle 猜词**：经典 5 字母猜词游戏，连胜排行
- **词组翻译**：支持中文搜索英文释义
- **词典**：内置英汉词典，支持中英文双向搜索、猜你想搜、同义词/反义词/相关词/短语浏览
- **收藏本**：跨设备同步单词收藏，支持按收藏词书单独开展闪卡与阅读训练
- **历史记录**：匹配刷题与闪卡两种历史记录，支持回看、筛选、跳转词典
- **用户系统**：注册登录、自定义昵称、修改密码
- **词书选择**：12 本内置词书自由切换
- **个人 API Key**：可配置个人 DeepSeek API Key 解锁全部 AI 功能
- **暗色主题**：支持明暗主题切换
- **真人发音**：一键播放单词标准读音

## 内置词书

| ID | 词书名称 | 词汇量 |
|:--:|----------|:-----:|
| 1 | 小学英语 | 2152 |
| 2 | 中考必备词汇 | 1420 |
| 3 | 高中英语 | 9357 |
| 4 | 四级词汇乱序便携版 | 3173 |
| 5 | 星火四级词汇必背乱序版 | 2219 |
| 6 | 六级核心词汇 | 2078 |
| 7 | 专四核心词汇（正序版） | 4025 |
| 8 | 考研词汇便携版 | 6357 |
| 9 | 考研英语(二)词汇乱序版 | 6080 |
| 10 | 雅思词汇念念不忘乱序版 | 5382 |
| 11 | 托福高频词汇精讲 | 2760 |
| 12 | 专八词汇乱序版 | 5386 |

## AI 能力与降级规则

AI 会结合当前词书名称、难度定向生成内容，贴合对应学习场景。

- **已配置个人 API Key**：全部功能正常使用（闪卡 AI 出题、近义词模式、阅读训练等）
- **未配置 API Key**：自动降级，仅保留随机词匹配、基础闪卡；形近词/近义词、AI 阅读功能临时禁用

## 技术栈

- 前端：Vite + 原生 JavaScript + CSS
- 后端：Node.js + Express
- 数据存储：JSON 词库缓存 + SQLite 单文件数据库
- 接口服务：DeepSeek API（AI）、有道词典语音接口（发音）

## 目录结构

```text
backend/
  data/              数据文件
    books/           词书文件（book-*.txt）
    all-word-dict.json        英汉词典完整数据
    word-data.json            单词释义缓存
    word-examples.json        例句、音标补充库
    five-letter-words.json    Wordle 5 字母词库
    five-letter-answers.txt   Wordle 答案列表
    违规词库.txt              用户名/昵称违规词检测
    app.sqlite                用户、收藏、历史等业务数据
  lib/               服务层代码
  router/            接口路由
  tools/             独立工具与脚本
  .env.example       环境变量示例
  config.js          全局配置
  server.js          启动入口

frontend/
  src/               前端源码
    main.js          主逻辑
    style.css        样式
    logo.png         页面 Logo
  index.html         入口页面
  vite.config.js     Vite 配置
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

### 词书

- `backend/data/books/book-*.txt`：词书文件，首行为元信息（id/name/count），后续为单词列表
- 共 12 本内置词书，覆盖小学至专八各阶段

### 词典

- `backend/data/all-word-dict.json`：完整英汉词典，包含释义、音标、例句、同义词、反义词、相关词、短语
- 词典数据来源致谢：[mikigo/english-chinese-words](https://github.com/mikigo/english-chinese-words)

### 其他数据

- `word-data.json`：AI 生成的单词释义缓存（中英释义）
- `word-examples.json`：例句、音标补充库，AI 生成内容持久化存储
- `five-letter-words.json` / `five-letter-answers.txt`：Wordle 猜词模式词库
- `违规词库.txt`：用于检测用户名和昵称的违规词库
- `app.sqlite`：用户信息、收藏记录、学习历史等业务数据

### 数据逻辑

AI 生成的释义会自动写入 `word-data.json`；例句优先读取本地缓存，缺失时由 AI 补充并持久化。纯本地模式下，完全依赖现有缓存与词书运行，不调用外部接口。

### 配套工具

一键清空 SQLite 内的本地用户数据：

```bash
cd backend && npm run user-delete
```

## 致谢

- 词典数据来源：[mikigo/english-chinese-words](https://github.com/mikigo/english-chinese-words) — 提供英汉词典基础数据
- DeepSeek API — AI 生成释义、例句、阅读材料
- 有道词典 — 单词发音接口
