# 产品与接口接入指南

## 产品定位

言言羊羊的小岛是一个情侣专属 PWA。它不是效率工具，而是一个每天愿意打开的关系记录空间：把天气、想念、打卡、照片、纪念日、心愿和悄悄话放进一个柔软的小岛小屋。

## 页面清单

- 登录/创建空间/加入空间
- 首页小屋
- 恋爱打卡收集册
- 拾光时间线
- 纪念日地图
- 心愿树
- 悄悄话信箱
- 统计报告
- 设置、邀请、头像、档案、权限、离线、404
- 添加/编辑/确认类手机底部弹窗

## 前端 API 抽象

当前 UI 只依赖 `LoveAppApi`：

```ts
export interface LoveAppApi {
  getSnapshot: () => Promise<LoveAppSnapshot>
  createSpace: (payload: { name: string; partnerName: string; startDate: string }) => Promise<CoupleProfile>
  joinSpace: (inviteCode: string) => Promise<CoupleProfile>
  saveChecklistItem: (payload: { categoryId: string; title: string }) => Promise<void>
  completeChecklistItem: (itemId: string, payload: { date: string; location: string; note: string }) => Promise<void>
  saveMemory: (payload: Pick<Memory, 'title' | 'date' | 'location' | 'mood' | 'note'>) => Promise<void>
  saveAnniversary: (payload: Pick<Anniversary, 'name' | 'date' | 'repeat' | 'icon'>) => Promise<void>
  saveWish: (payload: Pick<Wish, 'title' | 'category' | 'priority' | 'note'>) => Promise<void>
  sendSecret: (payload: Pick<SecretMessage, 'title' | 'content' | 'openMode' | 'openAt'>) => Promise<void>
  updateSettings: (payload: Partial<AppSettings>) => Promise<void>
}
```

后续真实接入时新增 `serverLoveAppApi`，内部用 `fetch` 调自有服务器即可。UI 不直接调用数据库 SDK。

## 建议接口

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Couple Space

```http
POST /api/spaces
POST /api/spaces/join
GET  /api/spaces/current
PATCH /api/spaces/current
POST /api/spaces/current/invite-code
```

### Snapshot

首屏建议保留聚合接口，降低请求数量：

```http
GET /app/snapshot
```

返回：

```ts
interface LoveAppSnapshot {
  couple: CoupleProfile
  members: PublicUser[]
  weather: WeatherInfo[]
  checklistCategories: ChecklistCategory[]
  customChecklistItems: ChecklistItem[]
  memories: Memory[]
  anniversaries: Anniversary[]
  wishes: Wish[]
  secrets: SecretMessage[]
  settings: AppSettings
  stats: AppStats
}
```

天气优先走自有后端缓存接口：

```http
GET /weather?city=合肥&city=南昌
```

后端按城市调用 Open-Meteo 的 Geocoding API 和 Forecast API，并以城市为 key 做短缓存。前端保留原有 Open-Meteo 直连作为本地预览降级，后端可用时不会暴露第三方天气调用细节。

`stats` 由后端按当前情侣空间实时聚合：在一起天数、完成打卡数、拾光数量、已实现心愿数、近 42 天活跃热力图和两位成员参与占比。前端统计页和年度报告入口直接消费该字段，页面内新增、删除或编辑后再刷新快照即可保持一致。

年度报告由后端按年份生成：

```http
GET /reports/annual?year=2026
```

返回年度总数、最活跃月份、月度活动计数和高光条目。前端在统计页点击报告按钮时拉取该接口，并在弹窗内展示。

### Profile

```http
PATCH /profile
```

用于保存空间名、在一起日期、两个人昵称、城市和头像 URL。头像先走 `POST /media`，再把返回的 `asset.url` 写入对应成员。

### Checklist

```http
GET    /checkins/items
POST   /checkins/items
DELETE /checkins/items/:itemId
GET    /checkins/completions
PUT    /checkins/completions/:itemId
DELETE /checkins/completions/:itemId
```

### Memories

```http
GET    /memories
POST   /memories
PATCH  /memories/:memoryId
DELETE /memories/:memoryId
```

### Anniversaries

```http
GET    /anniversaries
POST   /anniversaries
DELETE /anniversaries/:anniversaryId
```

内置重点日：

- 恋爱纪念日：来自情侣空间 `startDate` 或特别字段
- 她的生日：农历 2003-04-03
- 我的生日：农历 2003-02-25
- 结婚纪念日：预留，后续添加

后端使用农历换算生成 `nextOccurrenceDate`、`daysUntil` 和 `sourceDateLabel`。例如在 2026-05-23 查看，农历 2003-04-03 的下一次公历日期是 2027-05-08；前端只展示这些后端字段，不再按公历生日硬算。

### Wishes

```http
GET    /wishes
POST   /wishes
PATCH  /wishes/:wishId/complete
DELETE /wishes/:wishId
```

完成心愿时可同时提交 `completionNote` 和 `completionPhotos`，前端会把它展示到“已实现心愿”区域。

### Secret Messages

```http
GET    /secrets
POST   /secrets
POST   /secrets/:secretId/open
DELETE /secrets/:secretId
```

后端根据 `openMode`、`openAt` 和纪念日规则判断是否可打开。前端不应只靠本地判断保密。

### Uploads

```http
POST /media
GET  /media/:assetId/file?token=
```

MVP 已采用后端直传。后续迁移到 OSS/COS/R2 时，可以保留 `POST /media` 作为产品接口，内部再替换为预签名上传或对象存储直传。

## 错误与状态

- `401`：登录过期，前端跳登录。
- `403`：没有空间权限，前端进入 forbidden。
- `404`：资源不存在，进入 notFound 或 Toast。
- `409`：邀请码过期、重复加入、并发冲突。
- `422`：表单校验失败，字段级提示。
- `500`：服务错误，Toast + 保留表单数据。

## 接入顺序

1. [x] 保留 mock，先写 `serverLoveAppApi` 的接口形状。
2. [x] 后端完成 auth + space + snapshot。
3. [x] 前端切首页和设置为真实接口。
4. [x] 接打卡、纪念日、心愿。
5. [x] 接拾光、图片上传、悄悄话。
6. [x] 接真实统计聚合。
7. [x] 接年度报告生成。
8. [ ] 接真实提醒。

当前 MVP 已经覆盖 1-7。第 8 项拆为 post-MVP 增强，不阻塞两个人正式使用。
