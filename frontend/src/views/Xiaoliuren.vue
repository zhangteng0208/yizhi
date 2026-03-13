<template>
  <div class="page">
    <van-nav-bar
      title="小六壬"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>所问之事</label>
        <input v-model="form.question" placeholder="请输入想问的事情" class="input" />
      </div>

      <!-- 起卦方式切换 -->
      <div class="mode-tabs">
        <span class="mode-tab" :class="{ active: mode === 'traditional' }" @click="mode = 'traditional'">传统起卦</span>
        <span class="mode-tab" :class="{ active: mode === 'custom' }" @click="mode = 'custom'">自定义起卦</span>
      </div>

      <!-- 传统起卦 -->
      <template v-if="mode === 'traditional'">
      <div class="field">
        <label>农历月份</label>
        <select v-model="form.lunarMonth" class="input">
          <option value="" disabled>请选择</option>
          <option v-for="m in 12" :key="m" :value="m">{{ lunarMonths[m - 1] }}</option>
        </select>
      </div>
      <div class="field">
        <label>农历日</label>
        <select v-model="form.lunarDay" class="input">
          <option value="" disabled>请选择</option>
          <option v-for="d in 30" :key="d" :value="d">{{ lunarDays[d - 1] }}</option>
        </select>
      </div>
      <div class="field">
        <label>时辰</label>
        <select v-model="form.shichen" class="input">
          <option value="" disabled>请选择</option>
          <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>
      </template>

      <!-- 自定义起卦 -->
      <template v-if="mode === 'custom'">
      <div class="field">
        <label>输入三个数字（1-6），分别对应三宫六神</label>
        <div class="custom-nums">
          <input v-model.number="customNums[0]" type="number" min="1" max="6" placeholder="第一数" class="input num-input" />
          <input v-model.number="customNums[1]" type="number" min="1" max="6" placeholder="第二数" class="input num-input" />
          <input v-model.number="customNums[2]" type="number" min="1" max="6" placeholder="第三数" class="input num-input" />
        </div>
        <button class="btn-random" @click="randomNums">随机生成</button>
      </div>
      </template>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">掐指一算</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 吉凶总断 -->
      <div class="card jixiong-card">
        <div class="jixiong-badge" :class="jixiongClass">{{ result.jixiong }}</div>
        <div class="jixiong-question">{{ result.question }}</div>
        <div class="jixiong-time">{{ result.lunarMonthName }}{{ result.lunarDayName }} {{ result.shichenName }}</div>
      </div>

      <!-- 三宫六神 -->
      <div class="card">
        <h3 class="card-title">三宫六神</h3>
        <div class="shen-grid">
          <div class="shen-cell" v-for="s in shenList" :key="s.label">
            <div class="shen-label">{{ s.label }}</div>
            <div class="shen-name" :class="shenClass(s.data.name)">{{ s.data.name }}</div>
            <div class="shen-meta">{{ s.data.wuxing }} · {{ s.data.direction }}</div>
          </div>
        </div>
      </div>

      <!-- 六神详解 -->
      <div class="card">
        <h3 class="card-title">六神详解</h3>
        <div class="shen-detail" v-for="s in shenList" :key="'d' + s.label">
          <div class="shen-detail-header">
            <span class="shen-detail-label">{{ s.label }}</span>
            <span class="shen-detail-name" :class="shenClass(s.data.name)">{{ s.data.name }}</span>
          </div>
          <div class="shen-detail-desc">{{ s.data.desc }}</div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">卦象解读</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai && isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="displayedContent[sec.key]">
            <div class="acc-header" @click="toggle(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
            </div>
            <div v-if="expanded === sec.key" class="acc-body">{{ displayedContent[sec.key] || '' }}</div>
          </div>
          <div class="acc-item" v-if="displayedContent.jianyi">
            <div class="acc-header" @click="toggle('jianyi')">
              <span>行动建议</span>
              <span class="acc-arrow" :class="{ open: expanded === 'jianyi' }">›</span>
            </div>
            <div v-if="expanded === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in displayedContent.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
        <div v-if="result.ai && !isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="result.ai[sec.key]">
            <div class="acc-header" @click="toggle(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
            </div>
            <div v-if="expanded === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
          <div class="acc-item" v-if="result.ai.jianyi">
            <div class="acc-header" @click="toggle('jianyi')">
              <span>行动建议</span>
              <span class="acc-arrow" :class="{ open: expanded === 'jianyi' }">›</span>
            </div>
            <div v-if="expanded === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in result.ai.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">重新起卦</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="掐指速算中..." />
  </div>
</template>
<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import { Solar } from 'lunar-javascript'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expanded = ref<string>('zonglun')
const mode = ref<'traditional' | 'custom'>('traditional')
const customNums = reactive([0, 0, 0])
const isTyping = ref(false)
const displayedContent = ref<any>({})

// 默认取当前农历月、日、时辰
const now = new Date()
const lunar = Solar.fromDate(now).getLunar()
const defaultMonth = lunar.getMonth()
const defaultDay = lunar.getDay()
const defaultShichen = Math.floor(((now.getHours() + 1) % 24) / 2)

const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

const shichenList = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 1, label: '丑时 (01:00-03:00)' },
  { value: 2, label: '寅时 (03:00-05:00)' },
  { value: 3, label: '卯时 (05:00-07:00)' },
  { value: 4, label: '辰时 (07:00-09:00)' },
  { value: 5, label: '巳时 (09:00-11:00)' },
  { value: 6, label: '午时 (11:00-13:00)' },
  { value: 7, label: '未时 (13:00-15:00)' },
  { value: 8, label: '申时 (15:00-17:00)' },
  { value: 9, label: '酉时 (17:00-19:00)' },
  { value: 10, label: '戌时 (19:00-21:00)' },
  { value: 11, label: '亥时 (21:00-23:00)' },
]

const form = reactive({
  question: '',
  lunarMonth: defaultMonth,
  lunarDay: defaultDay,
  shichen: defaultShichen,
})

const canSubmit = computed(() => {
  if (!form.question.trim()) return false
  if (mode.value === 'traditional') {
    return form.lunarMonth != null && form.lunarMonth !== '' &&
           form.lunarDay != null && form.lunarDay !== '' &&
           form.shichen != null && form.shichen !== ''
  }
  return customNums.every(n => n >= 1 && n <= 6)
})

function randomNums() {
  for (let i = 0; i < 3; i++) {
    customNums[i] = Math.floor(Math.random() * 6) + 1
  }
}

const shenList = computed(() => {
  if (!result.value) return []
  return [
    { label: '月宫（大势）', data: result.value.monthShen },
    { label: '日宫（过程）', data: result.value.dayShen },
    { label: '时宫（结果）', data: result.value.hourShen },
  ]
})

const jixiongClass = computed(() => {
  if (!result.value) return ''
  const j = result.value.jixiong
  if (j === '大吉') return 'daji'
  if (j === '中吉') return 'zhongji'
  if (j === '小吉') return 'xiaoji'
  return 'xiong'
})

function shenClass(name: string) {
  if (['大安', '速喜', '小吉'].includes(name)) return 'ji'
  return 'xiong'
}

const aiSections = [
  { key: 'zonglun', label: '总论' },
  { key: 'guocheng', label: '过程分析' },
  { key: 'jieguo', label: '结果判断' },
  { key: 'maqianke', label: '马前课速断' },
  { key: 'fangwei', label: '方位建议' },
  { key: 'shiji', label: '时机建议' },
]

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const payload: any = {
      question: form.question.trim(),
      lunarMonth: Number(form.lunarMonth),
      lunarDay: Number(form.lunarDay),
      shichen: Number(form.shichen),
    }
    if (mode.value === 'custom') {
      payload.customNumbers = [...customNums]
    }
    const res: any = await http.post('/divination/xiaoliuren', payload)
    result.value = res.data ?? res
    // 自动调用分析详解
    await fetchAiInterpretation()
  } catch (e) {
    console.error(e)
    return
  } finally {
    loading.value = false
  }
}

async function fetchAiInterpretation() {
  if (!result.value) return
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream('xiaoliuren', result.value, undefined, result.value?.id, {
    onParsed(parsed) {
      result.value = { ...result.value, ai: parsed }
      aiLoading.value = false
      typewriterEffect(parsed)
    },
    onError(fallback) {
      result.value = { ...result.value, ai: fallback }
      aiLoading.value = false
    },
    onDone() { aiLoading.value = false },
  })
}

async function typewriterEffect(content: any) {
  isTyping.value = true
  displayedContent.value = {}

  for (const sec of aiSections) {
    if (content[sec.key]) {
      await typeText(sec.key, content[sec.key])
    }
  }

  if (content.jianyi) {
    displayedContent.value.jianyi = content.jianyi
  }

  isTyping.value = false
}

async function typeText(key: string, text: string) {
  displayedContent.value[key] = ''
  for (let i = 0; i < text.length; i++) {
    displayedContent.value[key] += text[i]
    await new Promise(resolve => setTimeout(resolve, 20))
  }
}

function reset() {
  result.value = null
  form.question = ''
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
select.input { color: var(--text-primary); }
select.input option { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-primary); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
/* 起卦方式切换 */
.mode-tabs { display: flex; gap: 0; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: 8px; padding: 3px; }
.mode-tab { flex: 1; text-align: center; padding: 10px 0; font-size: 13px; color: var(--text-secondary); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.mode-tab.active { background: var(--bg-primary); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; }
/* 自定义数字输入 */
.custom-nums { display: flex; gap: 10px; }
.num-input { flex: 1; text-align: center; padding: 0; }
.btn-random { height: 40px; margin-top: 4px; background: transparent; border: 1px solid rgba(219, 39, 119, 0.5); border-radius: var(--radius); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 13px; letter-spacing: 2px; cursor: pointer; }
.btn-random:active { opacity: 0.7; }
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
/* 吉凶卡片 */
.jixiong-card { text-align: center; padding: 32px 20px; }
.jixiong-badge { display: inline-block; font-size: 20px; font-weight: 600; letter-spacing: 4px; padding: 8px 24px; border-radius: 8px; margin-bottom: 12px; }
.jixiong-badge.daji { color: #e8b849; background: rgba(232, 184, 73, 0.1); }
.jixiong-badge.zhongji { color: #7ec87e; background: rgba(126, 200, 126, 0.1); }
.jixiong-badge.xiaoji { color: var(--text-secondary); background: var(--bg-primary); }
.jixiong-badge.xiong { color: #e06060; background: rgba(224, 96, 96, 0.1); }
.jixiong-question { font-size: 14px; color: var(--text-primary); margin-bottom: 4px; }
.jixiong-time { font-size: 12px; color: var(--text-tertiary); }
/* 三宫六神 */
.shen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.shen-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; background: var(--bg-primary); border-radius: 8px; }
.shen-label { font-size: 11px; color: var(--text-tertiary); }
.shen-name { font-size: 18px; font-weight: 500; }
.shen-name.ji { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.shen-name.xiong { color: #e06060; }
.shen-meta { font-size: 11px; color: var(--text-secondary); }
/* 六神详解 */
.shen-detail { padding: 12px 0; border-bottom: 1px solid var(--border); }
.shen-detail:last-child { border-bottom: none; }
.shen-detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.shen-detail-label { font-size: 12px; color: var(--text-secondary); }
.shen-detail-name { font-size: 14px; font-weight: 500; }
.shen-detail-name.ji { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.shen-detail-name.xiong { color: #e06060; }
.shen-detail-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
/* AI 解读 */
.accordion { display: flex; flex-direction: column; }
.acc-item { border-bottom: 1px solid var(--border); }
.acc-item:last-child { border-bottom: none; }
.acc-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: var(--text-primary); cursor: pointer; }
.acc-arrow { font-size: 16px; color: var(--text-secondary); transition: transform 0.2s; }
.acc-arrow.open { transform: rotate(90deg); }
.acc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; padding-bottom: 14px; }
.jianyi-item { margin-bottom: 6px; }
.ai-trigger { text-align: center; padding: 20px 0; }
.btn-ai { height: 44px; padding: 0 32px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-ai:active { opacity: 0.85; transform: translateY(1px); }
.ai-loading { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.ai-spinner { display: inline-block; font-size: 24px; animation: spin 2s linear infinite; margin-right: 8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
/* 操作按钮 */
.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-again { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }
</style>
