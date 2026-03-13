<template>
  <div class="page">
    <van-nav-bar
      title="合婚配对"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="section-title">男方信息</div>
      <div class="field">
        <label>姓名</label>
        <div class="input-with-icon">
          <input v-model="form.maleName" placeholder="请输入男方姓名" class="input" />
          <ProfilePicker @select="importMale" />
        </div>
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="form.maleBirthDate" type="date" class="input" />
      </div>
      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.maleBirthHour" class="input">
          <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <div class="section-title">女方信息</div>
      <div class="field">
        <label>姓名</label>
        <div class="input-with-icon">
          <input v-model="form.femaleName" placeholder="请输入女方姓名" class="input" />
          <ProfilePicker @select="importFemale" />
        </div>
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="form.femaleBirthDate" type="date" class="input" />
      </div>
      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.femaleBirthHour" class="input">
          <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">开始合婚</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 总评 -->
      <div class="card summary-card">
        <div class="summary-names">{{ result.male.name }} ♡ {{ result.female.name }}</div>
        <div class="summary-score" :class="scoreClass">{{ result.overallScore }}分</div>
        <div class="summary-level">{{ result.overallLevel }}</div>
        <div class="summary-meta">
          <span>{{ result.male.bazi.lunarInfo.shengXiao }} × {{ result.female.bazi.lunarInfo.shengXiao }}</span>
        </div>
      </div>

      <!-- 配对详情 -->
      <div class="card">
        <h3 class="card-title">配对详情</h3>
        <div class="dim-list">
          <div class="dim-item" v-for="dim in dimensionList" :key="dim.name">
            <div class="dim-header">
              <span class="dim-name">{{ dim.name }}</span>
              <span class="dim-score" :class="dimClass(dim.score)">{{ dim.score }}分</span>
            </div>
            <div class="dim-bar"><div class="dim-fill" :class="dimClass(dim.score)" :style="{ width: dim.score + '%' }"></div></div>
            <div class="dim-detail">{{ dim.detail }}</div>
          </div>
        </div>
      </div>

      <!-- 八字对比 -->
      <div class="card">
        <h3 class="card-title">八字对比</h3>
        <div class="bazi-row">
          <span class="bazi-label">男方</span>
          <span class="bazi-value">{{ result.male.bazi.rawBaZi }}</span>
        </div>
        <div class="bazi-row">
          <span class="bazi-label">女方</span>
          <span class="bazi-value">{{ result.female.bazi.rawBaZi }}</span>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">合婚解读</h3>
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
              <span>相处建议</span>
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
              <span>相处建议</span>
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

    <LoadingOverlay :visible="loading" text="合婚分析中..." />
  </div>
</template>
<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expandedAi = ref('zonglun')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const shichenList = [
  { value: '子', label: '子时 (23:00-01:00)' },
  { value: '丑', label: '丑时 (01:00-03:00)' },
  { value: '寅', label: '寅时 (03:00-05:00)' },
  { value: '卯', label: '卯时 (05:00-07:00)' },
  { value: '辰', label: '辰时 (07:00-09:00)' },
  { value: '巳', label: '巳时 (09:00-11:00)' },
  { value: '午', label: '午时 (11:00-13:00)' },
  { value: '未', label: '未时 (13:00-15:00)' },
  { value: '申', label: '申时 (15:00-17:00)' },
  { value: '酉', label: '酉时 (17:00-19:00)' },
  { value: '戌', label: '戌时 (19:00-21:00)' },
  { value: '亥', label: '亥时 (21:00-23:00)' },
]

const form = reactive({
  maleName: '',
  maleBirthDate: '',
  maleBirthHour: '午',
  femaleName: '',
  femaleBirthDate: '',
  femaleBirthHour: '午',
})

const canSubmit = computed(() =>
  form.maleName.trim() && form.maleBirthDate &&
  form.femaleName.trim() && form.femaleBirthDate
)

const shichenChars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function importMale(p: any) {
  form.maleName = p.name || ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.maleBirthDate = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.maleBirthHour = shichenChars[p.birth_hour] || '午'
}

function importFemale(p: any) {
  form.femaleName = p.name || ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.femaleBirthDate = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.femaleBirthHour = shichenChars[p.birth_hour] || '午'
}

const scoreClass = computed(() => {
  const s = result.value?.overallScore || 0
  if (s >= 80) return 'high'
  if (s >= 60) return 'mid'
  return 'low'
})

const dimensionList = computed(() => {
  if (!result.value) return []
  const d = result.value.dimensions
  return [d.shuxiang, d.rigan, d.wuxing, d.nayin]
})

function dimClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

const aiSections = [
  { key: 'zonglun', label: '合婚总论' },
  { key: 'bazihebi', label: '八字合璧' },
  { key: 'shuxiang', label: '属相配对' },
  { key: 'wuxing', label: '五行互补' },
  { key: 'ganqing', label: '感情运势' },
  { key: 'xiangchu', label: '相处之道' },
]

function toggleAi(key: string) {
  expandedAi.value = expandedAi.value === key ? '' : key
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const [my, mm, md] = form.maleBirthDate.split('-').map(Number)
    const [fy, fm, fd] = form.femaleBirthDate.split('-').map(Number)
    const res: any = await http.post('/divination/hehun', {
      maleName: form.maleName.trim(),
      maleBirthYear: my, maleBirthMonth: mm, maleBirthDay: md,
      maleBirthHour: form.maleBirthHour,
      femaleName: form.femaleName.trim(),
      femaleBirthYear: fy, femaleBirthMonth: fm, femaleBirthDay: fd,
      femaleBirthHour: form.femaleBirthHour,
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
  await fetchAiStream('hehun', result.value, undefined, result.value?.id, {
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
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; overflow-y: auto; }
/* 表单 */
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; letter-spacing: 2px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.section-title:first-child { border-top: none; padding-top: 0; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }
select.input { color: var(--text-primary); }
select.input option { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-primary); }
input[type="date"].input { color: var(--text-primary); }
input[type="date"].input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
/* 卡片 */
.card { margin: 16px 20px 0; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); }
.card-title { font-size: 15px; font-weight: 500; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 16px; letter-spacing: 2px; }
/* 总评 */
.summary-card { text-align: center; padding: 28px 20px; }
.summary-names { font-size: 18px; color: var(--text-primary); font-weight: 500; letter-spacing: 2px; margin-bottom: 12px; }
.summary-score { font-size: 48px; font-weight: 700; margin-bottom: 4px; }
.summary-score.high { color: #e8b86d; }
.summary-score.mid { color: #8bb; }
.summary-score.low { color: #b88; }
.summary-level { font-size: 16px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; margin-bottom: 8px; }
.summary-meta { font-size: 13px; color: var(--text-tertiary); }
/* 维度 */
.dim-list { display: flex; flex-direction: column; gap: 18px; }
.dim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.dim-name { font-size: 14px; color: var(--text-primary); }
.dim-score { font-size: 14px; font-weight: 600; }
.dim-score.high { color: #e8b86d; }
.dim-score.mid { color: #8bb; }
.dim-score.low { color: #b88; }
.dim-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.dim-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.dim-fill.high { background: linear-gradient(90deg, #DB2777, #CA8A04); }
.dim-fill.mid { background: linear-gradient(90deg, #6a9, #8bb); }
.dim-fill.low { background: linear-gradient(90deg, #a66, #b88); }
.dim-detail { font-size: 13px; color: var(--text-tertiary); margin-top: 6px; line-height: 1.6; }
/* 八字对比 */
.bazi-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.bazi-row:last-child { border-bottom: none; }
.bazi-label { font-size: 13px; color: var(--text-tertiary); width: 36px; flex-shrink: 0; }
.bazi-value { font-size: 15px; color: var(--text-primary); letter-spacing: 4px; }
/* 手风琴 */
.accordion { display: flex; flex-direction: column; }
.acc-item { border-bottom: 1px solid var(--border); }
.acc-item:last-child { border-bottom: none; }
.acc-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; cursor: pointer; font-size: 14px; color: var(--text-primary); }
.acc-arrow { color: var(--text-tertiary); transition: transform 0.25s; display: inline-block; }
.acc-arrow.open { transform: rotate(90deg); }
.acc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; padding: 0 0 14px; white-space: pre-wrap; }
.jianyi-item { margin-bottom: 6px; }
.ai-trigger { text-align: center; padding: 20px 0; }
.btn-ai { height: 44px; padding: 0 32px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-ai:active { opacity: 0.85; transform: translateY(1px); }
.ai-loading { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.ai-spinner { display: inline-block; font-size: 24px; animation: spin 2s linear infinite; margin-right: 8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
/* 操作 */
.actions { display: flex; gap: 12px; padding: 24px 20px 0; }
.btn-again, .btn-back { flex: 1; height: 44px; border-radius: var(--radius); font-size: 14px; cursor: pointer; letter-spacing: 2px; }
.btn-again { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; color: #fff; font-weight: 500; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
.btn-back:active { opacity: 0.7; }
</style>
