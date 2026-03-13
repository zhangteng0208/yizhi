<template>
  <div class="page">
    <van-nav-bar
      title="生意合伙"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="section-title">您的信息</div>
      <div class="field">
        <label>姓名</label>
        <div class="input-with-icon">
          <input v-model="form.selfName" placeholder="请输入您的姓名" class="input" />
          <ProfilePicker @select="importSelf" />
        </div>
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="form.selfBirthDate" type="date" class="input" />
      </div>
      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.selfBirthHour" class="input">
          <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <div class="section-title">
        合伙人信息
        <span class="hint">(可添加多个合伙人)</span>
      </div>
      
      <div v-for="(partner, index) in form.partners" :key="index" class="partner-card">
        <div class="partner-header">
          <span class="partner-num">合伙人 {{ index + 1 }}</span>
          <button class="btn-remove" @click="removePartner(index)" v-if="form.partners.length > 1">删除</button>
        </div>
        <div class="field">
          <label>姓名</label>
          <input v-model="partner.name" placeholder="请输入合伙人姓名" class="input" />
        </div>
        <div class="field">
          <label>出生日期</label>
          <input v-model="partner.birthDate" type="date" class="input" />
        </div>
        <div class="field">
          <label>出生时辰</label>
          <select v-model="partner.birthHour" class="input">
            <option v-for="h in shichenList" :key="h.value" :value="h.value">{{ h.label }}</option>
          </select>
        </div>
      </div>

      <button class="btn-add-partner" @click="addPartner">+ 添加合伙人</button>

      <div class="section-title">行业选择</div>
      <div class="industry-grid">
        <button 
          v-for="ind in industryList" 
          :key="ind.value" 
          class="industry-btn"
          :class="{ active: form.industry === ind.value }"
          @click="form.industry = ind.value"
        >
          <span class="industry-icon">{{ ind.icon }}</span>
          <span class="industry-label">{{ ind.label }}</span>
        </button>
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">开始分析</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 总评 -->
      <div class="card summary-card">
        <div class="summary-title">生意合伙分析</div>
        <div class="summary-partners">
          <span class="self-name">{{ result.self.name }}</span>
          <span class="separator">+</span>
          <span class="partner-names">{{ result.partners.map(p => p.name).join('、') }}</span>
        </div>
        <div class="summary-industry">{{ result.industry }}</div>
        <div class="summary-score" :class="scoreClass">{{ result.overallScore }}分</div>
        <div class="summary-level">{{ result.overallLevel }}</div>
      </div>

      <!-- 卦象 -->
      <div class="card">
        <h3 class="card-title">易经卦象</h3>
        <div class="gua-display">
          <div class="gua-symbol">{{ result.yijing.origin.symbol }}</div>
          <div class="gua-name">{{ result.yijing.origin.name }}</div>
          <div class="gua-judgement">{{ result.yijing.origin.judgement }}</div>
        </div>
        <div class="gua-detail" v-if="result.yijing.changed">
          <div class="gua-change-label">变卦：{{ result.yijing.changed.name }}</div>
          <div class="gua-change-symbol">{{ result.yijing.changed.symbol }}</div>
        </div>
        <div class="gua-rule">
          <span class="rule-label">断卦：</span>
          <span class="rule-text">{{ result.yijing.rule }}</span>
        </div>
      </div>

      <!-- 分析维度 -->
      <div class="card">
        <h3 class="card-title">分析维度</h3>
        <div class="dim-list">
          <div class="dim-item" v-for="dim in dimensionList" :key="dim.key">
            <div class="dim-header">
              <span class="dim-name">{{ dim.name }}</span>
              <span class="dim-score" :class="dimClass(dim.score)">{{ dim.score }}分</span>
            </div>
            <div class="dim-bar"><div class="dim-fill" :class="dimClass(dim.score)" :style="{ width: dim.score + '%' }"></div></div>
            <div class="dim-detail">{{ dim.detail }}</div>
          </div>
        </div>
      </div>

      <!-- 八字信息 -->
      <div class="card">
        <h3 class="card-title">八字信息</h3>
        <div class="bazi-section">
          <div class="bazi-person">
            <div class="bazi-name">{{ result.self.name }}</div>
            <div class="bazi-pan">{{ result.self.bazi.rawBaZi }}</div>
            <div class="bazi-info">
              <span>{{ result.self.bazi.lunarInfo.shengXiao }}</span>
              <span>{{ result.self.bazi.shenQiangRuo }}</span>
              <span>用神：{{ result.self.bazi.yongShen }}</span>
            </div>
          </div>
          <div class="bazi-divider"></div>
          <div class="bazi-person" v-for="(p, i) in result.partners" :key="i">
            <div class="bazi-name">{{ p.name }}</div>
            <div class="bazi-pan">{{ p.bazi.rawBaZi }}</div>
            <div class="bazi-info">
              <span>{{ p.bazi.lunarInfo.shengXiao }}</span>
              <span>{{ p.bazi.shenQiangRuo }}</span>
              <span>用神：{{ p.bazi.yongShen }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 综合建议 -->
      <div class="card">
        <h3 class="card-title">综合建议</h3>
        <div class="recommendation">{{ result.recommendation }}</div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">详细解读</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">深入分析</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>分析中...</span>
        </div>
        <div v-if="result.ai && isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="displayedContent[sec.key]">
            <div class="acc-header" @click="toggleAi(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expandedAi === sec.key }">›</span>
            </div>
            <div v-if="expandedAi === sec.key" class="acc-body">{{ displayedContent[sec.key] || '' }}</div>
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
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">重新分析</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="分析中..." />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'

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

const industryList = [
  { value: '科技', label: '科技/互联网', icon: '💻' },
  { value: '金融', label: '金融/投资', icon: '💰' },
  { value: '制造', label: '制造/建筑', icon: '🏭' },
  { value: '能源', label: '能源/电力', icon: '⚡' },
  { value: '医疗', label: '医疗/医药', icon: '🏥' },
  { value: '教育', label: '教育培训', icon: '📚' },
  { value: '餐饮', label: '餐饮/食品', icon: '🍜' },
  { value: '贸易', label: '贸易/零售', icon: '🛒' },
  { value: '农业', label: '农业', icon: '🌾' },
  { value: '传媒', label: '传媒/广告', icon: '📺' },
  { value: '咨询', label: '咨询/顾问', icon: '💼' },
  { value: '物流', label: '物流/运输', icon: '🚚' },
  { value: '娱乐', label: '娱乐/演艺', icon: '🎭' },
  { value: '服务', label: '服务业', icon: '🤝' },
  { value: '其他', label: '其他', icon: '📦' },
]

interface PartnerForm {
  name: string
  birthDate: string
  birthHour: string
}

const form = reactive({
  selfName: '',
  selfBirthDate: '',
  selfBirthHour: '午',
  partners: [
    { name: '', birthDate: '', birthHour: '午' } as PartnerForm
  ] as PartnerForm[],
  industry: '科技',
})

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expandedAi = ref('zonglun')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const aiSections = [
  { key: 'zonglun', label: '总体分析' },
  { key: 'hehuo', label: '合伙优势' },
  { key: 'fengxian', label: '风险提示' },
  { key: 'jianyi', label: '合作建议' },
]

function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  }
}

const canSubmit = computed(() => {
  if (!form.selfName.trim()) return false
  const selfDate = parseDate(form.selfBirthDate)
  if (!selfDate) return false

  // 至少有一个有效的合伙人
  const hasValidPartner = form.partners.some(p => {
    const pDate = parseDate(p.birthDate)
    return p.name.trim() && pDate
  })
  if (!hasValidPartner) return false

  if (!form.industry) return false

  return true
})

const dimensionList = computed(() => {
  if (!result.value) return []
  return [
    { key: 'wuxingMatch', name: result.value.dimensions.wuxingMatch.name, score: result.value.dimensions.wuxingMatch.score, detail: result.value.dimensions.wuxingMatch.detail },
    { key: 'baziHarmony', name: result.value.dimensions.baziHarmony.name, score: result.value.dimensions.baziHarmony.score, detail: result.value.dimensions.baziHarmony.detail },
    { key: 'industrySuitability', name: result.value.dimensions.industrySuitability.name, score: result.value.dimensions.industrySuitability.score, detail: result.value.dimensions.industrySuitability.detail },
    { key: 'leadershipBalance', name: result.value.dimensions.leadershipBalance.name, score: result.value.dimensions.leadershipBalance.score, detail: result.value.dimensions.leadershipBalance.detail },
  ]
})

const scoreClass = computed(() => {
  if (!result.value) return ''
  const s = result.value.overallScore
  if (s >= 80) return 'score-high'
  if (s >= 60) return 'score-mid'
  return 'score-low'
})

function dimClass(score: number): string {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

function addPartner() {
  form.partners.push({ name: '', birthDate: '', birthHour: '午' })
}

function removePartner(index: number) {
  if (form.partners.length > 1) {
    form.partners.splice(index, 1)
  }
}

function importSelf(p: any) {
  form.selfName = p.name || ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.selfBirthDate = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour) {
    form.selfBirthHour = p.birth_hour
  }
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true

  const selfDate = parseDate(form.selfBirthDate)!
  const partners = form.partners
    .filter(p => p.name.trim() && parseDate(p.birthDate))
    .map(p => {
      const date = parseDate(p.birthDate)!
      return {
        name: p.name,
        birthYear: date.year,
        birthMonth: date.month,
        birthDay: date.day,
        birthHour: p.birthHour,
      }
    })

  try {
    const res: any = await http.post('/divination/shengyi', {
      selfName: form.selfName,
      selfBirthYear: selfDate.year,
      selfBirthMonth: selfDate.month,
      selfBirthDay: selfDate.day,
      selfBirthHour: form.selfBirthHour,
      partners,
      industry: form.industry,
    })
    result.value = res.data ?? res
  } catch (e) {
    console.error(e)
    return
  } finally {
    loading.value = false
  }
}

function toggleAi(key: string) {
  expandedAi.value = expandedAi.value === key ? '' : key
}

async function fetchAiInterpretation() {
  if (!result.value) return
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream('shengyi', result.value, { industry: form.industry }, result.value?.id, {
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
  form.selfName = ''
  form.selfBirthDate = ''
  form.selfBirthHour = '午'
  form.partners = [{ name: '', birthDate: '', birthHour: '午' }]
  form.industry = '科技'
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 15px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; margin-bottom: 4px; }
.section-title .hint { font-size: 12px; color: var(--text-tertiary); font-weight: normal; margin-left: 8px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }

.partner-card { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.partner-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.partner-num { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; }
.btn-remove { font-size: 12px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; }
.btn-add-partner { height: 44px; background: transparent; border: 1px dashed var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; margin-bottom: 12px; }
.btn-add-partner:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }

.industry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.industry-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.industry-btn.active { border-background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background: rgba(219, 39, 119, 0.1); }
.industry-icon { font-size: 20px; }
.industry-label { font-size: 11px; color: var(--text-secondary); }
.industry-btn.active .industry-label { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }

.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }

.summary-card { text-align: center; padding: 24px 20px; }
.summary-title { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
.summary-partners { font-size: 16px; color: var(--text-primary); margin-bottom: 8px; }
.summary-partners .self-name { font-weight: 500; }
.summary-partners .separator { margin: 0 8px; color: var(--text-tertiary); }
.summary-industry { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.summary-score { font-size: 48px; font-weight: 600; margin-bottom: 4px; }
.summary-score.score-high { color: #52c41a; }
.summary-score.score-mid { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.summary-score.score-low { color: #ff4d4f; }
.summary-level { font-size: 16px; color: var(--text-primary); font-weight: 500; }

.gua-display { text-align: center; margin-bottom: 16px; }
.gua-symbol { font-size: 48px; line-height: 1.2; margin-bottom: 8px; }
.gua-name { font-size: 18px; color: var(--text-primary); font-weight: 500; margin-bottom: 8px; }
.gua-judgement { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.gua-detail { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: 8px; margin-bottom: 12px; }
.gua-change-label { font-size: 13px; color: var(--text-secondary); }
.gua-change-symbol { font-size: 24px; }
.gua-rule { font-size: 12px; color: var(--text-tertiary); text-align: center; }
.gua-rule .rule-text { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.dim-list { display: flex; flex-direction: column; gap: 16px; }
.dim-item { display: flex; flex-direction: column; gap: 8px; }
.dim-header { display: flex; justify-content: space-between; align-items: center; }
.dim-name { font-size: 14px; color: var(--text-primary); }
.dim-score { font-size: 14px; font-weight: 600; }
.dim-score.score-high { color: #52c41a; }
.dim-score.score-mid { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.dim-score.score-low { color: #ff4d4f; }
.dim-bar { height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
.dim-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.dim-fill.score-high { background: #52c41a; }
.dim-fill.score-mid { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); }
.dim-fill.score-low { background: #ff4d4f; }
.dim-detail { font-size: 12px; color: var(--text-tertiary); line-height: 1.5; }

.bazi-section { display: flex; flex-direction: column; gap: 16px; }
.bazi-person { text-align: center; }
.bazi-name { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 4px; }
.bazi-pan { font-size: 15px; color: var(--text-primary); font-weight: 500; margin-bottom: 4px; }
.bazi-info { font-size: 12px; color: var(--text-tertiary); display: flex; gap: 12px; justify-content: center; }
.bazi-divider { height: 1px; background: var(--border); }

.recommendation { font-size: 14px; color: var(--text-primary); line-height: 1.8; }

.ai-trigger { text-align: center; padding: 20px 0; }
.btn-ai { height: 44px; padding: 0 32px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-ai:active { opacity: 0.85; transform: translateY(1px); }
.ai-loading { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.ai-spinner { display: inline-block; font-size: 24px; animation: spin 2s linear infinite; margin-right: 8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.accordion { display: flex; flex-direction: column; }
.acc-item { border-bottom: 1px solid var(--border); }
.acc-item:last-child { border-bottom: none; }
.acc-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: var(--text-primary); cursor: pointer; }
.acc-arrow { font-size: 16px; color: var(--text-secondary); transition: transform 0.2s; }
.acc-arrow.open { transform: rotate(90deg); }
.acc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; padding-bottom: 14px; }

.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-again { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }
</style>
