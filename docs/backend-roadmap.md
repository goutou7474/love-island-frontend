# 自有服务器后端路线

## 方向结论

建议使用自有服务器作为正式后端，不把 Firestore 作为核心数据库。

原因：

- 产品主要是国内手机实际使用，自有服务器的访问稳定性和可控性更好。
- 你已经有服务器，长期成本和部署控制权更明确。
- 情侣空间、权限、悄悄话定时打开、农历生日提醒、照片权限等规则更适合放在自有后端统一处理。
- Firestore 很适合快速 MVP，但后续如果要迁移到自有服务器，数据模型和权限规则会再做一遍。

Firestore 仍可作为备选：如果只想最快做一个双人可用 Demo，它的 Auth、数据库、规则和实时同步可以明显提速。

## 推荐架构

```text
React PWA
  |
  | HTTPS JSON API
  v
Node.js API Server
  |
  | Prisma
  v
PostgreSQL

Object Storage: MinIO / OSS / COS / R2
Cache: Redis optional
Jobs: cron / queue worker
```

## 技术选型

### API 服务

优先级：

1. Fastify + TypeScript：轻、快、适合从小项目开始。
2. NestJS：工程规范强，模块边界清晰，但初期稍重。

如果目标是长期做成完整产品，NestJS 更稳；如果想快速接前端跑起来，Fastify 更轻松。

### 数据库

PostgreSQL。

适合：

- 关系型权限：用户、情侣空间、成员关系。
- 时间线和纪念日查询。
- 心愿、打卡、统计聚合。
- 后续迁移、备份、报表。

### ORM

Prisma。

优势：

- 类型安全。
- schema 清楚，便于和前端 TypeScript 对齐。
- 后续生成迁移脚本方便。

### 图片存储

阶段一：

- 服务器本地目录或 MinIO，先跑通。

阶段二：

- 阿里 OSS、腾讯 COS 或 Cloudflare R2。

接口保持不变，用 `/api/uploads/presign` 抽象掉存储供应商。

### 实时同步

阶段一：

- REST + 手动刷新/提交后本地更新。

阶段二：

- SSE 或 WebSocket，用于悄悄话、打卡动态、对方在线状态。

## 数据模型草案

```text
User
  id
  phone/email
  nickname
  avatarUrl
  city
  createdAt

CoupleSpace
  id
  name
  startDate
  inviteCodeHash
  inviteExpiresAt
  createdAt

CoupleMember
  userId
  spaceId
  role
  joinedAt

ChecklistCategory
  id
  spaceId nullable
  name
  icon
  sortOrder

ChecklistItem
  id
  categoryId
  spaceId
  title
  description
  stage
  sortOrder
  createdBy

CheckinRecord
  id
  itemId
  spaceId
  completedBy
  completedAt
  location
  note

Memory
  id
  spaceId
  title
  date
  location
  mood
  note
  createdBy

MediaAsset
  id
  spaceId
  ownerId
  targetType
  targetId
  url
  mimeType
  width
  height

Anniversary
  id
  spaceId
  name
  date
  calendarType
  repeat
  kind
  owner
  isMain

Wish
  id
  spaceId
  title
  category
  priority
  note
  addedBy
  completedAt

SecretMessage
  id
  spaceId
  fromUserId
  toUserId
  title
  contentEncrypted
  openMode
  openAt
  openedAt

AppSetting
  userId
  spaceId
  anniversaryReminder
  dailyMessagePush
  partnerActivityNotify
  appLock
```

## MVP 顺序

### Milestone 1: 后端骨架

- [x] 初始化 Node.js + TypeScript 后端。
- [x] 接 PostgreSQL。
- [x] 健康检查 `/health`。
- [x] 统一错误格式。
- [x] README/API 文档。

说明：MVP 实际采用 Fastify + `pg`，没有引入 Prisma。当前模型和迁移已经稳定，后续如果确实需要 Prisma，可以在不改变 API 的前提下替换 store 层。

### Milestone 2: 登录和情侣空间

- [x] 用户注册/登录。
- [x] 创建情侣空间。
- [x] 邀请码加入。
- [x] 当前用户和当前空间接口。
- [x] 私有双人账号初始化脚本。

### Milestone 3: 首页真实数据

- [x] `/app/snapshot` 聚合接口。
- [x] 首页天气保留前端静态 mock。
- [x] 设置项保存。
- [x] 前端启动和登录使用 snapshot 拉取后端数据。

### Milestone 4: 核心业务

- [x] 打卡清单：目录仍由前端 `checkin-items.ts` 管理，完成记录由后端持久化。
- [x] 打卡完成记录：创建、更新、撤销。
- [x] 纪念日和生日：默认三项、添加、删除。
- [x] 心愿树：创建、完成、删除。

### Milestone 5: 内容和媒体

- [x] 拾光回忆：创建、删除、snapshot 聚合。
- [x] 图片上传：后端直传、本地文件存储、Docker 数据卷、前端真实图片渲染。
- [x] 悄悄话：发送、打开、删除。
- [x] 定时打开规则：后端按 `openMode/openAt` 判断。

### Milestone 6: 提醒和统计

- [x] 农历生日：MVP 保存并展示农历日期字段。
- [x] 纪念日提醒：MVP 保存提醒开关，前端展示倒计时。
- [x] 基础统计页：前端已有可用展示。
- [x] 真实统计聚合：`/app/snapshot.stats` 返回计数、近 42 天热力图和成员参与占比。
- [x] 服务端天气缓存：前端优先使用 `/weather`，后端缓存 Open-Meteo 结果。
- [x] 年度报告生成：`/reports/annual` 聚合年度总数、月份活动和高光条目。
- [ ] 精准农历换算、Web Push 进入 post-MVP。

## MVP 完成状态

截至当前版本，MVP 的核心可用范围已经完成：两个人可以登录私有小岛，查看首页，完成打卡，维护纪念日，记录拾光和照片，管理心愿，发送悄悄话，并在服务器上通过 Docker 持久运行。后端具备 PostgreSQL 数据持久化、上传文件持久化、备份和恢复脚本。

Post-MVP 的重点不再是“能不能用”，而是体验增强：精确农历换算、Web Push、编辑体验打磨和对象存储迁移。

## 部署建议

第一版：

```text
Nginx
  - /         -> 前端静态文件
  - /api      -> Node.js API
  - /uploads  -> 图片资源或对象存储代理

PostgreSQL
Node.js process managed by pm2 or systemd
```

后续：

- Docker Compose 管理 API、PostgreSQL、Redis、MinIO。
- GitHub Actions 自动部署。
- 定期数据库备份到对象存储。

## 安全边界

- 所有业务表必须带 `spaceId`。
- API 侧校验当前用户是否属于该 `spaceId`。
- 悄悄话内容后端加密存储。
- 邀请码只存 hash，不存明文。
- 图片 URL 不直接暴露本地路径。
- 删除操作先软删除，后续再做回收任务。

## 前端改造点

- 新增 `src/services/serverLoveApi.ts`。
- 增加 `.env.example`：

```text
VITE_API_BASE_URL=http://127.0.0.1:3000
```

- `mockLoveAppApi` 保留为演示模式。
- App 启动时根据环境变量选择 mock 或真实 API。
