<template>
  <div class="page">
    <van-nav-bar
      title="测算结果"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <LoadingOverlay :visible="loading" text="加载中..." />

    <template v-if="data">
      <!-- 测算者信息 -->
      <div class="card user-info">
        <div class="info-row"><span class="info-label">姓名</span><span class="info-value">{{ params?.name ?? '—' }}</span></div>
        <div class="info-row"><span class="info-label">性别</span><span class="info-value">{{ params?.gender ?? '—' }}</span></div>
        <div class="info-row"><span class="info-label">出生</span><span class="info-value">{{ birthDisplay }}</span></div>
        <div class="info-row"><span class="info-label">八字</span><span class="info-value bazi-text">{{ data.bazi?.rawBaZi ?? '—' }}</span></div>
        <div class="info-row" v-if="data.bazi?.lunarInfo"><span class="info-label">农历</span><span class="info-value">{{ data.bazi.lunarInfo.lunarYear }}{{ data.bazi.lunarInfo.lunarMonth }}{{ data.bazi.lunarInfo.lunarDay }}</span></div>
        <div class="info-row" v-if="data.bazi?.lunarInfo"><span class="info-label">生肖/星座</span><span class="info-value">{{ data.bazi.lunarInfo.shengXiao }} · {{ data.bazi.lunarInfo.xingZuo }}</span></div>
      </div>

      <!-- 四柱排盘 - 优化版 -->
      <div class="bazi-card-enhanced">
        <div class="bazi-header">
          <h3 class="bazi-title">四柱排盘</h3>
          <div class="bazi-subtitle">命理核心 · 八字详解</div>
        </div>
        <div class="bazi-grid-enhanced">
          <div v-for="(col, i) in pillars" :key="col.label" class="bazi-col-enhanced" :class="{ 'is-rizhu': i === 2 }">
            <div class="pillar-header">
              <span class="pillar-label">{{ col.label }}</span>
              <span class="pillar-shishen" :class="{ 'is-master': col.shiShen === '日主' }">{{ col.shiShen }}</span>
            </div>
            <div class="pillar-main">
              <div class="pillar-ganzhi">
                <span class="gan">{{ col.tianGan }}</span>
                <span class="zhi">{{ col.diZhi }}</span>
              </div>
              <div class="pillar-wuxing">{{ col.wuXing }}</div>
            </div>
            <div class="pillar-details">
              <div class="detail-item" v-if="col.cangGan?.length">
                <span class="detail-key">藏干</span>
                <span class="detail-val">{{ col.cangGan.join(' ') }}</span>
              </div>
              <div class="detail-item" v-if="col.changSheng">
                <span class="detail-key">星运</span>
                <span class="detail-val highlight-gold">{{ col.changSheng }}</span>
              </div>
              <div class="detail-item" v-if="col.kongWang">
                <span class="detail-key">空亡</span>
                <span class="detail-val highlight-blue">{{ col.kongWang }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-key">纳音</span>
                <span class="detail-val">{{ col.naYin }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 五行分析 - 增强版 -->
      <div class="wuxing-card-enhanced">
        <div class="wuxing-header">
          <h3 class="wuxing-title">五行分析</h3>
          <div class="wuxing-subtitle">命局平衡 · 生克制化</div>
        </div>

        <!-- 五行横向网格 -->
        <div class="wuxing-grid">
          <div v-for="wx in wuxingList" :key="wx.label" class="wuxing-col" :class="{ 'is-lack': wx.count === 0 }">
            <div class="wx-header">
              <span class="wx-label" :style="{ color: wx.color }">{{ wx.label }}</span>
            </div>
            <div class="wx-bar-vertical">
              <span class="wx-count-large" :style="{ color: wx.color }">{{ wx.count }}</span>
            </div>
            <div class="wx-status">
              <span v-if="wx.count === 0" class="wx-badge lack">缺</span>
              <span v-else-if="wx.count >= 3" class="wx-badge strong">旺</span>
              <span v-else-if="wx.count === 1" class="wx-badge weak">弱</span>
            </div>
          </div>
        </div>

        <!-- 五行状态标签 -->
        <div class="wuxing-status">
          <span v-if="data.bazi?.wuXingLack?.length" class="status-tag lack">缺 {{ data.bazi.wuXingLack.join('、') }}</span>
          <span v-for="wx in wuxingStrong" :key="wx" class="status-tag strong">{{ wx }} 偏旺</span>
          <span v-for="wx in wuxingWeak" :key="wx" class="status-tag weak">{{ wx }} 偏弱</span>
        </div>

        <!-- 命局核心信息 -->
        <div class="mingjü-core">
          <div class="core-row">
            <span class="core-label">日主</span>
            <span class="core-value highlight">{{ data.bazi?.riZhu }}（{{ data.bazi?.riZhuWuXing }}）</span>
            <span class="core-badge" :class="data.bazi?.shenQiangRuo === '身强' ? 'strong' : 'weak'">{{ data.bazi?.shenQiangRuo }}</span>
          </div>
          <div class="core-row">
            <span class="core-label">格局</span>
            <span class="core-value">{{ data.bazi?.geJu }}</span>
          </div>
          <div class="core-row">
            <span class="core-label">用神</span>
            <span class="core-value yongshen">{{ data.bazi?.yongShen }}</span>
            <span class="core-divider">·</span>
            <span class="core-label">忌神</span>
            <span class="core-value jishen">{{ data.bazi?.jiShen }}</span>
          </div>
        </div>

        <!-- 五行生克影响 -->
        <div class="wuxing-effects-enhanced" v-if="wuxingEffects.length">
          <div class="effects-title">生克影响</div>
          <div v-for="(eff, i) in wuxingEffects" :key="i" class="effect-item">
            <span class="effect-icon">{{ eff.icon }}</span>
            <span class="effect-text">{{ eff.text }}</span>
          </div>
        </div>
      </div>

      <!-- 大运 -->
      <div class="card" v-if="data.bazi?.daYun?.length">
        <h3 class="card-title">大运走势</h3>
        <div class="dayun-timeline">
          <div v-for="(dy, i) in data.bazi.daYun" :key="i" class="dayun-item" :class="{ current: isDaYunCurrent(dy) }">
            <span class="dayun-age">{{ dy.startAge }}-{{ dy.endAge }}岁</span>
            <span class="dayun-gz">{{ dy.tianGan }}{{ dy.diZhi }}</span>
            <span class="dayun-wx">{{ dy.wuXing }}</span>
          </div>
        </div>
      </div>

      <!-- AI 解读 - 简洁版 -->
      <div class="ai-divination-card">
        <div class="ai-card-header">
          <h3 class="ai-card-title">
            命理解读
            <span v-if="data.ai && aiDepth" class="depth-badge" :class="`depth-${aiDepth}`">
              {{ getDepthLabel(aiDepth) }}
            </span>
          </h3>
        </div>

        <!-- 开始解读按钮 -->
        <div class="trigger-section-compact" v-if="!data.ai && !store.aiLoading">
          <button class="btn-divine-compact" @click="showDepthPicker = true">
            <span class="btn-text">开始解读</span>
          </button>
        </div>

        <!-- 重新解读按钮 -->
        <div class="trigger-section-compact" v-if="data.ai && !store.aiLoading">
          <button class="btn-divine-compact" @click="showDepthPicker = true">
            <span class="btn-text">重新解读</span>
          </button>
        </div>

        <!-- 深度选择弹窗 -->
        <van-action-sheet v-model:show="showDepthPicker" title="选择解读深度">
          <div class="depth-picker-content">
            <div
              v-for="option in depthOptions"
              :key="option.value"
              class="depth-picker-item"
              @click="selectDepth(option.value)"
            >
              <div class="depth-item-icon">{{ option.icon }}</div>
              <div class="depth-item-info">
                <div class="depth-item-name">{{ option.name }}</div>
                <div class="depth-item-desc">{{ option.desc }}</div>
              </div>
            </div>
          </div>
        </van-action-sheet>

        <!-- 加载状态 -->
        <div v-if="store.aiLoading && !data.ai" class="divine-loading">
          <div class="loading-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
            <div class="loading-center">
              <BrandLogo />
            </div>
          </div>
          <div class="loading-text">
            <span class="text-main">解读中</span>
            <span class="text-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        </div>

        <!-- 综合得分 -->
        <div class="score-revelation" v-if="data.ai?.score">
          <div class="score-container">
            <div class="score-bg-pattern"></div>
            <div class="score-rings">
              <svg viewBox="0 0 120 120" class="score-svg">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#DB2777;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#CA8A04;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" class="score-circle-bg"/>
                <circle cx="60" cy="60" r="54" class="score-circle-fill"
                  :style="{ strokeDashoffset: 339 - (339 * data.ai.score / 100) }"/>
              </svg>
            </div>
            <div class="score-value">{{ data.ai.score }}</div>
          </div>
          <div class="score-label">
            <span class="label-line"></span>
            <span class="label-text">综合得分</span>
            <span class="label-line"></span>
          </div>
        </div>

        <!-- 手风琴内容 -->
        <div v-if="data.ai" class="insights-accordion">
          <div v-for="(sec, idx) in sections" :key="sec.key"
               class="insight-item"
               :class="{ expanded: expanded === sec.key }"
               v-show="data.ai[sec.key]"
               :style="{ '--delay': idx * 0.05 + 's' }">
            <div class="insight-header" @click="toggle(sec.key)">
              <div class="header-left">
                <span class="header-icon">{{ getSectionIcon(sec.key) }}</span>
                <span class="header-title">{{ sec.label }}</span>
              </div>
              <div class="header-right">
                <span class="expand-indicator">
                  <span class="indicator-line line-1"></span>
                  <span class="indicator-line line-2"></span>
                </span>
              </div>
            </div>
            <div class="insight-body" v-if="expanded === sec.key">
              <div class="body-content">{{ data.ai[sec.key] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 改运建议 -->
      <div class="card" v-if="data.ai?.advice">
        <h3 class="card-title">改运建议</h3>
        <div class="advice-list">
          <div class="advice-row"><span class="advice-label">幸运色</span><span class="advice-value">{{ fmt(data.ai.advice.luckyColor) }}</span></div>
          <div class="advice-row"><span class="advice-label">幸运数字</span><span class="advice-value">{{ fmt(data.ai.advice.luckyNumber) }}</span></div>
          <div class="advice-row"><span class="advice-label">吉利方位</span><span class="advice-value">{{ data.ai.advice.luckyDirection }}</span></div>
          <div class="advice-row"><span class="advice-label">开运元素</span><span class="advice-value">{{ data.ai.advice.luckyElement }}</span></div>
          <div class="advice-row" v-if="data.ai.advice.suitable"><span class="advice-label">宜</span><span class="advice-value long">{{ fmt(data.ai.advice.suitable) }}</span></div>
          <div class="advice-row" v-if="data.ai.advice.avoid"><span class="advice-label">忌</span><span class="advice-value long">{{ fmt(data.ai.advice.avoid) }}</span></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-share" @click="share">分享</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>

      <!-- 海报弹窗 -->
      <BaziPoster v-model="showPoster" :data="data" :params="params" />
    </template>
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import BaziPoster from '@/components/BaziPoster.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDivinationStore } from '../stores/divination'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const route = useRoute()
const router = useRouter()
const store = useDivinationStore()
const loading = ref(false)
const expanded = ref<string>('mingju')
const aiDepth = ref<'simple' | 'normal' | 'pro'>('normal')
const showPoster = ref(false)
const showDepthPicker = ref(false)

const depthOptions = [
  { value: 'simple', name: '简明', desc: '快速判断，约 5 秒', icon: '⚡' },
  { value: 'normal', name: '标准', desc: '详细分析，约 10 秒', icon: '📊' },
  { value: 'pro', name: '专业', desc: '深度解读 + 过往验证，约 20 秒', icon: '🎯' },
]

const data = computed(() => store.current)
const params = computed(() => store.inputParams)

const birthDisplay = computed(() => {
  if (!params.value) return '—'
  const cal = params.value.calendar === '农历' ? '农历' : '公历'
  return `${params.value.birthday} ${params.value.hour}时（${cal}）`
})

const pillars = computed(() => {
  if (!data.value?.bazi?.siZhu) return []
  const s = data.value.bazi.siZhu
  return [
    { label: '年柱', ...s.year },
    { label: '月柱', ...s.month },
    { label: '日柱', ...s.day },
    { label: '时柱', ...s.hour },
  ]
})

const wuxingList = computed(() => {
  if (!data.value?.bazi?.wuXingCount) return []
  const w = data.value.bazi.wuXingCount
  const total = Object.values(w).reduce((a: number, b: number) => a + b, 0) || 1
  return [
    { label: '金', count: w['金'] ?? 0, color: '#d4a843', percent: Math.round(((w['金'] ?? 0) / total) * 100) },
    { label: '木', count: w['木'] ?? 0, color: '#5b9a5b', percent: Math.round(((w['木'] ?? 0) / total) * 100) },
    { label: '水', count: w['水'] ?? 0, color: '#4a8db7', percent: Math.round(((w['水'] ?? 0) / total) * 100) },
    { label: '火', count: w['火'] ?? 0, color: '#c75050', percent: Math.round(((w['火'] ?? 0) / total) * 100) },
    { label: '土', count: w['土'] ?? 0, color: '#8b6b4a', percent: Math.round(((w['土'] ?? 0) / total) * 100) },
  ]
})

const wuxingStrong = computed(() => {
  if (!data.value?.bazi?.wuXingCount) return []
  const w = data.value.bazi.wuXingCount
  const total = Object.values(w).reduce((a: number, b: number) => a + b, 0) || 1
  return Object.entries(w).filter(([, c]) => (c as number) / total > 0.3).map(([k]) => k)
})

const wuxingWeak = computed(() => {
  if (!data.value?.bazi?.wuXingCount) return []
  const w = data.value.bazi.wuXingCount
  const lack = data.value.bazi.wuXingLack || []
  return Object.entries(w).filter(([k, c]) => (c as number) === 1 && !lack.includes(k)).map(([k]) => k)
})

function isDaYunCurrent(dy: any): boolean {
  const birthYear = params.value?.birthday ? parseInt(params.value.birthday) : 0
  if (!birthYear) return false
  const age = new Date().getFullYear() - birthYear
  return age >= dy.startAge && age <= dy.endAge
}

const shengKeMap: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const keMap: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

const wuxingEffects = computed(() => {
  const bazi = data.value?.bazi
  if (!bazi?.wuXingCount || !bazi?.riZhuWuXing) return []
  const w = bazi.wuXingCount as Record<string, number>
  const me = bazi.riZhuWuXing
  const total = Object.values(w).reduce((a, b) => a + b, 0) || 1
  const effects: { icon: string; text: string }[] = []

  // 日主自身强弱
  const meRatio = (w[me] ?? 0) / total
  if (meRatio > 0.3) effects.push({ icon: '💪', text: `${me}旺身强，主观意识强，行动力足，但易固执己见` })
  else if (meRatio < 0.15) effects.push({ icon: '🌙', text: `${me}弱身柔，性情温和善变通，但易受外界影响、缺乏主见` })

  // 生我者（印星）
  const shengWo = Object.entries(shengKeMap).find(([, v]) => v === me)?.[0] || ''
  if (shengWo && (w[shengWo] ?? 0) >= 3) effects.push({ icon: '📚', text: `${shengWo}生${me}，印星旺，利学业考试、贵人扶持，但过旺则依赖心重` })
  if (shengWo && (w[shengWo] ?? 0) === 0) effects.push({ icon: '🔕', text: `缺${shengWo}（印星），少长辈庇荫，凡事需靠自己打拼` })

  // 我生者（食伤）
  const woSheng = shengKeMap[me] || ''
  if (woSheng && (w[woSheng] ?? 0) >= 3) effects.push({ icon: '🎨', text: `${me}生${woSheng}，食伤旺，才华横溢、口才佳，但易想多做少、耗泄精力` })
  if (woSheng && (w[woSheng] ?? 0) === 0) effects.push({ icon: '🤐', text: `缺${woSheng}（食伤），表达欲低，不善言辞，但做事踏实专注` })

  // 克我者（官杀）
  const keWo = Object.entries(keMap).find(([, v]) => v === me)?.[0] || ''
  if (keWo && (w[keWo] ?? 0) >= 3) effects.push({ icon: '⚖️', text: `${keWo}克${me}，官杀旺，压力大、约束多，但利仕途管理，宜学会释压` })
  if (keWo && (w[keWo] ?? 0) === 0) effects.push({ icon: '🦅', text: `缺${keWo}（官杀），自由散漫不受拘束，但缺少上进压力和纪律性` })

  // 我克者（财星）
  const woKe = keMap[me] || ''
  if (woKe && (w[woKe] ?? 0) >= 3) effects.push({ icon: '💰', text: `${me}克${woKe}，财星旺，求财机会多，但身弱难担财，反主辛劳` })
  if (woKe && (w[woKe] ?? 0) === 0) effects.push({ icon: '🍃', text: `缺${woKe}（财星），对钱财看淡，不善理财，宜培养财商意识` })

  // 五行全缺
  if ((bazi.wuXingLack?.length ?? 0) === 0 && effects.length < 2) {
    effects.push({ icon: '<BrandLogo />', text: '五行俱全，命局平衡，适应力强，一生少大起大落' })
  }

  return effects
})

const sections = [
  { key: 'mingju', label: '命局总论' },
  { key: 'xingge', label: '性格分析' },
  { key: 'shiye', label: '事业分析' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'ganqing', label: '感情分析' },
  { key: 'jiankang', label: '健康分析' },
  { key: 'liunian', label: '流年分析' },
  { key: 'yanzheng', label: '过往验证' },
]

function getSectionIcon(key: string): string {
  const icons: Record<string, string> = {
    mingju: '☰',
    xingge: '☲',
    shiye: '☳',
    caiyun: '☴',
    ganqing: '☵',
    jiankang: '☶',
    liunian: '☷',
    yanzheng: '☱',
  }
  return icons[key] || '☯'
}

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

function fmt(val: any): string {
  if (Array.isArray(val)) return val.join('、')
  return String(val ?? '')
}

function share() {
  showPoster.value = true
}

function selectDepth(depth: 'simple' | 'normal' | 'pro') {
  aiDepth.value = depth
  showDepthPicker.value = false
  triggerAi()
}

function getDepthLabel(depth: 'simple' | 'normal' | 'pro'): string {
  const labels = {
    simple: '简明版',
    normal: '标准版',
    pro: '专业版'
  }
  return labels[depth] || '标准版'
}

function triggerAi() {
  if (store.current) {
    // 清空旧的 AI 解读内容，以便显示加载状态
    if (store.current.ai) {
      store.current = { ...store.current, ai: null }
    }

    const p = store.inputParams
    // 从 input_params 中获取完整的出生信息
    const inputParams = store.current.input_params || {}

    store.fetchAi('bazi', {
      bazi: store.current.bazi,
      name: inputParams.name || p?.name,
      gender: inputParams.gender || (p?.gender === '男' ? 1 : 2),
      birthYear: inputParams.birthYear,
      birthMonth: inputParams.birthMonth,
      birthDay: inputParams.birthDay,
      birthHour: inputParams.birthHour,
    }, {
      question: inputParams.question || p?.question,
      depth: aiDepth.value, // 传递深度参数
    }, store.current.id)
  }
}

onMounted(async () => {
  const id = route.params.id as string
  if (!store.current || store.current.id !== id) {
    loading.value = true
    try {
      await store.getResult(id)
      // 从后端返回的数据中读取深度信息
      if (store.current?.ai?.depth) {
        aiDepth.value = store.current.ai.depth
      }
    } catch {
      router.replace('/')
      return
    } finally {
      loading.value = false
    }
  } else {
    // 如果数据已经存在，也要读取深度信息
    if (store.current?.ai?.depth) {
      aiDepth.value = store.current.ai.depth
    }
  }
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
.ai-score-section { display: flex; flex-direction: column; align-items: center; padding: 16px 0 20px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
.ai-score-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.taiji-bg {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 72px; height: 72px; border-radius: 50%; opacity: 0.3;
  background:
    radial-gradient(circle at 50% 25%, #DB2777 12%, transparent 12.5%),
    radial-gradient(circle at 50% 75%, var(--bg-primary) 12%, transparent 12.5%),
    radial-gradient(circle at 50% 25%, var(--bg-primary) 25%, transparent 25.5%),
    radial-gradient(circle at 50% 75%, #DB2777 25%, transparent 25.5%),
    linear-gradient(to right, #DB2777 50%, var(--bg-primary) 50%);
  animation: taiji-spin 30s linear infinite;
}
@keyframes taiji-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.ai-score { font-size: 38px; font-weight: 600; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; font-variant-numeric: tabular-nums; position: relative; z-index: 1; }
.ai-score-label { font-size: 12px; color: var(--text-secondary); margin-top: 6px; letter-spacing: 2px; }
.card { margin: 0 20px 16px; padding: 20px; background: var(--bg-secondary); border-radius: var(--radius); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.user-info { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-label { color: var(--text-secondary); white-space: nowrap; }
.info-value { color: var(--text-primary); text-align: right; }
.bazi-text { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px; }

/* 四柱排盘 - 增强版样式 */
.bazi-card-enhanced {
  margin: 0 16px 24px;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.03) 0%, rgba(202, 138, 4, 0.03) 100%);
  border-radius: 16px;
  border: 1px solid rgba(219, 39, 119, 0.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.bazi-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(219, 39, 119, 0.15);
}

.bazi-title {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.bazi-subtitle {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.bazi-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.bazi-col-enhanced {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.bazi-col-enhanced.is-rizhu {
  border: 2px solid rgba(219, 39, 119, 0.5);
  background: linear-gradient(180deg, rgba(219, 39, 119, 0.08) 0%, var(--bg-primary) 100%);
  box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.1);
}

.pillar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.pillar-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.pillar-shishen {
  font-size: 10px;
  color: #DB2777;
  font-weight: 500;
  padding: 2px 6px;
  background: rgba(219, 39, 119, 0.1);
  border-radius: 4px;
}

.pillar-shishen.is-master {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  color: #fff;
  font-weight: 600;
}

.pillar-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  gap: 6px;
}

.pillar-ganzhi {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pillar-ganzhi .gan,
.pillar-ganzhi .zhi {
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.pillar-wuxing {
  font-size: 10px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.pillar-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  padding: 3px 0;
}

.detail-key {
  color: var(--text-tertiary);
  font-weight: 400;
}

.detail-val {
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.detail-val.highlight-gold {
  color: #CA8A04;
  font-weight: 600;
}

.detail-val.highlight-blue {
  color: #4a8db7;
  font-weight: 600;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .bazi-card-enhanced {
    margin: 0 10px 20px;
    padding: 14px 8px;
  }

  .bazi-header {
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .bazi-title {
    font-size: 15px;
  }

  .bazi-subtitle {
    font-size: 10px;
  }

  .bazi-grid-enhanced {
    gap: 5px;
  }

  .bazi-col-enhanced {
    border-width: 1px;
  }

  .bazi-col-enhanced.is-rizhu {
    border-width: 1.5px;
    box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.1);
  }

  .pillar-header {
    padding: 5px 6px;
  }

  .pillar-label {
    font-size: 9px;
  }

  .pillar-shishen {
    font-size: 8px;
    padding: 1px 4px;
  }

  .pillar-main {
    padding: 8px 4px;
    gap: 3px;
  }

  .pillar-ganzhi {
    gap: 2px;
  }

  .pillar-ganzhi .gan,
  .pillar-ganzhi .zhi {
    font-size: 20px;
  }

  .pillar-wuxing {
    font-size: 8px;
  }

  .pillar-details {
    padding: 5px 6px;
    gap: 2px;
  }

  .detail-item {
    font-size: 8px;
    padding: 1px 0;
  }

  .detail-key,
  .detail-val {
    font-size: 8px;
  }
}

/* 五行分析 - 增强版样式 */
.wuxing-card-enhanced {
  margin: 0 16px 24px;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(202, 138, 4, 0.03) 0%, rgba(74, 141, 183, 0.03) 100%);
  border-radius: 16px;
  border: 1px solid rgba(202, 138, 4, 0.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.wuxing-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(202, 138, 4, 0.15);
}

.wuxing-title {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #CA8A04 0%, #4a8db7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.wuxing-subtitle {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

/* 五行横向网格 */
.wuxing-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.wuxing-col {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.wuxing-col.is-lack {
  opacity: 0.5;
  border-style: dashed;
}

.wx-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.wx-label {
  font-size: 14px;
  font-weight: 600;
}

.wx-bar-vertical {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: var(--bg-secondary);
}

.wx-count-large {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.wx-status {
  padding: 6px;
  text-align: center;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wx-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.wx-badge.lack {
  background: rgba(199, 80, 80, 0.15);
  color: #c75050;
}

.wx-badge.strong {
  background: rgba(212, 168, 67, 0.15);
  color: #d4a843;
}

.wx-badge.weak {
  background: rgba(74, 141, 183, 0.15);
  color: #4a8db7;
}

.wuxing-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.status-tag {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-tag.lack {
  background: rgba(199, 80, 80, 0.15);
  color: #c75050;
  border: 1px solid rgba(199, 80, 80, 0.3);
}

.status-tag.strong {
  background: rgba(212, 168, 67, 0.15);
  color: #d4a843;
  border: 1px solid rgba(212, 168, 67, 0.3);
}

.status-tag.weak {
  background: rgba(74, 141, 183, 0.15);
  color: #4a8db7;
  border: 1px solid rgba(74, 141, 183, 0.3);
}

.mingjü-core {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border);
  margin-bottom: 16px;
}

.core-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.core-label {
  color: var(--text-tertiary);
  font-weight: 500;
  min-width: 36px;
}

.core-value {
  color: var(--text-primary);
  font-weight: 500;
}

.core-value.highlight {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.core-value.yongshen {
  color: #CA8A04;
  font-weight: 600;
}

.core-value.jishen {
  color: #c75050;
  font-weight: 600;
}

.core-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
}

.core-badge.strong {
  background: rgba(212, 168, 67, 0.15);
  color: #d4a843;
  border: 1px solid rgba(212, 168, 67, 0.3);
}

.core-badge.weak {
  background: rgba(74, 141, 183, 0.15);
  color: #4a8db7;
  border: 1px solid rgba(74, 141, 183, 0.3);
}

.core-divider {
  color: var(--text-tertiary);
  margin: 0 4px;
}

.wuxing-effects-enhanced {
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.effects-title {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.effect-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.effect-icon {
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
}

.effect-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .wuxing-card-enhanced {
    margin: 0 10px 20px;
    padding: 14px 8px;
  }

  .wuxing-header {
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .wuxing-title {
    font-size: 15px;
  }

  .wuxing-subtitle {
    font-size: 10px;
  }

  .wuxing-grid {
    gap: 6px;
    margin-bottom: 14px;
  }

  .wx-header {
    padding: 6px 8px;
  }

  .wx-label {
    font-size: 12px;
  }

  .wx-bar-vertical {
    height: 60px;
    padding: 6px;
  }

  .wx-count-large {
    font-size: 28px;
  }

  .wx-status {
    padding: 5px;
    min-height: 24px;
  }

  .wx-badge {
    font-size: 9px;
    padding: 2px 6px;
  }

  .wuxing-status {
    gap: 6px;
    margin-bottom: 14px;
    padding-bottom: 14px;
  }

  .status-tag {
    font-size: 10px;
    padding: 3px 10px;
  }

  .mingjü-core {
    gap: 8px;
    padding: 12px 10px;
    margin-bottom: 14px;
  }

  .core-row {
    gap: 6px;
    font-size: 12px;
  }

  .core-label {
    min-width: 32px;
    font-size: 11px;
  }

  .core-value {
    font-size: 12px;
  }

  .core-badge {
    padding: 2px 6px;
    font-size: 10px;
  }

  .wuxing-effects-enhanced {
    padding-top: 14px;
  }

  .effects-title {
    font-size: 11px;
    margin-bottom: 10px;
  }

  .effect-item {
    gap: 8px;
    padding: 8px;
    margin-bottom: 6px;
  }

  .effect-icon {
    font-size: 14px;
  }

  .effect-text {
    font-size: 11px;
    line-height: 1.5;
  }
}
.wuxing-bars { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.wuxing-bar-item { display: flex; align-items: center; gap: 8px; }
.wuxing-bar-label { font-size: 13px; font-weight: 500; width: 20px; text-align: center; }
.wuxing-bar-track { flex: 1; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
.wuxing-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; min-width: 2px; }
.wuxing-bar-count { font-size: 12px; color: var(--text-secondary); width: 16px; text-align: right; }
.wuxing-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.wx-tag { font-size: 11px; padding: 3px 10px; border-radius: 12px; }
.wx-tag.lack { background: rgba(199,80,80,0.15); color: #c75050; }
.wx-tag.strong { background: rgba(212,168,67,0.15); color: #d4a843; }
.wx-tag.weak { background: rgba(74,141,183,0.15); color: #4a8db7; }
.wuxing-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); }
.wuxing-effects { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.wx-effect-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; line-height: 1.6; color: var(--text-secondary); }
.wx-effect-icon { flex-shrink: 0; font-size: 14px; }
.dayun-timeline { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
.dayun-item { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 56px; padding: 8px 6px; background: var(--bg-primary); border-radius: 8px; flex-shrink: 0; }
.dayun-item.current { border: 1px solid rgba(219, 39, 119, 0.5); background: rgba(219, 39, 119, 0.1); }
.dayun-age { font-size: 10px; color: var(--text-tertiary); }
.dayun-gz { font-size: 15px; color: var(--text-primary); font-weight: 400; }
.dayun-wx { font-size: 10px; color: var(--text-secondary); }
.accordion { display: flex; flex-direction: column; }
.acc-item { border-bottom: 1px solid var(--border); }
.acc-item:last-child { border-bottom: none; }
.acc-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: var(--text-primary); cursor: pointer; }
.acc-arrow { font-size: 16px; color: var(--text-secondary); transition: transform 0.2s; }
.acc-arrow.open { transform: rotate(90deg); }
.acc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; padding-bottom: 14px; }
.advice-list { display: flex; flex-direction: column; gap: 12px; }
.advice-row { display: flex; font-size: 13px; gap: 12px; }
.advice-label { color: var(--text-secondary); white-space: nowrap; }
.advice-value { color: var(--text-primary); text-align: right; flex: 1; }
.advice-value.long { text-align: left; font-size: 12px; line-height: 1.6; }
.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-share { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-share:active { opacity: 0.85; }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: var(--bg-secondary); }
.wuxing-bars { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.wuxing-bar-item { display: flex; align-items: center; gap: 8px; }
.wuxing-bar-label { font-size: 13px; font-weight: 500; width: 18px; text-align: center; }
.wuxing-bar-track { flex: 1; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
.wuxing-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; min-width: 2px; }
.wuxing-bar-count { font-size: 12px; color: var(--text-secondary); width: 16px; text-align: right; }
.wuxing-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.wx-tag { font-size: 11px; padding: 3px 8px; border-radius: 4px; }
.wx-tag.lack { background: rgba(199, 80, 80, 0.12); color: #c75050; }
.wx-tag.strong { background: rgba(219, 39, 119, 0.12); color: #DB2777; }
.wx-tag.weak { background: rgba(74, 141, 183, 0.12); color: #4a8db7; }
.dayun-timeline { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
.dayun-item { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 12px; background: var(--bg-primary); border-radius: 8px; min-width: 64px; }
.dayun-item.current { border: 1px solid rgba(219, 39, 119, 0.5); background: rgba(219, 39, 119, 0.1); }
.dayun-age { font-size: 10px; color: var(--text-tertiary); }
.dayun-gz { font-size: 15px; color: var(--text-primary); font-weight: 500; }
.dayun-wx { font-size: 10px; color: var(--text-secondary); }
.ai-trigger { text-align: center; padding: 20px 0; }
.btn-ai { height: 44px; padding: 0 32px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-ai:active { opacity: 0.85; transform: translateY(1px); }
.ai-loading { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.ai-spinner { display: inline-flex; align-items: center; justify-content: center; font-size: 24px; animation: spin 2s linear infinite; margin-right: 8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ========================================
   AI 解读模块 - 简洁版
   ======================================== */

/* 主卡片容器 */
.ai-divination-card {
  position: relative;
  margin: 0 16px 24px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border);
}

/* 卡片标题 */
.ai-card-header {
  margin-bottom: 20px;
}

.ai-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 深度标签 */
.depth-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.depth-badge.depth-simple {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.depth-badge.depth-normal {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.depth-badge.depth-pro {
  background: rgba(219, 39, 119, 0.1);
  color: #db2777;
  border: 1px solid rgba(219, 39, 119, 0.2);
}

/* 深度选择弹窗 */
.depth-picker-content {
  padding: 16px;
}

.depth-picker-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.depth-picker-item:last-child {
  margin-bottom: 0;
}

.depth-picker-item:active {
  background: var(--bg-primary);
  border-color: #DB2777;
  transform: scale(0.98);
}

.depth-item-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.depth-item-info {
  flex: 1;
}

.depth-item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.depth-item-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 触发按钮 */
.trigger-section-compact {
  text-align: center;
  margin: 20px 0;
}

.btn-divine-compact {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.btn-divine-compact:active {
  opacity: 0.9;
  transform: translateY(1px);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .depth-picker-item {
    padding: 14px;
  }

  .depth-item-icon {
    font-size: 28px;
  }

  .depth-item-name {
    font-size: 15px;
  }

  .depth-item-desc {
    font-size: 12px;
  }
}

/* 旧样式 - 保留以防需要 */
/* 深度选择器 - 紧凑版 */
.depth-selector-compact {
  margin-bottom: 20px;
}

.depth-options-compact :deep(.van-radio-group) {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 16px;
  height: 50px;
}

.depth-options-compact :deep(.van-radio) {
  flex: 1;
  margin: 0;
}

.depth-option {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10px 16px;
  background: var(--bg-primary);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.depth-option.selected {
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%);
  border-color: #DB2777;
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.2);
}

.option-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

/* 触发按钮 - 紧凑版 */
.trigger-section-compact {
  text-align: center;
}

.btn-divine-compact {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.btn-divine-compact:active {
  opacity: 0.9;
  transform: translateY(1px);
}

/* 加载状态 */
.divine-loading {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.loading-rings {
  position: relative;
  width: 100px;
  height: 100px;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: ring-rotate 3s linear infinite;
}

.ring-1 {
  border-top-color: #DB2777;
  animation-duration: 2s;
}

.ring-2 {
  border-right-color: #CA8A04;
  animation-duration: 3s;
  animation-direction: reverse;
}

.ring-3 {
  border-bottom-color: rgba(219, 39, 119, 0.5);
  animation-duration: 4s;
}

@keyframes ring-rotate {
  to { transform: rotate(360deg); }
}

.loading-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  animation: pulse-scale 2s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.loading-text {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-main {
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.text-dots {
  display: flex;
  gap: 2px;
}

.text-dots span {
  animation: dot-blink 1.4s infinite;
}

.text-dots span:nth-child(2) { animation-delay: 0.2s; }
.text-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-blink {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
}

/* 综合得分 */
.score-revelation {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  margin: 20px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.score-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.score-bg-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(219, 39, 119, 0.05) 0%, transparent 70%);
}

.score-rings {
  position: absolute;
  inset: 10px;
}

.score-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-circle-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 3;
}

.score-circle-fill {
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 339;
  stroke-dashoffset: 339;
  transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: score-appear 1s ease-out;
}

@keyframes score-appear {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.score-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label-line {
  width: 30px;
  height: 1px;
  background: var(--border);
}

.label-text {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

/* 手风琴内容 */
.insights-accordion {
  margin-top: 20px;
}

.insight-item {
  margin-bottom: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: item-fade-in 0.4s ease-out backwards;
  animation-delay: var(--delay);
}

@keyframes item-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.insight-item.expanded {
  border-color: rgba(219, 39, 119, 0.3);
  box-shadow: 0 2px 12px rgba(219, 39, 119, 0.1);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.insight-header:active {
  background: var(--bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.expand-indicator {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-line {
  position: absolute;
  width: 10px;
  height: 2px;
  background: var(--text-secondary);
  transition: all 0.3s ease;
}

.line-1 {
  transform: rotate(0deg);
}

.line-2 {
  transform: rotate(90deg);
}

.insight-item.expanded .line-1 {
  transform: rotate(180deg);
  opacity: 0;
}

.insight-item.expanded .line-2 {
  transform: rotate(180deg);
}

.insight-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.insight-item.expanded .insight-body {
  max-height: 2000px;
}

.body-content {
  padding: 0 16px 16px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
  white-space: pre-wrap;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .ai-divination-card {
    margin: 0 12px 20px;
    padding: 16px;
  }

  .ai-card-title {
    font-size: 15px;
  }

  .depth-option {
    padding: 9px 12px;
  }

  .option-name {
    font-size: 13px;
  }

  .btn-divine-compact {
    padding: 11px 20px;
    font-size: 14px;
  }

  .score-container {
    width: 100px;
    height: 100px;
  }

  .score-value {
    font-size: 36px;
  }
}

/* 触发按钮 */
.trigger-section {
  text-align: center;
  margin: 28px 0;
}

.trigger-section-inline {
  text-align: center;
  margin-top: 24px;
}

.btn-divine {
  position: relative;
  padding: 14px 48px;
  background: transparent;
  border: 2px solid;
  border-image: linear-gradient(135deg, #DB2777, #CA8A04) 1;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s ease;
}

.btn-bg-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #DB2777, #CA8A04);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.btn-divine:active .btn-bg-effect {
  opacity: 1;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  position: relative;
  z-index: 1;
  margin-left: 8px;
  display: inline-block;
  transition: transform 0.4s ease;
}

.btn-divine:active .btn-icon {
  transform: translateX(4px);
}

/* 加载状态 */
.divine-loading {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
}

.loading-rings {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: ring-rotate 3s linear infinite;
}

.ring-1 {
  border-top-color: #DB2777;
  animation-duration: 2s;
}

.ring-2 {
  border-right-color: #CA8A04;
  animation-duration: 3s;
  animation-direction: reverse;
}

.ring-3 {
  border-bottom-color: rgba(219, 39, 119, 0.5);
  animation-duration: 4s;
}

@keyframes ring-rotate {
  to { transform: rotate(360deg); }
}

.loading-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  animation: pulse-scale 2s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.loading-text {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-main {
  font-size: 15px;
  color: rgba(202, 138, 4, 0.9);
  letter-spacing: 2px;
}

.text-dots {
  display: flex;
  gap: 2px;
}

.text-dots span {
  animation: dot-blink 1.4s infinite;
}

.text-dots span:nth-child(2) { animation-delay: 0.2s; }
.text-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-blink {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
}

.loading-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 12px;
  color: rgba(202, 138, 4, 0.6);
  animation: particle-orbit 8s linear infinite;
  animation-delay: calc(var(--i) * -0.666s);
}

@keyframes particle-orbit {
  0% {
    transform: rotate(0deg) translateX(80px) rotate(0deg);
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) translateX(80px) rotate(-360deg);
    opacity: 0;
  }
}

/* 综合得分 */
.score-revelation {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  margin: 24px 0;
  border-top: 1px solid rgba(202, 138, 4, 0.2);
  border-bottom: 1px solid rgba(202, 138, 4, 0.2);
}

.score-container {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
}

.score-bg-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(219, 39, 119, 0.1) 0%, transparent 70%);
  animation: pulse-bg 3s ease-in-out infinite;
}

@keyframes pulse-bg {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}

.score-rings {
  position: absolute;
  inset: 10px;
}

.score-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-circle-bg {
  fill: none;
  stroke: rgba(202, 138, 4, 0.1);
  stroke-width: 3;
}

.score-circle-fill {
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 339;
  stroke-dashoffset: 339;
  transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 8px rgba(219, 39, 119, 0.6));
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 12px rgba(219, 39, 119, 0.4));
  animation: score-appear 1s ease-out;
}

@keyframes score-appear {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.score-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(202, 138, 4, 0.6), transparent);
}

.label-text {
  font-size: 13px;
  color: rgba(202, 138, 4, 0.9);
  letter-spacing: 3px;
  font-weight: 500;
}

/* 手风琴内容 */
.insights-accordion {
  margin-top: 24px;
}

.insight-item {
  margin-bottom: 12px;
  background: rgba(30, 30, 40, 0.4);
  border: 1px solid rgba(202, 138, 4, 0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s ease;
  animation: item-fade-in 0.5s ease-out backwards;
  animation-delay: var(--delay);
}

@keyframes item-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.insight-item.expanded {
  border-color: rgba(219, 39, 119, 0.4);
  box-shadow: 0 4px 16px rgba(219, 39, 119, 0.2);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.insight-header:active {
  background: rgba(40, 35, 50, 0.6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 18px;
  color: rgba(202, 138, 4, 0.8);
  transition: transform 0.4s ease;
}

.insight-item.expanded .header-icon {
  transform: scale(1.2);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.expand-indicator {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-line {
  position: absolute;
  width: 12px;
  height: 2px;
  background: rgba(202, 138, 4, 0.8);
  transition: all 0.4s ease;
}

.line-1 {
  transform: rotate(0deg);
}

.line-2 {
  transform: rotate(90deg);
}

.insight-item.expanded .line-1 {
  transform: rotate(180deg);
  opacity: 0;
}

.insight-item.expanded .line-2 {
  transform: rotate(180deg);
}

.insight-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.insight-item.expanded .insight-body {
  max-height: 2000px;
}

.body-content {
  padding: 0 18px 20px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.3px;
  white-space: pre-wrap;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .ai-divination-card {
    margin: 0 12px 20px;
    padding: 20px 16px;
  }

  .ai-card-title {
    font-size: 18px;
    letter-spacing: 3px;
  }

  .depth-selector-mystical {
    padding: 0 2px;
  }

  .depth-options :deep(.van-radio-group) {
    gap: 6px;
  }

  .depth-card {
    padding: 16px 8px 12px;
    min-height: 105px;
  }

  .depth-symbol {
    font-size: 24px;
    margin-bottom: 6px;
  }

  .depth-title {
    font-size: 13px;
  }

  .depth-subtitle {
    font-size: 10px;
  }

  .depth-time {
    font-size: 9px;
  }

  .btn-divine {
    padding: 12px 36px;
    font-size: 14px;
  }

  .score-container {
    width: 120px;
    height: 120px;
  }

  .score-value {
    font-size: 36px;
  }
}
</style>

