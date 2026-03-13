<template>
  <div class="home">
    <!-- SVG 渐变定义 -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DB2777;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#CA8A04;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Header - 简洁版 -->
    <div class="header">
      <BrandSymbol class="logo-icon" />
    </div>

    <!-- 农历信息 -->
    <div class="lunar-card">
      <span class="card-date">{{ todayFormatted }}</span>
      <div class="lunar-left" @click.stop="$router.push('/almanac')">
        <span class="lunar-num">{{ solarDay }}</span>
        <span class="lunar-weekday">{{ weekday }}</span>
        <span class="lunar-date-cn">{{ lunarInfo.lunarStr }}</span>
      </div>
      <div class="lunar-right">
        <div class="lunar-header">
          <div class="lunar-ganzhi">{{ lunarInfo.yearGZ }} {{ lunarInfo.monthGZ }} {{ lunarInfo.dayGZ }}</div>
          <div v-if="weather.city" class="weather-info" @click.stop="$router.push('/weather')">
            <span class="weather-icon" v-html="weatherIcons[weatherIcon]"></span>
            <div class="weather-text">
              <span class="weather-temp">{{ weather.lowTemp }}°/{{ weather.highTemp }}°</span>
              <span class="weather-city">{{ weather.city }}</span>
            </div>
          </div>
        </div>
        <div class="lunar-meta">{{ lunarInfo.shengxiao }}年 · {{ lunarInfo.jieqi || lunarInfo.xingzuo }}</div>
        <div class="lunar-yiji">
          <span class="yi">宜 {{ lunarInfo.yi }}</span>
          <span class="ji">忌 {{ lunarInfo.ji }}</span>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="sections">
      <div
        v-for="item in sections"
        :key="item.type"
        class="section"
        @click="$router.push(`/category/${item.type}`)"
      >
        <div class="section-icon">
          <span class="section-char">{{ item.char }}</span>
        </div>
        <div class="section-info">
          <span class="section-title">{{ item.title }}</span>
          <span class="section-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- Tabbar -->
    <TabBar v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Solar } from 'lunar-javascript'
import BrandSymbol from '../components/BrandSymbol.vue'
import TabBar from '../components/TabBar.vue'

const activeTab = ref('home')

const now = new Date()
const today = now.toLocaleDateString('zh-CN', {
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
})

const todayFormatted = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
const weekday = now.toLocaleDateString('zh-CN', { weekday: 'short' })

const solar = Solar.fromDate(new Date())
const lunar = solar.getLunar()
const solarDay = new Date().getDate()

const lunarInfo = ref({
  dayGan: lunar.getDayInGanZhi()[0],
  dayZhi: lunar.getDayInGanZhi()[1],
  day: lunar.getDayInChinese(),
  month: lunar.getMonthInChinese(),
  dayName: lunar.getDayInChinese(),
  lunarStr: lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
  ganzhi: lunar.getYearInGanZhi(),
  yearGZ: lunar.getYearInGanZhi(),
  monthGZ: lunar.getMonthInGanZhi(),
  dayGZ: lunar.getDayInGanZhi(),
  shengxiao: lunar.getYearShengXiao(),
  xingzuo: solar.getXingZuo(),
  jieqi: lunar.getCurrentJieQi()?.getName() || '',
  yi: lunar.getDayYi().slice(0, 4).join(' · '),
  ji: lunar.getDayJi().slice(0, 4).join(' · '),
})

// 天气信息
const weather = ref({
  city: '',
  weather: '',
  temp: '',
  lowTemp: '',
  highTemp: '',
})

// 天气图标映射 - 使用 SVG 替代 emoji
const weatherIcon = computed(() => {
  const w = weather.value.weather
  if (w.includes('晴')) return 'sunny'
  if (w.includes('云') || w.includes('阴')) return 'cloudy'
  if (w.includes('雨')) return 'rainy'
  if (w.includes('雪')) return 'snowy'
  if (w.includes('雷')) return 'thunder'
  if (w.includes('雾') || w.includes('霾')) return 'foggy'
  return 'partly-cloudy'
})

// 天气图标 SVG
const weatherIcons: Record<string, string> = {
  sunny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  rainy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>',
  snowy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/></svg>',
  thunder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><path d="M13 11l-4 6h6l-4 6"/></svg>',
  foggy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M16 17H7M17 21H9"/></svg>',
  'partly-cloudy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><path d="M22 15.08a5.5 5.5 0 0 0-5.5-5.5c-.35 0-.69.04-1.02.11A6 6 0 0 0 4.5 13c0 1.66.67 3.16 1.76 4.24"/></svg>'
}

// 获取定位和天气
async function fetchWeather() {
  try {
    // 使用浏览器定位 API
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // 调用后端天气接口
        const response = await fetch(`/api/weather?lng=${longitude}&lat=${latitude}`)
        const result = await response.json()

        if (result.data) {
          weather.value = {
            city: result.data.city,
            weather: result.data.weather,
            temp: result.data.temperature,
            lowTemp: result.data.lowTemp,
            highTemp: result.data.highTemp,
          }
        }
      },
      (error) => {
        console.log('定位失败:', error)
      },
      { timeout: 5000 }
    )
  } catch (error) {
    console.log('获取天气失败:', error)
  }
}

onMounted(() => {
  fetchWeather()
})

// 区块图标 - 使用专业的 SVG 图标
const sectionIcons: Record<string, string> = {
  // 算 - 命理推算（使用八卦/计算器图标）
  suan: '<circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/>',

  // 问 - 占卜问卦（使用问号/卦象图标）
  wen: '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/><path d="M12 2L15 8L21 9L16.5 13.5L18 20L12 17L6 20L7.5 13.5L3 9L9 8L12 2Z" opacity="0.3"/>',

  // 相 - 相术风水（使用眼睛/罗盘图标）
  xiang: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" opacity="0.5"/>',

  // 寻 - 择吉起名（使用搜索/指南针图标）
  xun: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 7l2 5-5 2 2-5-2-5 5-2-2 5z" opacity="0.6"/>'
}

const sections = [
  {
    type: 'suan',
    char: '算',
    title: '命理推算',
    desc: '生辰八字 · 紫微斗数 · 奇门遁甲'
  },
  {
    type: 'wen',
    char: '问',
    title: '占卜问卦',
    desc: '六爻占卜 · 塔罗牌阵 · 梅花易数'
  },
  {
    type: 'xiang',
    char: '相',
    title: '相术风水',
    desc: '面相手相 · 家居风水 · 吉凶方位'
  },
  {
    type: 'xun',
    char: '寻',
    title: '择吉起名',
    desc: '寻人寻物 · 黄道吉日 · 姓名测算'
  },
]
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 80px;
  position: relative;
  z-index: 1;
}

/* Header - 简洁版 */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 20px;
}

.logo-icon {
  --logo-size: 40px;
}

/* 响应式优化 */
@media (min-width: 768px) {
  .home {
    padding: 0 32px 80px;
  }

  .header {
    padding: 20px 0 24px;
  }

  .logo-icon {
    --logo-size: 48px;
  }

  .sections {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* 尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .lunar-card,
  .section,
  .section::before,
  .section-icon::before,
  .lunar-card::after,
  .logo-text,
  .logo-icon {
    transition: none;
    animation: none;
  }

  .lunar-card:active,
  .section:active {
    transform: none;
  }
}

/* Lunar Card */
.lunar-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.card-date {
  position: absolute;
  top: 8px;
  left: 20px;
  font-size: 9px;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  opacity: 1;
  letter-spacing: 0.3px;
  pointer-events: none;
}

.lunar-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(219, 39, 119, 0.12) 0%, transparent 70%);
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}

.lunar-card:active::after {
  opacity: 0.6;
}

.lunar-card:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.15);
}

.lunar-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 56px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  margin: -8px;
  border-radius: 12px;
}

.lunar-left:active {
  background: rgba(219, 39, 119, 0.1);
  transform: scale(0.95);
}

.lunar-num {
  font-size: 44px;
  font-weight: 200;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  filter: drop-shadow(0 2px 8px rgba(219, 39, 119, 0.4));
}

.lunar-date-cn {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.lunar-weekday {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.7;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.lunar-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lunar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.lunar-ganzhi {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
}

.lunar-meta {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 4px 10px;
  background: rgba(219, 39, 119, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(219, 39, 119, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.weather-info:active {
  background: rgba(219, 39, 119, 0.15);
  transform: scale(0.95);
}

.weather-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  line-height: 1;
}

.weather-icon svg {
  width: 100%;
  height: 100%;
}

.weather-text {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.weather-temp {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.weather-city {
  font-size: 9px;
  color: var(--text-secondary);
  line-height: 1.2;
}

.lunar-yiji {
  display: flex;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.yi {
  color: #10b981;
  opacity: 0.9;
  font-weight: 500;
}

.ji {
  color: #ef4444;
  opacity: 0.9;
  font-weight: 500;
}

/* Sections */
.sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.section:active::before {
  left: 100%;
}

.section:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.15);
}

.section-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%);
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(219, 39, 119, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.section-char {
  font-size: 28px;
  font-weight: 500;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(219, 39, 119, 0.3));
  transition: transform 0.25s ease-out;
}

.section:active .section-char {
  transform: scale(1.1);
}

.section-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(219, 39, 119, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease-out;
}

.section:active .section-icon::before {
  opacity: 1;
}

.section-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.section-desc {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  line-height: 1.5;
}
</style>
