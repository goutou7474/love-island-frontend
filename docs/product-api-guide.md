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
GET /api/app/snapshot
```

返回：

```ts
interface LoveAppSnapshot {
  couple: CoupleProfile
  weather: WeatherInfo[]
  checklistCategories: ChecklistCategory[]
  memories: Memory[]
  anniversaries: Anniversary[]
  wishes: Wish[]
  secrets: SecretMessage[]
  settings: AppSettings
  stats: AppStats
}
```

### Checklist

```http
GET  /api/checklist/categories
POST /api/checklist/items
POST /api/checklist/items/:itemId/checkins
PATCH /api/checklist/items/:itemId
DELETE /api/checklist/items/:itemId
```

### Memories

```http
GET  /api/memories?mood=&cursor=
POST /api/memories
GET  /api/memories/:memoryId
PATCH /api/memories/:memoryId
DELETE /api/memories/:memoryId
```

### Anniversaries

```http
GET  /api/anniversaries
POST /api/anniversaries
PATCH /api/anniversaries/:anniversaryId
DELETE /api/anniversaries/:anniversaryId
```

内置重点日：

- 恋爱纪念日：来自情侣空间 `startDate` 或特别字段
- 她的生日：农历 2003-04-03
- 我的生日：农历 2003-02-25
- 结婚纪念日：预留，后续添加

农历日期建议后端统一转换和提醒，前端只展示后端返回的 `nextOccurrenceDate` 和 `daysLeft`。

### Wishes

```http
GET  /api/wishes?category=&status=
POST /api/wishes
POST /api/wishes/:wishId/complete
PATCH /api/wishes/:wishId
DELETE /api/wishes/:wishId
```

### Secret Messages

```http
GET  /api/secrets
POST /api/secrets
POST /api/secrets/:secretId/open
DELETE /api/secrets/:secretId
```

后端根据 `openMode`、`openAt` 和纪念日规则判断是否可打开。前端不应只靠本地判断保密。

### Uploads

```http
POST /api/uploads/presign
POST /api/uploads/complete
```

第一阶段也可以后端直传，后续再切预签名上传。

## 错误与状态

- `401`：登录过期，前端跳登录。
- `403`：没有空间权限，前端进入 forbidden。
- `404`：资源不存在，进入 notFound 或 Toast。
- `409`：邀请码过期、重复加入、并发冲突。
- `422`：表单校验失败，字段级提示。
- `500`：服务错误，Toast + 保留表单数据。

## 接入顺序

1. 保留 mock，先写 `serverLoveAppApi` 的接口形状。
2. 后端完成 auth + space + snapshot。
3. 前端切首页和设置为真实接口。
4. 接打卡、纪念日、心愿。
5. 接拾光、图片上传、悄悄话。
6. 接提醒、统计、年度报告。
