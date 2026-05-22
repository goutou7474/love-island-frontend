import { MapPin, CheckSquare, Star, TrendingUp } from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────
const OVERVIEW = [
  { value: 365, unit: '天', label: '在一起',    color: 'text-deep' },
  { value: 47,  unit: '项', label: '打卡完成',  color: 'text-primary' },
  { value: 12,  unit: '个', label: '心愿达成',  color: 'text-warm' },
  { value: 23,  unit: '条', label: '拾光记录',  color: 'text-primary' },
]

const FUN_STATS = [
  { Icon: MapPin,      label: '最常出现的城市',     value: '杭州 · 已去 4 次', sub: '' },
  { Icon: CheckSquare, label: '完成最多的打卡类型', value: '旅行与探索 · 8 项', sub: '' },
  { Icon: Star,        label: '最活跃的月份',       value: '2023年 12月',       sub: '那个月你们完成了 11 件事' },
  { Icon: TrendingUp,  label: '当前连续活跃',       value: '14 天',             sub: '' },
]

const PARTICIPATION = [
  { name: '言言', pct: 62, gradient: ['#A4C4C0', '#7CB4AA'] as [string, string] },
  { name: '羊羊', pct: 38, gradient: ['#C4D8B0', '#8CB488'] as [string, string], barColor: '#8BBFB7' },
]

// Simplified 6-month heatmap data (0-3 intensity)
const HEATMAP_MONTHS = [
  { label: '11', weeks: [[1,0,2,1],[0,1,1,0],[2,1,0,2],[1,3,2,1]] },
  { label: '12', weeks: [[3,2,3,2],[1,2,3,3],[2,3,3,2],[3,2,1,3]] },
  { label: '1',  weeks: [[2,1,0,1],[1,0,2,1],[0,1,1,0],[2,1,2,1]] },
  { label: '2',  weeks: [[1,2,3,2],[3,3,2,3],[2,1,2,3],[1,2,3,0]] },
  { label: '3',  weeks: [[1,0,1,2],[2,1,3,2],[1,2,2,1],[3,2,1,2]] },
  { label: '4',  weeks: [[2,3,2,1],[1,2,3,2],[3,2,1,3],[2,1,2,3]] },
]

const HM_COLORS = ['bg-primary-subtle', 'bg-[#B4D8D0]', 'bg-[#7ABCB2]', 'bg-primary']

export default function StatsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
      </div>

      {/* Page header */}
      <div className="px-5 pt-3 pb-2">
        <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">统计</h1>
        <p className="text-2xs text-mid mt-0.5">我们的数字故事</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-2.5">

        {/* ── 4-grid overview ── */}
        <div className="grid grid-cols-2 gap-2">
          {OVERVIEW.map((item) => (
            <div key={item.label} className="bg-surface rounded-2xl px-3.5 py-3 shadow-card">
              <div className="flex items-baseline">
                <span className={['text-[30px] font-[250] leading-none tracking-[-1px]', item.color].join(' ')}>
                  {item.value}
                </span>
                <span className="text-[12px] font-[300] text-primary ml-0.5">{item.unit}</span>
              </div>
              <p className="text-2xs text-mid-light mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* ── Activity heatmap ── */}
        <div className="bg-surface rounded-[18px] px-3.5 py-3.5 shadow-card">
          <div className="flex justify-between items-center mb-2.5">
            <p className="text-[11px] font-medium text-deep">活跃记录</p>
            <span className="text-2xs text-mid-light">过去 6 个月</span>
          </div>
          <div className="flex gap-1" aria-label="活跃热力图">
            {HEATMAP_MONTHS.map((month) => (
              <div key={month.label} className="flex flex-col gap-0.5">
                <p className="text-[7.5px] text-mid-pale text-center mb-0.5">{month.label}</p>
                <div className="flex gap-0.5">
                  {month.weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                      {week.map((intensity, di) => (
                        <div
                          key={di}
                          className={['w-2 h-2 rounded-[2px]', HM_COLORS[intensity]].join(' ')}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-2xs text-mid-light">少</span>
            {HM_COLORS.map((c, i) => (
              <div key={i} className={['w-2 h-2 rounded-[2px]', c].join(' ')} />
            ))}
            <span className="text-2xs text-mid-light">多</span>
          </div>
        </div>

        {/* ── Participation ── */}
        <div className="bg-surface rounded-[18px] px-3.5 py-3.5 shadow-card">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[11px] font-medium text-deep">爱情参与度</p>
            <span className="text-2xs text-mid-light">本月</span>
          </div>
          {PARTICIPATION.map((p) => (
            <div key={p.name} className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
                aria-label={`${p.name}的头像`}
              />
              <span className="text-[10.5px] text-primary/80 flex-shrink-0 w-8">{p.name}</span>
              <div className="flex-1 h-2 bg-primary-subtle rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${p.pct}%`,
                    background: p.barColor ?? '#3A7A6E',
                  }}
                  role="progressbar"
                  aria-valuenow={p.pct}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-[10.5px] text-primary font-medium flex-shrink-0 w-8 text-right">
                {p.pct}%
              </span>
            </div>
          ))}
          <p className="text-2xs text-mid-light text-center mt-1">
            这个月言言更主动哦 ～ 羊羊要加油
          </p>
        </div>

        {/* ── Fun stats ── */}
        <div className="bg-surface rounded-[18px] px-3.5 py-3 shadow-card">
          <p className="text-[11px] font-medium text-deep mb-1">趣味统计</p>
          {FUN_STATS.map(({ Icon, label, value, sub }, i) => (
            <div
              key={label}
              className={[
                'flex items-start gap-2.5 py-2',
                i < FUN_STATS.length - 1 ? 'border-b border-primary-subtle/30' : '',
              ].join(' ')}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-mid" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xs text-mid-light">{label}</p>
                <p className="text-[12px] text-deep font-medium mt-0.5">{value}</p>
                {sub && <p className="text-2xs text-mid mt-0.5">{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Annual report entry ── */}
        <button className="rounded-[20px] p-[18px] bg-hero-gradient noise-overlay shadow-card-hover text-left tappable relative">
          <p className="text-2xs text-primary-muted tracking-[1px] mb-1">年度报告</p>
          <p className="text-[17px] font-[300] text-deep mb-1.5">2023 · 我们的第一年</p>
          <p className="text-[11px] text-primary/80 leading-relaxed">
            去了 3 座城市，完成了 47 件事<br />
            一起度过了 365 个日夜
          </p>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[22px] text-primary">›</span>
        </button>

      </div>
    </div>
  )
}
