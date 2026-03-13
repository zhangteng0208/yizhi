<template>
  <div class="page">
    <van-nav-bar
      title="择日择吉"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>所办事项</label>
        <select v-model="form.eventType" class="input">
          <option value="" disabled>请选择事项</option>
          <option v-for="e in eventTypes" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>
      <div class="field">
        <label>起始日期</label>
        <input v-model="form.startDate" type="date" class="input" />
      </div>
      <div class="field">
        <label>结束日期</label>
        <input v-model="form.endDate" type="date" class="input" />
      </div>
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">查询吉日</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 概览 -->
      <div class="card summary-card">
        <div class="summary-event">{{ result.eventName }}</div>
        <div class="summary-range">{{ result.startDate }} ~ {{ result.endDate }}</div>
        <div class="summary-count">共找到 <span class="gold">{{ result.bestDays.length }}</span> 个吉日</div>
      </div>

      <!-- 推荐吉日列表 -->
      <div class="card">
        <h3 class="card-title">推荐吉日</h3>
        <div class="day-list">
          <div class="day-item" v-for="d in result.bestDays" :key="d.date" @click="toggleDay(d.date)">
            <div class="day-header">
              <div class="day-left">
                <span class="day-date">{{ d.date.slice(5) }}</span>
                <span class="day-weekday">{{ d.weekday }}</span>
              </div>
              <div class="day-center">
                <span class="day-lunar">{{ d.lunarDate }}</span>
                <span class="day-gz">{{ d.ganzhi }}</span>
              </div>
              <div class="day-right">
                <span class="day-score" :class="scoreClass(d.score)">{{ d.score }}分</span>
                <span class="day-badge" :class="{ huangdao: d.isHuangDao }">{{ d.isHuangDao ? '黄道' : '黑道' }}</span>
              </div>
            </div>
            <div v-if="expandedDay === d.date" class="day-detail">
              <div class="day-tags">
                <span class="day-tag jian">{{ d.jianXing }}日</span>
                <span class="day-tag" v-if="d.jieqi">{{ d.jieqi }}</span>
              </div>
              <div class="day-yi"><span class="label-yi">宜</span> {{ d.yi.slice(0, 8).join(' · ') }}</div>
              <div class="day-ji"><span class="label-ji">忌</span> {{ d.ji.slice(0, 6).join(' · ') }}</div>
              <div class="day-chong">{{ d.chongSha }}</div>
            </div>
          </div>
        </div>
        <div v-if="result.bestDays.length === 0" class="empty">未找到匹配的吉日，建议扩大查询范围</div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">择吉解读</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai && isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="displayedContent[sec.key]">
            <div class="acc-header" @click="toggleAi(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expandedAi === sec.key }">›</span>
            </div>
            <div v-if="expandedAi === sec.key" class="acc-body">{{ displayedContent[sec.key] || '' }}</div>
          </div>
          <div class="acc-item" v-if="displayedContent.jianyi">
            <div class="acc-header" @click="toggleAi('jianyi')">
              <span>行动建议</span>
              <span class="acc-arrow" :class="{ open: expandedAi === 'jianyi' }">›</span>
            </div>
            <div v-if="expandedAi === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in displayedContent.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
        <div v-if="result.ai && !isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="result.ai[sec.key]">
            <div class="acc-header" @click="toggleAi(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expandedAi === sec.key }">›</span>
            </div>
            <div v-if="expandedAi === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
          <div class="acc-item" v-if="result.ai.jianyi">
            <div class="acc-header" @click="toggleAi('jianyi')">
              <span>行动建议</span>
              <span class="acc-arrow" :class="{ open: expandedAi === 'jianyi' }">›</span>
            </div>
            <div v-if="expandedAi === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in result.ai.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">重新查询</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="查询吉日中..." />
  </div>
</template>
<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expandedDay = ref('')
const expandedAi = ref('zonglun')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const eventTypes = [
  { value: 'hunyin', label: '婚嫁' },
  { value: 'banqian', label: '搬家' },
  { value: 'kaizhang', label: '开业' },
  { value: 'zhuangxiu', label: '装修' },
  { value: 'chuxing', label: '出行' },
  { value: 'qiche', label: '提车' },
  { value: 'kaigong', label: '动工' },
  { value: 'lingzheng', label: '领证' },
  { value: 'anzang', label: '安葬' },
  { value: 'jisi', label: '祭祀' },
  { value: 'other', label: '综合择吉' },
]

// 默认查询未来30天
const today = new Date()
const future = new Date(today)
future.setDate(future.getDate() + 30)
const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const form = reactive({
  eventType: '',
  startDate: toDateStr(today),
  endDate: toDateStr(future),
})

const canSubmit = computed(() => form.eventType && form.startDate && form.endDate && form.startDate <= form.endDate)

function scoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

const aiSections = [
  { key: 'zonglun', label: '总论' },
  { key: 'tuijian', label: '推荐日期分析' },
  { key: 'yiji', label: '宜忌详解' },
  { key: 'chongsha', label: '冲煞提醒' },
  { key: 'zhuyi', label: '注意事项' },
]

function toggleDay(date: string) {
  expandedDay.value = expandedDay.value === date ? '' : date
}

function toggleAi(key: string) {
  expandedAi.value = expandedAi.value === key ? '' : key
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/zeji', {
      eventType: form.eventType,
      startDate: form.startDate,
      endDate: form.endDate,
    })
    result.value = res.data ?? res
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
  await fetchAiStream('zeji', result.value, undefined, result.value?.id, {
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
}
</script>
<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
select.input { color: var(--text-primary); }
select.input option { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-primary); }
input[type="date"].input { color: var(--text-primary); }
input[type="date"].input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
/* 概览卡片 */
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.summary-card { text-align: center; padding: 28px 20px; }
.summary-event { font-size: 20px; font-weight: 600; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; margin-bottom: 8px; }
.summary-range { font-size: 12px; color: var(--text-tertiary); margin-bottom: 8px; }
.summary-count { font-size: 14px; color: var(--text-secondary); }
.summary-count .gold { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600; }
/* 吉日列表 */
.day-list { display: flex; flex-direction: column; gap: 8px; }
.day-item { background: var(--bg-primary); border-radius: 8px; padding: 12px; cursor: pointer; }
.day-header { display: flex; align-items: center; justify-content: space-between; }
.day-left { display: flex; flex-direction: column; gap: 2px; min-width: 60px; }
.day-date { font-size: 15px; font-weight: 500; color: var(--text-primary); }
.day-weekday { font-size: 11px; color: var(--text-tertiary); }
.day-center { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.day-lunar { font-size: 13px; color: var(--text-secondary); }
.day-gz { font-size: 11px; color: var(--text-tertiary); }
.day-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.day-score { font-size: 13px; font-weight: 500; }
.day-score.high { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.day-score.mid { color: #7ec87e; }
.day-score.low { color: var(--text-secondary); }
.day-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; color: #e06060; background: rgba(224, 96, 96, 0.1); }
.day-badge.huangdao { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background: rgba(219, 39, 119, 0.1); }
.day-detail { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
.day-tags { display: flex; gap: 6px; margin-bottom: 8px; }
.day-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-secondary); }
.day-tag.jian { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background: rgba(219, 39, 119, 0.1); }
.day-yi, .day-ji { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
.label-yi { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-right: 6px; font-weight: 500; }
.label-ji { color: #e06060; margin-right: 6px; font-weight: 500; }
.day-chong { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }
.empty { text-align: center; font-size: 13px; color: var(--text-tertiary); padding: 20px 0; }
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
