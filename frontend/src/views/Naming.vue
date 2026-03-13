<template>
  <div class="page">
    <van-nav-bar
      title="起名改名"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 模式切换 -->
    <div class="mode-tabs" v-if="!result">
      <span class="mode-tab" :class="{ active: mode === 'naming' }" @click="mode = 'naming'">智能取名</span>
      <span class="mode-tab" :class="{ active: mode === 'check' }" @click="mode = 'check'">姓名测评</span>
    </div>

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>姓氏</label>
        <div class="input-with-icon">
          <input v-model="form.surname" placeholder="请输入姓氏" class="input" />
          <ProfilePicker @select="importProfile" />
        </div>
      </div>
      <div class="field">
        <label>性别</label>
        <div class="gender-row">
          <span class="gender-btn" :class="{ active: form.gender === 'male' }" @click="form.gender = 'male'">男</span>
          <span class="gender-btn" :class="{ active: form.gender === 'female' }" @click="form.gender = 'female'">女</span>
        </div>
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="form.birthDate" type="date" class="input" />
      </div>
      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.birthHour" class="input">
          <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <!-- 测名模式：输入名字 -->
      <div class="field" v-if="mode === 'check'">
        <label>名字（不含姓氏）</label>
        <input v-model="form.name" placeholder="请输入名字" class="input" />
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">
        {{ mode === 'naming' ? '智能取名' : '开始测评' }}
      </button>
    </div>

    <!-- 取名结果 -->
    <template v-if="result && mode === 'naming'">
      <!-- 八字概览 -->
      <div class="card summary-card">
        <div class="summary-surname">{{ result.surname }}氏取名</div>
        <div class="summary-bazi">{{ result.bazi.siZhu }}</div>
        <div class="summary-meta">
          <span>日干：{{ result.bazi.riGan }}（{{ result.bazi.riGanWuxing }}）</span>
          <span>喜用：{{ result.bazi.xiyong }}</span>
        </div>
        <div class="summary-wx">
          <span v-for="wx in recommendWuxingTags" :key="wx" class="wx-tag">{{ wx }}</span>
        </div>
      </div>

      <!-- AI 推荐名字 -->
      <div class="card">
        <h3 class="card-title">推荐名字</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>AI 取名中...</span>
        </div>
        <template v-if="result.ai">
          <div class="name-list" v-if="result.ai?.tuijian && result.ai.tuijian.length">
            <div class="name-item" v-for="(n, i) in result.ai.tuijian" :key="i" @click="expandedName = expandedName === i ? -1 : i">
              <div class="name-header">
                <span class="name-text">{{ n.name }}</span>
                <span class="name-pinyin">{{ n.pinyin }}</span>
                <span class="name-arrow" :class="{ open: expandedName === i }">›</span>
              </div>
              <div class="name-jianjie" v-if="n.jianjie">{{ n.jianjie }}</div>
              <div class="name-sections" v-if="expandedName === i">
                <div class="name-section" v-if="n.youlai">
                  <span class="section-label">取名由来</span>
                  <span class="section-text">{{ n.youlai }}</span>
                </div>
                <div class="name-section diangu" v-if="n.diangu">
                  <span class="section-label">典故出处</span>
                  <span class="section-text">{{ n.diangu }}</span>
                </div>
                <div class="name-section" v-if="n.analysis">
                  <span class="section-label">名字解析</span>
                  <span class="section-text">{{ n.analysis }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-hint" v-else>AI 取名服务暂时不可用，请稍后重试</div>
        </template>
      </div>

      <!-- AI 解读 -->
      <div class="card" v-if="result.ai">
        <h3 class="card-title">取名解读</h3>
        <div class="accordion">
          <div v-for="sec in namingAiSections" :key="sec.key" class="acc-item" v-show="result.ai[sec.key]">
            <div class="acc-header" @click="toggleAi(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expandedAi === sec.key }">›</span>
            </div>
            <div v-if="expandedAi === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
          <div class="acc-item" v-if="result.ai.jianyi">
            <div class="acc-header" @click="toggleAi('jianyi')">
              <span>取名建议</span>
              <span class="acc-arrow" :class="{ open: expandedAi === 'jianyi' }">›</span>
            </div>
            <div v-if="expandedAi === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in result.ai.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 测名结果 -->
    <template v-if="result && mode === 'check'">
      <!-- 名字总评 -->
      <div class="card summary-card">
        <div class="summary-surname">{{ result.surname }}{{ form.name }}</div>
        <div class="summary-score" :class="scoreClass">{{ result.ai?.score || result.nameScore }}分</div>
        <div class="summary-bazi">{{ result.bazi.siZhu }}</div>
        <div class="summary-meta">
          <span>日干：{{ result.bazi.riGan }}（{{ result.bazi.riGanWuxing }}）</span>
          <span>喜用：{{ result.bazi.xiyong }}</span>
        </div>
      </div>

      <!-- 五格数理 -->
      <div class="card" v-if="result.wuge">
        <h3 class="card-title">五格数理</h3>
        <div class="wuge-grid">
          <div class="wuge-cell" v-for="g in wugeList" :key="g.label">
            <div class="wuge-label">{{ g.label }}</div>
            <div class="wuge-value">{{ g.data.value }}</div>
            <div class="wuge-wx">{{ g.data.wuxing }}</div>
            <div class="wuge-shuli" :class="{ ji: g.data.ji }">{{ g.data.shuli }}</div>
          </div>
        </div>
        <div class="sancai">三才配置：{{ result.wuge.sancai }}</div>
      </div>

      <!-- 笔画详情 -->
      <div class="card" v-if="result.nameChars">
        <h3 class="card-title">笔画详情</h3>
        <div class="stroke-row">
          <span class="stroke-item" v-for="c in allChars" :key="c.char">
            <span class="stroke-char">{{ c.char }}</span>
            <span class="stroke-num">{{ c.stroke }}画</span>
          </span>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">姓名测评</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai" class="accordion">
          <div v-for="sec in checkAiSections" :key="sec.key" class="acc-item" v-show="result.ai[sec.key]">
            <div class="acc-header" @click="toggleAi(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expandedAi === sec.key }">›</span>
            </div>
            <div v-if="expandedAi === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
          <div class="acc-item" v-if="result.ai.jianyi">
            <div class="acc-header" @click="toggleAi('jianyi')">
              <span>改善建议</span>
              <span class="acc-arrow" :class="{ open: expandedAi === 'jianyi' }">›</span>
            </div>
            <div v-if="expandedAi === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in result.ai.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="actions" v-if="result">
      <button class="btn-again" @click="reset">重新查询</button>
      <button class="btn-back" @click="$router.push('/')">返回首页</button>
    </div>

    <LoadingOverlay :visible="loading" :text="mode === 'naming' ? '智能取名中...' : '姓名测评中...'" />
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
const mode = ref<'naming' | 'check'>('naming')
const expandedAi = ref('zonglun')
const expandedName = ref(-1)
const isTyping = ref(false)
const displayedContent = ref<any>({})

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
  surname: '',
  gender: 'male' as string,
  birthDate: '',
  birthHour: 6 as number,
  name: '',
})

const canSubmit = computed(() => {
  if (!form.surname.trim() || !form.birthDate) return false
  if (mode.value === 'check' && !form.name.trim()) return false
  return true
})

function importProfile(p: any) {
  if (p.name) {
    const surname = p.name.length >= 2 ? p.name[0] : p.name
    form.surname = surname
    if (mode.value === 'check') form.name = p.name.slice(surname.length)
  }
  form.gender = p.gender === 2 ? 'female' : 'male'
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.birthDate = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.birthHour = p.birth_hour
}

const recommendWuxingTags = computed(() => {
  if (!result.value) return []
  return (result.value.recommendWuxing || []).map((wx: string) => `补${wx}`)
})

const scoreClass = computed(() => {
  const s = result.value?.ai?.score || result.value?.nameScore || 0
  if (s >= 80) return 'high'
  if (s >= 60) return 'mid'
  return 'low'
})

const wugeList = computed(() => {
  if (!result.value?.wuge) return []
  const w = result.value.wuge
  return [
    { label: '天格', data: w.tiange },
    { label: '人格', data: w.renge },
    { label: '地格', data: w.dige },
    { label: '外格', data: w.waige },
    { label: '总格', data: w.zongge },
  ]
})

const allChars = computed(() => {
  if (!result.value) return []
  const surnameChars = [...result.value.surname].map((c: string) => ({ char: c, stroke: 0 }))
  if (surnameChars.length === 1) {
    surnameChars[0].stroke = result.value.wuge?.tiange.value - 1 || 0
  }
  return [...surnameChars, ...(result.value.nameChars || [])]
})

const namingAiSections = [
  { key: 'zonglun', label: '八字与取名总论' },
  { key: 'wuxingfenxi', label: '五行分析' },
  { key: 'yongzi', label: '用字方向' },
]

const checkAiSections = [
  { key: 'zonglun', label: '名字总评' },
  { key: 'wuge', label: '五格分析' },
  { key: 'wuxing', label: '五行匹配' },
  { key: 'yinyun', label: '音韵分析' },
  { key: 'ziyi', label: '字义解读' },
]

function toggleAi(key: string) {
  expandedAi.value = expandedAi.value === key ? '' : key
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const [y, m, d] = form.birthDate.split('-').map(Number)
    const payload: any = {
      surname: form.surname.trim(),
      gender: form.gender,
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthHour: form.birthHour,
    }
    if (mode.value === 'check') {
      payload.name = form.name.trim()
      payload.mode = 'check'
    }
    const res: any = await http.post('/divination/naming', payload)
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
  const aiType = mode.value === 'check' ? 'namingCheck' : 'naming'
  const extraParams = mode.value === 'check' ? { name: form.name.trim() } : undefined
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream(aiType, result.value, extraParams, result.value?.id, {
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

  const sections = mode.value === 'naming' ? namingAiSections : checkAiSections
  for (const sec of sections) {
    if (content[sec.key]) {
      await typeText(sec.key, content[sec.key])
    }
  }

  if (content.jianyi) {
    displayedContent.value.jianyi = content.jianyi
  }

  if (content.tuijian) {
    displayedContent.value.tuijian = content.tuijian
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
  form.name = ''
  expandedName.value = -1
}
</script>
<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
/* 模式切换 */
.mode-tabs { display: flex; gap: 0; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: 8px; padding: 3px; margin: 0 20px 20px; border: 1px solid var(--border); backdrop-filter: blur(20px); }
.mode-tab { flex: 1; text-align: center; padding: 10px 0; font-size: 13px; color: var(--text-secondary); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.mode-tab.active { background: rgba(219, 39, 119, 0.1); color: #DB2777; font-weight: 500; box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
/* 表单 */
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }
select.input { color: var(--text-primary); }
select.input option { background: var(--bg-secondary); color: var(--text-primary); }
input[type="date"].input { color: var(--text-primary); }
input[type="date"].input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
/* 性别 */
.gender-row { display: flex; gap: 10px; }
.gender-btn { flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
.gender-btn.active { border-color: #DB2777; color: #DB2777; background: rgba(219, 39, 119, 0.1); box-shadow: 0 0 12px rgba(219, 39, 119, 0.3); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
/* 卡片 */
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
/* 概览 */
.summary-card { text-align: center; padding: 28px 20px; position: relative; overflow: hidden; }
.summary-card::after { content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: radial-gradient(circle, rgba(219, 39, 119, 0.12) 0%, transparent 70%); pointer-events: none; }
.summary-surname { font-size: 22px; font-weight: 600; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 6px; margin-bottom: 8px; position: relative; z-index: 1; }
.summary-score { font-size: 36px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; position: relative; z-index: 1; }
.summary-score.high { }
.summary-score.mid { }
.summary-score.low { }
.summary-bazi { font-size: 14px; color: var(--text-primary); margin-bottom: 6px; letter-spacing: 2px; }
.summary-meta { display: flex; justify-content: center; gap: 16px; font-size: 12px; color: var(--text-tertiary); margin-bottom: 8px; }
.summary-wx { display: flex; justify-content: center; gap: 8px; margin-top: 8px; position: relative; z-index: 1; }
.wx-tag { font-size: 11px; padding: 3px 10px; border-radius: 4px; color: #DB2777; background: rgba(219, 39, 119, 0.1); border: 1px solid rgba(219, 39, 119, 0.2); }
/* 推荐名字 */
.name-list { display: flex; flex-direction: column; gap: 12px; }
.name-item { background: var(--bg-primary); border-radius: 8px; padding: 16px; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
.name-item:hover { border-color: rgba(219, 39, 119, 0.3); }
.name-header { display: flex; align-items: baseline; gap: 10px; }
.name-text { font-size: 18px; font-weight: 500; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; }
.name-pinyin { font-size: 12px; color: var(--text-tertiary); flex: 1; }
.name-arrow { font-size: 16px; color: var(--text-secondary); transition: transform 0.2s; }
.name-arrow.open { transform: rotate(90deg); }
.name-jianjie { font-size: 13px; color: var(--text-primary); margin-top: 8px; line-height: 1.6; }
.name-sections { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
.name-section { padding: 10px; background: var(--bg-secondary); border-radius: 6px; }
.name-section.diangu { background: rgba(219, 39, 119, 0.06); border-left: 3px solid #DB2777; }
.section-label { display: block; font-size: 11px; color: #DB2777; font-weight: 500; margin-bottom: 4px; letter-spacing: 1px; }
.section-text { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
.empty-hint { font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0; }
/* 五格 */
.wuge-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.wuge-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; background: var(--bg-primary); border-radius: 8px; }
.wuge-label { font-size: 11px; color: var(--text-tertiary); }
.wuge-value { font-size: 18px; font-weight: 500; color: var(--text-primary); }
.wuge-wx { font-size: 11px; color: var(--text-secondary); }
.wuge-shuli { font-size: 10px; color: #e06060; }
.wuge-shuli.ji { color: #DB2777; }
.sancai { text-align: center; font-size: 12px; color: var(--text-secondary); margin-top: 12px; }
/* 笔画 */
.stroke-row { display: flex; justify-content: center; gap: 16px; }
.stroke-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stroke-char { font-size: 20px; color: var(--text-primary); }
.stroke-num { font-size: 11px; color: var(--text-tertiary); }
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
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-back:active { background: rgba(26, 26, 26, 0.5); }
</style>
