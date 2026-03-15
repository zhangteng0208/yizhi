# 易知先生

> 传统命理占卜应用，融合现代 AI 技术的智能解读平台

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📖 项目简介

易知先生是一款集成传统命理学与现代 AI 技术的占卜应用，提供八字、六爻、紫微斗数、面相手相、风水择吉等多种命理服务，并收录易藏、医藏、诗藏、道藏等 2000+ 部国学经典。

### ✨ 核心功能

#### 🧮 算（命理推算）
- **八字排盘** - 生辰八字分析
- **紫微斗数** - 命盘排布与解读
- **奇门遁甲** - 时空方位预测

#### 🎲 问（占卜问卦）
- **六爻占卜** - 传统摇卦问事
- **梅花易数** - 姓名起卦
- **易经占卜** - 蓍草法
- **小六壬** - 掐指速算
- **周公解梦** - 梦境解析
- **抽签** - 多种签桶

#### 👁️ 相（相术风水）
- **面相分析** - AI 视觉识别
- **手相解读** - 左右手纹路
- **舌相分析** - 中医舌诊
- **风水布局** - 方位吉凶

#### 🔍 寻（择吉起名）
- **寻人寻物** - 基于六爻
- **择日择吉** - 黄道吉日
- **起名改名** - 五行八字
- **合婚配对** - 八字合婚
- **生意合伙** - 多人分析

#### 📚 典籍（国学经典）
- **易藏** - 343 部
- **医藏** - 788 部
- **诗藏** - 776 部
- **道藏** - 1680+ 部
- **儒藏、佛藏** - 持续更新

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **UI 组件**: Vant 4.9
- **状态管理**: Pinia
- **路由**: Vue Router
- **命理计算**: lunar-javascript, iztro, cantian-liuyao

### 后端
- **框架**: NestJS 10 + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT
- **API 文档**: Swagger

### AI 集成
- **模型**: OpenAI API
- **流式输出**: SSE (Server-Sent Events)
- **视觉分析**: GPT-4 Vision（面相、手相、风水）
- **缓存策略**: 结果缓存 + Fallback 机制

### 部署
- **前后端分离**
- **数据托管**: 极空间 NAS (Docker + Nginx)
- **内网穿透**: 8080 → 59000

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

### 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install
```

### 配置环境变量

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/yizhi"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
```

### 运行项目

```bash
# 前端开发服务器
cd frontend
npm run dev

# 后端开发服务器
cd backend
npm run start:dev
```

### 构建生产版本

```bash
# 前端
cd frontend
npm run build

# 后端
cd backend
npm run build
```

## 📂 项目结构

```
yizhi/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── views/        # 页面组件（36 个）
│   │   ├── components/   # 公共组件
│   │   ├── composables/  # 可复用逻辑
│   │   ├── stores/       # Pinia 状态
│   │   └── router/       # 路由配置
│   └── public/
├── backend/              # 后端项目
│   ├── src/
│   │   ├── auth/        # 认证模块
│   │   ├── users/       # 用户管理
│   │   ├── divination/  # 占卜服务（20+ services）
│   │   ├── weather/     # 天气服务
│   │   └── prisma/      # 数据库
│   └── prisma/
│       └── schema.prisma
└── nas-deploy/          # NAS 部署配置
```

## 🎨 特色功能

### 阅读器优化
- ✅ 阅读进度自动保存和恢复
- ✅ 章节内搜索（高亮显示）
- ✅ 阅读设置（字体大小、行高、主题）
- ✅ 可复用的 Composable

### AI 智能解读
- ✅ 流式输出（实时显示）
- ✅ 结果缓存（避免重复调用）
- ✅ 视觉分析（面相、手相、舌相、风水）
- ✅ Fallback 机制（API 失败时的降级方案）

### 数据管理
- ✅ 2030+ JSON 典籍文件
- ✅ NAS 静态文件服务（CORS + 目录浏览）
- ✅ Git 仓库瘦身（7.1GB → 1.4MB）
- ✅ 数据文件与代码分离

## 📊 数据库设计

### 核心表
- `users` - 用户表（openid/phone/会员等级/金币）
- `user_profiles` - 用户档案（八字信息，支持多人）
- `divination_records` - 占卜记录（类型/输入/结果/AI解读）
- `products` - 产品服务（金币/人民币定价）
- `orders` - 订单表（支付状态/交易号）
- `coin_transactions` - 金币流水
- `daily_fortune` - 每日运势
- `feedback` - 用户反馈

## 🔄 最近更新

- **2026-03-15**: 代码格式化 + 阅读器优化
- **2026-03-14**: 添加分享海报功能
- **2026-03-14**: 修复 HTTPS 混合内容问题
- **2026-03-13**: Git 仓库瘦身 + NAS 部署
- **2026-03-11**: 修复书籍功能问题
- **2026-03-10**: 集成五大藏（道藏、儒藏、佛藏、易藏、医藏）

## 📝 开发计划

### P0（核心体验）
- [ ] 完善 AI 解读提示词
- [ ] 优化典籍搜索性能
- [ ] 增加用户反馈入口

### P1（商业化）
- [ ] 会员体系完善
- [ ] 支付功能对接（微信/支付宝）
- [ ] 每日运势推送

### P2（增长）
- [ ] 社交分享（海报生成）
- [ ] 内容运营（知识库）
- [ ] 数据分析（埋点统计）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 代码格式化：使用 Prettier
- 提交信息：遵循 Conventional Commits
- 分支命名：`feat/xxx`, `fix/xxx`, `docs/xxx`

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 📧 联系方式

- **作者**: 张腾
- **GitHub**: [@zhangteng0208](https://github.com/zhangteng0208)

---

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！
