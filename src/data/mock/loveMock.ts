import type {
  Anniversary,
  AppSettings,
  AppStats,
  ChecklistCategory,
  CoupleProfile,
  Memory,
  SecretMessage,
  WeatherInfo,
  Wish,
} from '@/types/love'
import { CAT, categories as checkinCategorySeeds, items as checkinItemSeeds } from '@/data/checkin-items'

export const couple: CoupleProfile = {
  id: 'couple-yanyang',
  spaceName: '言言羊羊的小岛',
  inviteCode: 'YY-0521',
  startDate: '2023-05-12',
  users: [
    { id: 'yanyan', name: '言言', city: '合肥', avatar: '言', color: '#82d5bb' },
    { id: 'yangyang', name: '羊羊', city: '南昌', avatar: '羊', color: '#f8a6b2' },
  ],
}

export const weather: WeatherInfo[] = [
  { city: '合肥', temp: 22, condition: '晴间多云', accent: '#82d5bb' },
  { city: '南昌', temp: 26, condition: '小雨转晴', accent: '#889df0' },
]

const categoryIds = Object.values(CAT)
const categoryColors = ['app-teal', 'app-blue', 'app-yellow', 'warm-peach-pink', 'purple', 'app-green', 'app-pink', 'app-orange', 'lime-green', 'app-red', 'yellow-green', 'brown']
const stageText: Record<string, string> = {
  all: '任何阶段都适合完成的小岛任务',
  dating: '恋爱期收藏项，适合认真记录第一次',
  pre_marriage: '婚前准备阶段的里程碑',
  marriage: '婚后生活里值得纪念的一步',
  parenting: '成为父母后的家庭记忆',
  senior: '慢慢变老以后也想一起完成的事',
}

export const checklistCategories: ChecklistCategory[] = checkinCategorySeeds.map((category, index) => {
  const id = categoryIds[index] ?? `category_${category.order}`
  return {
    id,
    name: category.name,
    icon: category.icon.trim(),
    color: categoryColors[index] ?? 'app-teal',
    items: checkinItemSeeds
      .filter((item) => item.categoryId === id)
      .map((item) => ({
        id: `${item.categoryId}-${item.order}`,
        categoryId: item.categoryId,
        title: item.title,
        description: stageText[item.stage] ?? '值得两个人一起完成的小岛任务',
        completedAt: item.categoryId === CAT.FIRST_TIMES && item.order <= 2 ? '2026-05-01' : undefined,
        completedBy: item.order === 1 ? 'yanyan' : undefined,
        location: item.order === 1 ? '合肥' : undefined,
      })),
  }
})

export const memories: Memory[] = [
  { id: 'm1', title: '第一次一起逛夜市', date: '2026-04-18', location: '南昌', mood: 'sweet', note: '烤年糕很好吃，她笑起来也很好看。', photos: ['night-market-1', 'night-market-2', 'night-market-3'] },
  { id: 'm2', title: '雨天视频通话', date: '2026-04-03', location: '合肥 / 南昌', mood: 'daily', note: '两边都在下雨，像城市之间偷偷接上了线。', photos: ['rain-call-1', 'rain-call-2'] },
  { id: 'm3', title: '春天的小旅行', date: '2026-03-21', location: '武汉', mood: 'travel', note: '一起走了很多路，晚上回去还是不想睡。', photos: ['trip-1', 'trip-2', 'trip-3'] },
  { id: 'm4', title: '在一起纪念日', date: '2025-05-12', location: '合肥', mood: 'first', note: '这一天应该永远有一盏小灯。', photos: ['date-1', 'date-2'] },
  { id: 'm5', title: '她给我的小惊喜', date: '2026-02-14', location: '线上', mood: 'moving', note: '隔着屏幕也能被认真惦记到。', photos: ['gift-1'] },
]

export const anniversaries: Anniversary[] = [
  { id: 'a1', name: '恋爱纪念日', date: '2026-05-28', repeat: 'yearly', icon: '♡', color: '#82d5bb', isMain: true, kind: 'love', owner: 'both' },
  { id: 'a2', name: '言言生日', date: '2003-03-02', repeat: 'yearly', icon: '✦', color: '#889df0', kind: 'birthday', lunarDate: '农历 2003.03.02', owner: 'yanyan' },
  { id: 'a3', name: '羊羊生日', date: '2003-02-25', repeat: 'yearly', icon: '✿', color: '#f8a6b2', kind: 'birthday', lunarDate: '农历 2003.02.25', owner: 'yangyang' },
]

export const wishes: Wish[] = [
  { id: 'w1', title: '去海边住两晚', category: 'place', priority: 3, addedBy: 'yangyang', note: '要有晚风和小夜灯' },
  { id: 'w2', title: '一起吃热乎乎的寿喜锅', category: 'food', priority: 2, addedBy: 'yanyan', note: '冬天安排' },
  { id: 'w3', title: '拍一组情侣胶片照', category: 'activity', priority: 2, addedBy: 'yangyang', note: '自然一点，不要太摆拍' },
  { id: 'w4', title: '买一对小挂件', category: 'gift', priority: 1, addedBy: 'yanyan', note: '挂包上' },
  { id: 'w5', title: '学会一道对方喜欢的菜', category: 'learn', priority: 2, addedBy: 'yanyan', note: '先从简单的开始', completedAt: '2026-04-28' },
]

export const secrets: SecretMessage[] = [
  { id: 's1', direction: 'received', title: '今天的小纸条', content: '你把我的每个普通日子，都变成了值得庆祝的事。', from: '羊羊', createdAt: '今天 10:23', openMode: 'now', isOpened: true },
  { id: 's2', direction: 'received', title: '等见面再打开', content: '这是一封被小岛保管的信。', from: '羊羊', createdAt: '昨天 23:02', openMode: 'date', openAt: '2026-06-01', isOpened: false },
  { id: 's3', direction: 'sent', title: '下次纪念日', content: '希望那天我们能一起吃一块蛋糕。', from: '言言', createdAt: '5月18日', openMode: 'anniversary', isOpened: false },
]

export const settings: AppSettings = {
  anniversaryReminder: true,
  dailyMessagePush: true,
  partnerActivityNotify: true,
  appLock: false,
  softTheme: true,
}

export const stats: AppStats = {
  daysTogether: 1105,
  checklistDone: 47,
  wishesDone: 8,
  memoriesCount: 32,
  heatmap: Array.from({ length: 42 }, (_, index) => ({
    date: `2026-05-${String((index % 30) + 1).padStart(2, '0')}`,
    count: [0, 1, 2, 3][(index * 7) % 4],
  })),
  participation: [
    { userId: 'yanyan', name: '言言', percent: 53, color: '#82d5bb' },
    { userId: 'yangyang', name: '羊羊', percent: 47, color: '#f8a6b2' },
  ],
}
