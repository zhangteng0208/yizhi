<template>
  <div class="page">
    <van-nav-bar
      title="寻人寻物"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>类型</label>
        <div class="toggle-row">
          <button v-for="t in types" :key="t.value" class="toggle-btn" :class="{ active: form.type === t.value }" @click="form.type = t.value">
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="field" v-if="form.type === 'xunwu'">
        <label>物品名称</label>
        <input v-model="form.itemName" placeholder="请输入物品名称，如：钱包、钥匙" class="input" />
      </div>

      <div class="field" v-if="form.type === 'xunren'">
        <label>人物姓名</label>
        <input v-model="form.personName" placeholder="请输入人物姓名或称呼" class="input" />
      </div>

      <div class="field">
        <label>丢失时间（选填）</label>
        <input v-model="form.lostTime" placeholder="如：今天上午、昨天下午" class="input" />
      </div>

      <div class="field">
        <label>丢失地点（选填）</label>
        <input v-model="form.lostPlace" placeholder="如：家中、公司、商场" class="input" />
      </div>

      <div class="field">
        <label>详细描述</label>
        <textarea v-model="form.question" placeholder="请详细描述情况，如物品特征、最后出现位置等" class="textarea" rows="3"></textarea>
      </div>

      <div class="number-area">
        <p class="number-hint">心中默念所寻之人或物，随意报三个数字（1-100）</p>
        <div class="number-inputs">
          <input v-model.number="numbers[0]" type="number" placeholder="第一个数" class="number-input" min="1" max="100" />
          <input v-model.number="numbers[1]" type="number" placeholder="第二个数" class="number-input" min="1" max="100" />
          <input v-model.number="numbers[2]" type="number" placeholder="第三个数" class="number-input" min="1" max="100" />
        </div>
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">起卦寻找</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 基本信息 -->
      <div class="card info-card">
        <div class="info-type">{{ result.type === 'xunwu' ? '寻物' : '寻人' }}</div>
        <div class="info-target" v-if="result.itemName || result.personName">
          {{ result.itemName || result.personName }}
        </div>
        <div class="info-meta">
          <span v-if="result.lostTime">{{ result.lostTime }}</span>
          <span v-if="result.lostPlace">{{ result.lostPlace }}</span>
        </div>
      </div>

      <!-- 卦象结果 -->
      <div class="card">
        <h3 class="card-title">卦象</h3>
        <div class="gua-info">
          <div class="gua-row">
            <span class="gua-label">月宫</span>
            <span class="gua-value">{{ result.monthShen.name }}（{{ result.monthShen.wuxing }}·{{ result.monthShen.direction }}）</span>
          </div>
          <div class="gua-row">
            <span class="gua-label">日宫</span>
            <span class="gua-value">{{ result.dayShen.name }}（{{ result.dayShen.wuxing }}·{{ result.dayShen.direction }}）</span>
          </div>
          <div class="gua-row">
            <span class="gua-label">时宫</span>
            <span class="gua-value">{{ result.hourShen.name }}（{{ result.hourShen.wuxing }}·{{ result.hourShen.direction }}）</span>
          </div>
        </div>
      </div>

      <!-- 综合判断 -->
      <div class="card">
        <h3 class="card-title">综合判断</h3>
        <div class="judge-info">
          <div class="judge-item">
            <span class="judge-label">方位</span>
            <span class="judge-value highlight">{{ result.direction }}</span>
          </div>
          <div class="judge-item">
            <span class="judge-label">能否找到</span>
            <span class="judge-value" :class="result.canFind ? 'success' : 'warning'">
              {{ result.canFind ? '有望找到' : '较难寻回' }}
            </span>
          </div>
          <div class="judge-item">
            <span class="judge-label">时间预测</span>
            <span class="judge-value">{{ result.timeframe }}</span>
          </div>
          <div class="judge-item">
            <span class="judge-label">吉凶</span>
            <span class="judge-value">{{ result.jixiong }}</span>
          </div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">详细分析</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai && isTyping" class="ai-streaming">
          <div class="accordion">
            <div v-for="sec in aiSections" :key="sec.key" class="acc-item">
              <div class="acc-header" @click="toggle(sec.key)">
                <span>{{ sec.label }}</span>
                <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
              </div>
              <div v-if="expanded === sec.key" class="acc-body">{{ displayedContent[sec.key] || '' }}</div>
            </div>
            <div class="acc-item" v-if="displayedContent.jianyi">
              <div class="acc-header" @click="toggle('jianyi')">
                <span>寻找建议</span>
                <span class="acc-arrow" :class="{ open: expanded === 'jianyi' }">›</span>
              </div>
              <div v-if="expanded === 'jianyi'" class="acc-body">
                <div v-for="(j, i) in displayedContent.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="result.ai && !isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item">
            <div class="acc-header" @click="toggle(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
            </div>
            <div v-if="expanded === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
          <div class="acc-item" v-if="result.ai.jianyi">
            <div class="acc-header" @click="toggle('jianyi')">
              <span>寻找建议</span>
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

    <LoadingOverlay :visible="loading" text="起卦中..." />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const types = [
  { value: 'xunwu', label: '寻物' },
  { value: 'xunren', label: '寻人' },
]

const form = reactive({
  type: 'xunwu' as 'xunwu' | 'xunren',
  itemName: '',
  personName: '',
  lostTime: '',
  lostPlace: '',
  question: '',
})

const numbers = ref<number[]>([0, 0, 0])
const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const isTyping = ref(false)
const displayedContent = ref<any>({})
const expanded = ref<string>('zonglun')

const aiSections = [
  { key: 'zonglun', label: '总体分析' },
  { key: 'fangwei', label: '方位指引' },
  { key: 'shijian', label: '时间预测' },
  { key: 'keneng', label: '可能性分析' },
]

const canSubmit = computed(() => {
  if (form.type === 'xunwu' && !form.itemName.trim()) return false
  if (form.type === 'xunren' && !form.personName.trim()) return false
  if (!form.question.trim()) return false
  if (numbers.value.some(n => !n || n < 1 || n > 100)) return false
  return true
})

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/xunwu', {
      type: form.type,
      question: form.question,
      numbers: numbers.value,
      itemName: form.type === 'xunwu' ? form.itemName : undefined,
      personName: form.type === 'xunren' ? form.personName : undefined,
      lostTime: form.lostTime || undefined,
      lostPlace: form.lostPlace || undefined,
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
  await fetchAiStream('xunwu', result.value, { question: form.question }, result.value?.id, {
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
  form.itemName = ''
  form.personName = ''
  form.lostTime = ''
  form.lostPlace = ''
  form.question = ''
  numbers.value = [0, 0, 0]
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
.textarea { padding: 12px 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; resize: none; line-height: 1.6; }
.textarea:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.textarea::placeholder { color: var(--text-tertiary); }
.toggle-row { display: flex; gap: 10px; }
.toggle-btn { flex: 1; height: 44px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(20px); }
.toggle-btn.active { border-color: #DB2777; color: #DB2777; background: rgba(219, 39, 119, 0.1); box-shadow: 0 0 12px rgba(219, 39, 119, 0.3); }
.number-area { display: flex; flex-direction: column; gap: 12px; }
.number-hint { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.number-inputs { display: flex; gap: 10px; }
.number-input { flex: 1; height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; text-align: center; outline: none; }
.number-input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.info-card { text-align: center; padding: 24px 20px; }
.info-type { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
.info-target { font-size: 20px; color: var(--text-primary); font-weight: 500; margin-bottom: 12px; }
.info-meta { font-size: 13px; color: var(--text-secondary); display: flex; gap: 16px; justify-content: center; }
.gua-info { display: flex; flex-direction: column; gap: 12px; }
.gua-row { display: flex; font-size: 13px; gap: 12px; }
.gua-label { color: var(--text-secondary); white-space: nowrap; }
.gua-value { color: var(--text-primary); }
.judge-info { display: flex; flex-direction: column; gap: 12px; }
.judge-item { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.judge-label { color: var(--text-secondary); }
.judge-value { color: var(--text-primary); font-weight: 500; }
.judge-value.highlight { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.judge-value.success { color: #52c41a; }
.judge-value.warning { color: #faad14; }
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
.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-again { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }
</style>
