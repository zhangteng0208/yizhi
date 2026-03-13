<template>
  <div class="page">
    <van-nav-bar
      title="老黄历"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 日期选择器 -->
    <div class="date-strip-wrap">
      <button class="today-btn" @click="goToday">今</button>
      <div v-if="!showCalendar" class="date-strip" ref="stripRef">
        <div
          v-for="(d, i) in dateList"
          :key="i"
          class="date-item"
          :class="{ active: isSameDay(d, selectedDate), today: isSameDay(d, todayDate) }"
          @click="selectDate(d)"
        >
          <span class="date-weekday">{{ weekdayShort(d) }}</span>
          <span class="date-day">{{ d.getDate() }}</span>
          <span class="date-lunar">{{ getLunarDay(d) }}</span>
        </div>
      </div>
      <div v-else class="date-strip-placeholder"></div>
      <button class="calendar-btn" @click="showCalendar = !showCalendar">
        <span v-if="!showCalendar">月</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- 月历视图 -->
    <div v-if="showCalendar" class="calendar-view">
      <div class="calendar-header">
        <button class="month-nav" @click="prevMonth">‹</button>
        <span class="calendar-title">{{ calendarYear }}年{{ calendarMonth }}月</span>
        <button class="month-nav" @click="nextMonth">›</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-weekday" v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</div>
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          class="calendar-day"
          :class="{
            'other-month': day.isOtherMonth,
            'is-today': day.isToday,
            'is-selected': day.isSelected
          }"
          @click="selectCalendarDay(day)"
        >
          <span class="cal-day-num">{{ day.date }}</span>
          <span class="cal-day-lunar">{{ day.lunar }}</span>
        </div>
      </div>
    </div>

    <!-- 日期跳转弹窗 -->
    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-date-picker
        v-model="pickerValue"
        title="选择日期"
        :min-date="new Date(1940, 0, 1)"
        :max-date="new Date(2100, 11, 31)"
        @confirm="onPickerConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>

    <!-- 主日期展示 -->
    <div class="card main-date">
      <div class="main-solar" @click="openPicker">{{ data.solarStr }} {{ data.weekday }} <span class="jump-icon">▾</span></div>
      <div class="main-lunar-big">{{ data.lunarStr }}</div>
      <div class="main-ganzhi">{{ data.yearGZ }}年 {{ data.monthGZ }}月 {{ data.dayGZ }}日</div>
      <div class="main-meta">
        <span>{{ data.shengxiao }}年</span>
        <span>{{ data.xingzuo }}座</span>
        <span v-if="data.jieqi" class="jieqi-badge">{{ data.jieqi }}</span>
      </div>
    </div>

    <!-- 宜忌 -->
    <div class="card yiji-card">
      <div class="yi-section">
        <div class="yi-label">宜</div>
        <div class="yi-tags">
          <span v-for="item in data.yi" :key="item" class="tag yi-tag">{{ item }}</span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="ji-section">
        <div class="ji-label">忌</div>
        <div class="ji-tags">
          <span v-for="item in data.ji" :key="item" class="tag ji-tag">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="card">
      <h3 class="card-title">详细信息</h3>
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label">干支</span><span class="detail-value">{{ data.yearGZ }}年 {{ data.monthGZ }}月 {{ data.dayGZ }}日</span></div>
        <div class="detail-row"><span class="detail-label">值星</span><span class="detail-value">{{ data.zhiXing }}</span></div>
        <div class="detail-row"><span class="detail-label">冲煞</span><span class="detail-value">冲{{ data.chongDesc }} 煞{{ data.sha }}</span></div>
        <div class="detail-row"><span class="detail-label">彭祖</span><span class="detail-value">{{ data.pengZuGan }} {{ data.pengZuZhi }}</span></div>
      </div>
    </div>

    <!-- 吉神凶煞 -->
    <div class="card">
      <h3 class="card-title">吉神凶煞</h3>
      <div class="gods-section">
        <div class="gods-label">吉神宜趋</div>
        <div class="gods-text">{{ data.jiShen.join(' · ') }}</div>
      </div>
      <div class="gods-section" style="margin-top: 12px;">
        <div class="gods-label xiong">凶神宜忌</div>
        <div class="gods-text">{{ data.xiongSha.join(' · ') }}</div>
      </div>
    </div>

    <!-- 吉神方位 -->
    <div class="card">
      <h3 class="card-title">吉神方位</h3>
      <div class="jiugongge">
        <div
          v-for="(cell, i) in jiugongge"
          :key="i"
          class="jgg-cell"
          :class="{ center: cell.dir === '中', 'has-gods': cell.gods.length > 0 }"
        >
          <div class="jgg-dir">{{ cell.dir }}</div>
          <div v-if="cell.gods.length > 0" class="jgg-gods">
            <span v-for="god in cell.gods" :key="god" class="jgg-god">{{ god }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 时辰吉凶 -->
    <div class="card">
      <h3 class="card-title">时辰吉凶</h3>
      <div class="shichen-list">
        <div v-for="s in data.shichenList" :key="s.ganZhi" class="shichen-item" :class="{ 'is-ji': s.luck === '吉' }">
          <div class="sc-main">
            <span class="sc-zhi">{{ s.zhi }}时</span>
            <span class="sc-gz">{{ s.ganZhi }}</span>
            <span class="sc-time">{{ s.timeRange }}</span>
          </div>
          <span class="sc-luck" :class="s.luck === '吉' ? 'luck-ji' : 'luck-xiong'">{{ s.luck }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Solar } from 'lunar-javascript'

const todayDate = new Date()
const selectedDate = ref(new Date())
const stripRef = ref<HTMLElement | null>(null)
const showCalendar = ref(false)

// 月历相关
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)

// 日期跳转弹窗（Vant DatePicker）
const showPicker = ref(false)
const pickerValue = ref<string[]>([])

function openPicker() {
  const d = selectedDate.value
  pickerValue.value = [
    String(d.getFullYear()),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ]
  showPicker.value = true
}

function onPickerConfirm({ selectedValues }: { selectedValues: string[] }) {
  const [y, m, d] = selectedValues.map(Number)
  selectedDate.value = new Date(y, m - 1, d)
  showPicker.value = false
}

// 日期选择器：以选中日期为中心生成 31 天
const dateList = computed(() => {
  const center = selectedDate.value
  const result: Date[] = []
  for (let i = -15; i <= 15; i++) {
    const d = new Date(center.getFullYear(), center.getMonth(), center.getDate() + i)
    result.push(d)
  }
  return result
})

const weekdayShort = (d: Date) => '周' + ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]

const getLunarDay = (d: Date) => {
  const s = Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
  const l = s.getLunar()
  const dayStr = l.getDayInChinese()
  // 初一显示月份
  return dayStr === '初一' ? l.getMonthInChinese() + '月' : dayStr
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

function selectDate(d: Date) {
  selectedDate.value = new Date(d)
}

function goToday() {
  selectedDate.value = new Date()
  calendarYear.value = new Date().getFullYear()
  calendarMonth.value = new Date().getMonth() + 1
}

// 月历功能
function prevMonth() {
  if (calendarMonth.value === 1) {
    calendarYear.value--
    calendarMonth.value = 12
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 12) {
    calendarYear.value++
    calendarMonth.value = 1
  } else {
    calendarMonth.value++
  }
}

const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: any[] = []

  // 上月补齐
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 2, prevMonthLastDay - i)
    days.push({
      date: d.getDate(),
      lunar: getLunarDay(d),
      fullDate: d,
      isOtherMonth: true,
      isToday: isSameDay(d, todayDate),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  // 本月
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i)
    days.push({
      date: i,
      lunar: getLunarDay(d),
      fullDate: d,
      isOtherMonth: false,
      isToday: isSameDay(d, todayDate),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  // 下月补齐
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month, i)
    days.push({
      date: i,
      lunar: getLunarDay(d),
      fullDate: d,
      isOtherMonth: true,
      isToday: isSameDay(d, todayDate),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  return days
})

function selectCalendarDay(day: any) {
  if (day.isOtherMonth) {
    // 切换到对应月份
    const d = day.fullDate
    calendarYear.value = d.getFullYear()
    calendarMonth.value = d.getMonth() + 1
  }
  selectedDate.value = new Date(day.fullDate)
  showCalendar.value = false
}

// 自动滚动选中日期到中间
function scrollToActive() {
  nextTick(() => {
    const el = stripRef.value?.querySelector('.date-item.active') as HTMLElement | null
    if (el && stripRef.value) {
      const stripW = stripRef.value.offsetWidth
      const elLeft = el.offsetLeft
      const elW = el.offsetWidth
      stripRef.value.scrollTo({ left: elLeft - stripW / 2 + elW / 2, behavior: 'smooth' })
    }
  })
}

watch(selectedDate, scrollToActive)
onMounted(() => {
  nextTick(() => {
    const el = stripRef.value?.querySelector('.date-item.active') as HTMLElement | null
    if (el && stripRef.value) {
      const stripW = stripRef.value.offsetWidth
      const elLeft = el.offsetLeft
      const elW = el.offsetWidth
      stripRef.value.scrollTo({ left: elLeft - stripW / 2 + elW / 2 })
    }
  })
})

// 方位映射：将方位描述转换为标准方位
function parseDirection(desc: string): string {
  if (!desc) return ''
  if (desc.includes('正北') || desc === '北') return '北'
  if (desc.includes('东北')) return '东北'
  if (desc.includes('正东') || desc === '东') return '东'
  if (desc.includes('东南')) return '东南'
  if (desc.includes('正南') || desc === '南') return '南'
  if (desc.includes('西南')) return '西南'
  if (desc.includes('正西') || desc === '西') return '西'
  if (desc.includes('西北')) return '西北'
  return ''
}

// 黄历数据
const data = computed(() => {
  const d = selectedDate.value
  const solar = Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
  const lunar = solar.getLunar()

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  // 时辰 (getTimes 返回 13 项, index 0 是早子时, 1-12 是标准十二时辰)
  let shichenList: any[] = []
  try {
    const times = lunar.getTimes()
    shichenList = times.slice(1).map((t: any) => ({
      ganZhi: t.getGanZhi(),
      zhi: t.getZhi(),
      timeRange: t.getMinHm() + '-' + t.getMaxHm(),
      luck: t.getTianShenLuck(),
    }))
  } catch {
    // fallback if getTimes not available
  }

  const xiShen = lunar.getDayPositionXiDesc()
  const fuShen = lunar.getDayPositionFuDesc()
  const caiShen = lunar.getDayPositionCaiDesc()
  const yangGui = lunar.getDayPositionYangGuiDesc()
  const yinGui = lunar.getDayPositionYinGuiDesc()

  return {
    solarStr: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
    weekday: '星期' + weekdays[d.getDay()],
    lunarStr: lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    yearGZ: lunar.getYearInGanZhi(),
    monthGZ: lunar.getMonthInGanZhi(),
    dayGZ: lunar.getDayInGanZhi(),
    shengxiao: lunar.getYearShengXiao(),
    xingzuo: solar.getXingZuo(),
    jieqi: lunar.getCurrentJieQi()?.getName() || '',
    yi: lunar.getDayYi() || [],
    ji: lunar.getDayJi() || [],
    zhiXing: lunar.getZhiXing(),
    chongDesc: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    pengZuGan: lunar.getPengZuGan(),
    pengZuZhi: lunar.getPengZuZhi(),
    jiShen: lunar.getDayJiShen() || [],
    xiongSha: lunar.getDayXiongSha() || [],
    xiShen,
    fuShen,
    caiShen,
    yangGui,
    yinGui,
    shichenList,
  }
})

// 九宫格方位数据
const jiugongge = computed(() => {
  const gods = [
    { name: '喜神', dir: parseDirection(data.value.xiShen) },
    { name: '福神', dir: parseDirection(data.value.fuShen) },
    { name: '财神', dir: parseDirection(data.value.caiShen) },
    { name: '阳贵', dir: parseDirection(data.value.yangGui) },
    { name: '阴贵', dir: parseDirection(data.value.yinGui) },
  ]

  // 按方位分组
  const dirMap: Record<string, string[]> = {
    '北': [], '东北': [], '东': [], '东南': [],
    '南': [], '西南': [], '西': [], '西北': [],
  }

  gods.forEach(g => {
    if (g.dir && dirMap[g.dir]) {
      dirMap[g.dir].push(g.name)
    }
  })

  // 九宫格布局：上北下南
  return [
    { dir: '西北', gods: dirMap['西北'] },
    { dir: '北', gods: dirMap['北'] },
    { dir: '东北', gods: dirMap['东北'] },
    { dir: '西', gods: dirMap['西'] },
    { dir: '中', gods: [] },
    { dir: '东', gods: dirMap['东'] },
    { dir: '西南', gods: dirMap['西南'] },
    { dir: '南', gods: dirMap['南'] },
    { dir: '东南', gods: dirMap['东南'] },
  ]
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }

.main-solar { cursor: pointer; }
.jump-icon { font-size: 10px; color: var(--text-tertiary); margin-left: 4px; }

/* 日期选择器 */
.date-strip-wrap { display: flex; align-items: center; gap: 8px; padding: 0 20px; margin-bottom: 16px; }
.today-btn { flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; background: rgba(219, 39, 119, 0.1); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; border: 1px solid rgba(219, 39, 119, 0.25); font-size: 13px; font-weight: 500; cursor: pointer; }
.today-btn:active { opacity: 0.8; }
.calendar-btn { flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-secondary); border: 1px solid var(--border); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.calendar-btn:active { opacity: 0.8; }
.date-strip { display: flex; gap: 6px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 4px 0; flex: 1; }
.date-strip-placeholder { flex: 1; }
.date-strip::-webkit-scrollbar { display: none; }
.date-item { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 10px; min-width: 48px; border-radius: 8px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); cursor: pointer; transition: all 0.2s; }
.date-item.today { border: 1px solid rgba(219, 39, 119, 0.3); }
.date-item.active { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); }
.date-weekday { font-size: 10px; color: var(--text-tertiary); }
.date-day { font-size: 16px; font-weight: 500; color: var(--text-primary); }
.date-lunar { font-size: 10px; color: var(--text-secondary); }
.date-item.active .date-weekday,
.date-item.active .date-day,
.date-item.active .date-lunar { color: #fff; }

/* 月历视图 */
.calendar-view { margin: 0 20px 16px; padding: 16px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); }
.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.calendar-title { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.month-nav { width: 28px; height: 28px; border-radius: 6px; background: var(--bg-primary); color: var(--text-secondary); border: none; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.month-nav:active { opacity: 0.7; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.calendar-weekday { text-align: center; font-size: 11px; color: var(--text-tertiary); padding: 6px 0; }
.calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-radius: 6px; background: var(--bg-primary); cursor: pointer; transition: all 0.2s; }
.calendar-day.other-month { opacity: 0.3; }
.calendar-day.is-today { border: 1px solid rgba(219, 39, 119, 0.4); }
.calendar-day.is-selected { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); }
.calendar-day.is-selected .cal-day-num,
.calendar-day.is-selected .cal-day-lunar { color: #fff; }
.calendar-day:active { transform: scale(0.95); }
.cal-day-num { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.cal-day-lunar { font-size: 9px; color: var(--text-tertiary); }

/* 主日期展示 */
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.main-date { text-align: center; }
.main-solar { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
.main-lunar-big { font-size: 32px; font-weight: 300; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 8px; }
.main-ganzhi { font-size: 13px; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 1px; }
.main-meta { display: flex; justify-content: center; gap: 12px; font-size: 12px; color: var(--text-secondary); }
.jieqi-badge { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* 宜忌 */
.yiji-card { padding: 20px; }
.yi-section, .ji-section { display: flex; gap: 12px; }
.yi-label, .ji-label { flex-shrink: 0; font-size: 14px; font-weight: 500; padding-top: 4px; width: 24px; }
.yi-label { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.ji-label { color: #999; }
.yi-tags, .ji-tags { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }
.tag { font-size: 12px; padding: 4px 10px; border-radius: 6px; }
.yi-tag { background: rgba(219, 39, 119, 0.1); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.ji-tag { background: rgba(255, 255, 255, 0.04); color: var(--text-secondary); }
.divider { height: 1px; background: var(--border); margin: 14px 0; }

/* 详细信息 */
.detail-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-label { color: var(--text-secondary); }
.detail-value { color: var(--text-primary); text-align: right; flex: 1; margin-left: 16px; }

/* 吉神凶煞 */
.gods-section { }
.gods-label { font-size: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; font-weight: 500; }
.gods-label.xiong { color: var(--text-secondary); }
.gods-text { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }

/* 九宫格方位 */
.jiugongge { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.jgg-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.jgg-cell.center {
  background: rgba(219, 39, 119, 0.1);
  border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
}
.jgg-cell.has-gods {
  background: rgba(219, 39, 119, 0.08);
  border-color: rgba(219, 39, 119, 0.25);
}
.jgg-dir {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 1px;
}
.jgg-cell.center .jgg-dir {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-size: 14px;
}
.jgg-gods {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.jgg-god {
  font-size: 11px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  padding: 2px 6px;
  background: rgba(219, 39, 119, 0.1);
  border-radius: 4px;
  white-space: nowrap;
}

/* 时辰吉凶 */
.shichen-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border-radius: 8px; overflow: hidden; }
.shichen-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-primary); }
.shichen-item.is-ji { border-left: 2px solid #DB2777; }
.sc-main { display: flex; align-items: center; gap: 10px; }
.sc-zhi { font-size: 13px; font-weight: 500; color: var(--text-primary); min-width: 32px; }
.sc-gz { font-size: 12px; color: var(--text-secondary); }
.sc-time { font-size: 11px; color: var(--text-tertiary); }
.sc-luck { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.luck-ji { background: rgba(219, 39, 119, 0.1); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.luck-xiong { background: rgba(255, 255, 255, 0.04); color: var(--text-tertiary); }
</style>
