<template>
  <div class="page">
    <van-nav-bar
      title="易经占卜"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>心中所惑</label>
        <textarea v-model="form.question" placeholder="静心凝神，写下您的困惑..." class="textarea" rows="3"></textarea>
      </div>

      <div class="shicao-area">
        <p class="shicao-hint">大衍之数五十，其用四十有九</p>
        <p class="shicao-sub">蓍草法起卦，十八变成卦</p>
        <button class="shicao-btn" :disabled="!form.question.trim()" @click="onSubmit">
          诚心筮占
        </button>
      </div>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 卦象 -->
      <div class="card gua-card">
        <div class="gua-symbol-large">{{ result.origin?.symbol }}</div>
        <div class="gua-name-large">{{ result.origin?.name }}</div>
        <div class="gua-trigrams">{{ result.origin?.upper?.nick }}上{{ result.origin?.lower?.nick }}下</div>
        <div class="gua-judgement">{{ result.origin?.judgement }}</div>
        <div class="gua-text">{{ result.origin?.text }}</div>
        <div class="gua-changed" v-if="result.changed">
          变 → {{ result.changed?.symbol }} {{ result.changed?.name }}
        </div>
      </div>

      <!-- 断卦规则 -->
      <div class="card rule-card">
        <div class="rule-text">{{ result.rule }}</div>
      </div>

      <!-- 爻辞 -->
      <div class="card">
        <h3 class="card-title">爻辞</h3>
        <div class="yao-list">
          <div v-for="(y, i) in reversedYaos" :key="i" class="yao-item" :class="{ moving: y.isMoving }">
            <span class="yao-pos">{{ y.position }}</span>
            <span class="yao-text">{{ y.text }}</span>
          </div>
        </div>
      </div>

      <!-- 重点参看 -->
      <div class="card" v-if="result.focus?.length">
        <h3 class="card-title">重点参看</h3>
        <div class="focus-list">
          <div v-for="(f, i) in result.focus" :key="i" class="focus-item">{{ f }}</div>
        </div>
      </div>

      <!-- AI 义理解读 -->
      <div class="card">
        <h3 class="card-title">义理解读</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai && isTyping" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item">
            <div class="acc-header" @click="toggle(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
            </div>
            <div v-if="expanded === sec.key" class="acc-body">{{ displayedContent[sec.key] || '' }}</div>
          </div>
          <div class="acc-item" v-if="displayedContent.jianyi">
            <div class="acc-header" @click="toggle('jianyi')">
              <span>行动指引</span>
              <span class="acc-arrow" :class="{ open: expanded === 'jianyi' }">›</span>
            </div>
            <div v-if="expanded === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in displayedContent.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
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
              <span>行动指引</span>
              <span class="acc-arrow" :class="{ open: expanded === 'jianyi' }">›</span>
            </div>
            <div v-if="expanded === 'jianyi'" class="acc-body">
              <div v-for="(j, i) in result.ai.jianyi" :key="i" class="jianyi-item">{{ i + 1 }}. {{ j }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">重新筮占</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="蓍草筮占中..." />
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
const expanded = ref<string>('guaxiang')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({ question: '' })

const aiSections = [
  { key: 'guaxiang', label: '卦象解读' },
  { key: 'yili', label: '义理阐释' },
  { key: 'qishi', label: '人生启示' },
  { key: 'chushi', label: '处世智慧' },
  { key: 'yaoci', label: '爻辞解读' },
]

const reversedYaos = computed(() => {
  if (!result.value?.yaos) return []
  return [...result.value.yaos].reverse()
})

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

async function onSubmit() {
  if (!form.question.trim()) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/yijing', {
      question: form.question,
    })
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
  await fetchAiStream('yijing', result.value, { question: form.question }, result.value?.id, {
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
.textarea { padding: 12px 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; resize: none; line-height: 1.6; }
.textarea:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.textarea::placeholder { color: var(--text-tertiary); }
.shicao-area { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); padding: 32px 20px; text-align: center; }
.shicao-hint { font-size: 14px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 2px; margin-bottom: 6px; }
.shicao-sub { font-size: 12px; color: var(--text-tertiary); margin-bottom: 24px; }
.shicao-btn { width: 100%; height: 48px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; }
.shicao-btn:active { opacity: 0.85; }
.shicao-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.gua-card { text-align: center; padding: 32px 20px; }
.gua-symbol-large { font-size: 48px; margin-bottom: 8px; }
.gua-name-large { font-size: 24px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; letter-spacing: 4px; }
.gua-trigrams { font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
.gua-judgement { font-size: 14px; color: var(--text-primary); margin-top: 12px; line-height: 1.6; }
.gua-text { font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.6; }
.gua-changed { font-size: 13px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-top: 12px; opacity: 0.8; }
.rule-card { text-align: center; }
.rule-text { font-size: 13px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px; line-height: 1.6; }
.yao-list { display: flex; flex-direction: column; gap: 8px; }
.yao-item { display: flex; gap: 10px; padding: 10px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 13px; }
.yao-item.moving { border-left: 2px solid #DB2777; }
.yao-pos { flex-shrink: 0; width: 36px; color: var(--text-primary); font-weight: 500; }
.yao-text { color: var(--text-secondary); line-height: 1.6; }
.focus-list { display: flex; flex-direction: column; gap: 8px; }
.focus-item { font-size: 13px; color: var(--text-primary); line-height: 1.6; padding: 8px 12px; background: rgba(219, 39, 119, 0.06); border-radius: 6px; border-left: 2px solid #DB2777; }
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
