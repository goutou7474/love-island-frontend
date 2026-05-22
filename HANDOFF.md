# 言言羊羊 · Animal Island 前端交接文档

> 本目录是全新的清新可爱版本，旧版冷青瓷原型仍保留在 `preview/`。本版本直接使用 `animal-island-ui` 作为基础 UI 底座，适合继续接 Firebase 后端做成完整 PWA。

## 1. 项目定位

- 产品名：言言羊羊的小岛
- 使用场景：两个人自用的情侣记录 PWA，重点是异地恋日常、纪念、打卡和悄悄话
- 视觉方向：清新岛屿风，奶油底色、薄荷绿、浅桃粉、嫩黄、浅蓝，控制饱和度，不做重色
- 技术栈：React 18 + TypeScript + Vite 5 + Tailwind CSS v3 + animal-island-ui
- 当前状态：完整可交互前端原型，数据来自本地 Mock，API 接入层已预留

## 2. 启动方式

```bash
cd animal-preview
npm install
npm run dev
```

默认地址：`http://localhost:5173`

构建：

```bash
npm run build
```

## 3. 目录说明

```text
animal-preview/
├── src/
│   ├── App.tsx                         # 主页面、页面状态、所有原型交互
│   ├── main.tsx                        # 引入 animal-island-ui/style
│   ├── index.css                       # 清新岛屿风全局样式和手机壳
│   ├── types/love.ts                   # 产品数据类型
│   ├── data/mock/loveMock.ts           # Mock 数据
│   ├── services/loveApi.ts             # 后端适配接口，当前 mock 实现
│   └── components/feedback/
│       └── IslandFeedback.tsx          # Loading / Empty / Error / Toast / Confirm
├── HANDOFF.md                          # 本文档
└── docs/product-api-guide.md           # 产品功能和接口接入指南
```

旧版 `src/pages/` 和 `src/components/sheets/` 文件从 `preview/` 复制而来，但本版本的 TypeScript 编译范围已收窄到新架构文件，避免旧冷青瓷代码干扰。

## 4. UI 组件库使用规则

入口必须保留：

```ts
import 'animal-island-ui/style'
```

已使用组件：

- `Cursor`：全局游戏风光标
- `Button`：主按钮、次按钮、危险按钮
- `Card`：动森风信息卡片
- `Modal`：所有添加/编辑/确认类弹窗
- `Switch`：设置开关
- `Tabs`：拾光筛选、悄悄话收/发切换

不要给 `animal-island-ui` 组件传不存在的 props，比如 `variant`、`color="primary"`。Card 颜色必须使用库支持的固定值。

## 5. 页面地图

### 登录与空间

- 登录页：直接进入原型、创建情侣空间、输入邀请码加入
- 创建空间弹窗：你的昵称、TA 的昵称、在一起日期
- 加入空间弹窗：邀请码校验
- 邀请码弹窗/页面：复制邀请码，后续可扩展二维码和过期时间

### 5 个主 Tab

- 小屋首页：在一起天数、双城天气、今日悄悄话、打卡进度、最近纪念日、快捷入口
- 打卡清单：分类、完成进度、添加打卡项、完成打卡表单、照片占位
- 拾光时间线：全部/甜甜的/旅行筛选、添加回忆、回忆详情、编辑/删除入口
- 纪念日：最近纪念日、主纪念日、添加纪念日、删除确认
- 心愿清单：分类、优先级、完成确认、已实现心愿区、删除确认

### 从首页进入

- 悄悄话：收到的/发出的、锁定消息、写悄悄话、定时打开
- 数据统计：概览数字、打卡热力图、参与度、年度报告入口
- 设置：档案、头像、邀请码、通知开关、异常状态页入口、退出登录

### 状态与反馈

- Loading：初始同步
- Toast：保存成功、错误、提示
- Confirm：删除二次确认
- 离线页：网络不可用
- 无权限页：邀请码或身份错误
- 404 页：路由不存在
- 表单校验：必填项为空时提示
- 图片上传占位：打卡、回忆、心愿完成、头像

## 6. 后端接入边界

所有后端调用都集中在 `src/services/loveApi.ts` 的 `LoveAppApi` 接口：

```ts
export interface LoveAppApi {
  getSnapshot: () => Promise<LoveAppSnapshot>
  createSpace: (payload) => Promise<CoupleProfile>
  joinSpace: (inviteCode: string) => Promise<CoupleProfile>
  saveChecklistItem: (payload) => Promise<void>
  completeChecklistItem: (itemId, payload) => Promise<void>
  saveMemory: (payload) => Promise<void>
  saveAnniversary: (payload) => Promise<void>
  saveWish: (payload) => Promise<void>
  sendSecret: (payload) => Promise<void>
  updateSettings: (payload) => Promise<void>
}
```

接入真实后端时，新增 `firebaseLoveAppApi` 或 `httpLoveAppApi`，保持接口不变，然后在 `App.tsx` 替换 `mockLoveAppApi` 即可。

## 7. 推荐 Firestore 数据结构

```text
users/{uid}
  name, city, avatarUrl, coupleId, settings

couples/{coupleId}
  spaceName, inviteCode, userIds, startDate, createdAt

couples/{coupleId}/checklistCategories/{categoryId}
  name, icon, order, color

couples/{coupleId}/checklistItems/{itemId}
  categoryId, title, description, completedAt, completedBy, location, note, photos[]

couples/{coupleId}/memories/{memoryId}
  title, date, location, mood, note, photos[], createdBy, createdAt

couples/{coupleId}/anniversaries/{anniversaryId}
  name, date, repeat, icon, color, isMain

couples/{coupleId}/wishes/{wishId}
  title, category, priority, addedBy, note, completedAt, completedNote, photos[]

couples/{coupleId}/secretMessages/{messageId}
  title, content, fromUserId, toUserId, openMode, openAt, isOpened, openedAt, createdAt

couples/{coupleId}/stats/summary
  daysTogether, checklistDone, wishesDone, memoriesCount, heatmap, participation, updatedAt
```

## 8. 接入建议顺序

1. Firebase Auth：替换登录态和退出登录
2. Couple Profile：创建空间、加入空间、邀请码
3. Snapshot 查询：进入 App 后一次性拉取首页所需数据
4. CRUD：打卡、回忆、纪念日、心愿、悄悄话
5. Firebase Storage：照片和头像上传
6. Cloud Functions：统计聚合、年度报告、定时悄悄话解锁
7. FCM：纪念日、每日情话、对方活动通知
8. PWA：manifest、Service Worker、离线缓存和安装提示

## 9. 当前验证结果

- `npm install` 已完成
- `npm run build` 已通过
- 注意：npm audit 当前提示 2 个 moderate 警告，来自依赖树。自用原型可先忽略，正式部署前再评估是否升级。
