<template>
  <div class="page">
    <van-nav-bar
      title="六爻占卜"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>所问之事</label>
        <textarea v-model="form.question" placeholder="请输入您想占卜的问题，如：近期事业发展如何？" class="textarea" rows="3"></textarea>
      </div>

      <div class="shake-area">
        <p class="shake-hint">心中默念所问之事，点击摇卦</p>

        <!-- 铜钱动画区域 -->
        <div class="coins-container" v-if="isShaking">
          <div v-for="i in 3" :key="i" class="coin" :style="{ animationDelay: `${i * 0.1}s` }">
            <div class="coin-inner">
              <div class="coin-face coin-front"></div>
              <div class="coin-face coin-back"></div>
            </div>
          </div>
        </div>

        <!-- 结果显示区域 -->
        <div class="yao-display" v-if="!isShaking">
          <div v-for="(n, i) in shakeResults" :key="i" class="yao-line" :class="yaoClass(n)">
            <span class="yao-label">{{ yaoLabel(i) }}</span>
            <span class="yao-symbol">{{ yaoSymbol(n) }}</span>
            <span class="yao-name">{{ yaoName(n) }}</span>
          </div>
        </div>

        <button class="shake-btn" :disabled="shakeCount >= 6 || isShaking" @click="shake">
          {{ isShaking ? '摇卦中...' : shakeCount === 0 ? '开始摇卦' : shakeCount < 6 ? `第 ${shakeCount + 1} 爻` : '摇卦完成' }}
        </button>
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">解卦</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 本卦 - 横向排列 -->
      <div class="card gua-main-enhanced">
        <div class="gua-name-large">{{ result.origin?.name }}</div>

        <div class="gua-symbols-horizontal">
          <div class="gua-symbol-item">
            <div class="symbol-label">上卦</div>
            <div class="symbol-char">{{ result.origin?.upper?.symbol }}</div>
            <div class="symbol-name">{{ result.origin?.upper?.nick }}</div>
          </div>
          <div class="gua-symbol-item">
            <div class="symbol-label">下卦</div>
            <div class="symbol-char">{{ result.origin?.lower?.symbol }}</div>
            <div class="symbol-name">{{ result.origin?.lower?.nick }}</div>
          </div>
        </div>

        <div class="gua-ci-enhanced">{{ result.origin?.judgement }}</div>

        <div class="gua-meta" v-if="result.changed">
          变卦：{{ result.changed.symbol }} {{ result.changed.name }}
        </div>
      </div>

      <!-- 爻位详情 -->
      <div class="card">
        <h3 class="card-title">爻位详情</h3>
        <div class="yao-detail">
          <div v-for="i in 6" :key="i" class="yao-item-wrapper">
            <div class="yao-row" :class="{ moving: result.movingIndexes?.includes(6 - i), shi: result.origin?.shi === 7 - i, ying: result.origin?.ying === 7 - i }">
              <span class="yao-pos">{{ result.origin?.lineTexts?.[6 - i]?.label }}</span>
              <span class="yao-gz">{{ result.origin?.ganzhi?.[6 - i] }}</span>
              <span class="yao-rel">{{ result.origin?.relation?.[6 - i] }}</span>
              <span class="yao-god">{{ result.gods?.[6 - i] }}</span>
              <span class="yao-tag" v-if="result.origin?.shi === 7 - i">世</span>
              <span class="yao-tag" v-if="result.origin?.ying === 7 - i">应</span>
              <span class="yao-moving" v-if="result.movingIndexes?.includes(6 - i)">动</span>
            </div>
            <div class="yao-text" v-if="result.origin?.lineTexts?.[6 - i]?.text">
              {{ result.origin?.lineTexts?.[6 - i]?.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- 直断 -->
      <div class="card zhiduan-card" v-if="result.ai?.zhiduan || displayedContent.zhiduan">
        <h3 class="card-title">直断</h3>
        <div class="zhiduan-content">
          {{ displayedContent.zhiduan || result.ai?.zhiduan }}
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
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item">
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
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item">
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
        <button class="btn-again" @click="reset">重新摇卦</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="解卦中..." />
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
const expanded = ref<string>('duanyu')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({ question: '' })
const shakeResults = ref<number[]>([])
const shakeCount = computed(() => shakeResults.value.length)
const isShaking = ref(false)

const canSubmit = computed(() => form.question.trim() && shakeCount.value === 6)

const aiSections = [
  { key: 'duanyu', label: '断语总论' },
  { key: 'yongshen', label: '用神分析' },
  { key: 'shiye', label: '事业分析' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'ganqing', label: '感情分析' },
  { key: 'jixiong', label: '吉凶判断' },
  { key: 'shiji', label: '时机建议' },
]

const labels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

async function shake() {
  if (shakeCount.value >= 6 || isShaking.value) return

  isShaking.value = true

  // 模拟摇三枚铜钱：6老阴 7少阳 8少阴 9老阳
  const coin = () => Math.random() > 0.5 ? 3 : 2
  const val = coin() + coin() + coin()

  // 等待动画完成后再添加结果（1.8秒动画）
  await new Promise(resolve => setTimeout(resolve, 1800))
  shakeResults.value.push(val)
  isShaking.value = false
}

function yaoLabel(i: number): string { return labels[i] || '' }
function yaoSymbol(n: number): string {
  if (n === 6) return '⚋ ×'
  if (n === 7) return '⚊'
  if (n === 8) return '⚋'
  if (n === 9) return '⚊ ○'
  return ''
}
function yaoName(n: number): string {
  if (n === 6) return '老阴'
  if (n === 7) return '少阳'
  if (n === 8) return '少阴'
  if (n === 9) return '老阳'
  return ''
}
function yaoClass(n: number): string {
  if (n === 6 || n === 9) return 'moving'
  return ''
}

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

async function fetchAiInterpretation() {
  if (!result.value) return
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream('liuyao', result.value, { question: form.question }, result.value?.id, {
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

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/liuyao', {
      question: form.question,
      numbers: shakeResults.value,
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

async function typewriterEffect(content: any) {
  isTyping.value = true
  displayedContent.value = {}

  // 先显示直断（不需要打字机效果，直接显示）
  if (content.zhiduan) {
    displayedContent.value.zhiduan = content.zhiduan
  }

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
  shakeResults.value = []
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
.shake-area { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); padding: 20px; text-align: center; }
.shake-hint { font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; }

/* 铜钱容器 */
.coins-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  min-height: 80px;
  perspective: 1000px;
}

/* 铜钱 */
.coin {
  width: 60px;
  height: 60px;
  position: relative;
  animation: coinFlip 1.8s ease-in-out infinite;
}

.coin-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: coinRotate 0.6s linear infinite;
}

.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  backface-visibility: hidden;
  background-size: cover;
  background-position: center;
}

.coin-front {
  background-image: url('@/assets/coins/front.png');
}

.coin-back {
  background-image: url('@/assets/coins/back.png');
  transform: rotateY(180deg);
}

@keyframes coinFlip {
  0%, 100% { transform: translateY(0) rotateX(0deg); }
  25% { transform: translateY(-20px) rotateX(180deg); }
  50% { transform: translateY(0) rotateX(360deg); }
  75% { transform: translateY(-15px) rotateX(540deg); }
}

@keyframes coinRotate {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .coin { animation: coinPulse 1.8s ease-in-out infinite; }
  .coin-inner { animation: none; }
  @keyframes coinPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.95); }
  }
}

.yao-display { display: flex; flex-direction: column-reverse; gap: 6px; margin-bottom: 16px; min-height: 40px; }
.yao-line { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 6px 0; font-size: 13px; color: var(--text-primary); }
.yao-line.moving { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.yao-label { width: 40px; text-align: right; font-size: 12px; color: var(--text-secondary); }
.yao-symbol { font-family: monospace; letter-spacing: 2px; }
.yao-name { width: 40px; font-size: 12px; color: var(--text-tertiary); }
.shake-btn { width: 100%; height: 44px; background: transparent; border: 1px solid rgba(219, 39, 119, 0.5); border-radius: var(--radius); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 14px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; }
.shake-btn:active { background: rgba(219, 39, 119, 0.1); }
.shake-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit { height: 48px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }

/* 本卦卡片 - 横向排列 */
.gua-main-enhanced {
  text-align: center;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(20, 20, 20, 1) 100%);
}

.gua-main-enhanced::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(219, 39, 119, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.gua-name-large {
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.gua-symbols-horizontal {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
}

.gua-symbol-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: rgba(219, 39, 119, 0.05);
  border: 1px solid rgba(219, 39, 119, 0.2);
  border-radius: 10px;
  flex: 1;
  max-width: 140px;
  transition: all 0.2s ease;
}

.gua-symbol-item:hover {
  background: rgba(219, 39, 119, 0.08);
  border-color: rgba(219, 39, 119, 0.3);
}

.symbol-label {
  font-size: 10px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.symbol-char {
  font-size: 40px;
  color: var(--text-primary);
  line-height: 1;
}

.symbol-name {
  font-size: 13px;
  color: #DB2777;
  font-weight: 500;
  letter-spacing: 1px;
}

.gua-ci-enhanced {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  position: relative;
  z-index: 1;
  padding-top: 16px;
  border-top: 1px solid rgba(219, 39, 119, 0.1);
  margin-top: 16px;
}

.gua-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 12px;
  position: relative;
  z-index: 1;
}

/* 响应式优化 */
@media (max-width: 375px) {
  .gua-name-large {
    font-size: 20px;
    letter-spacing: 2px;
  }

  .gua-symbols-horizontal {
    gap: 12px;
  }

  .symbol-char {
    font-size: 36px;
  }

  .gua-symbol-item {
    padding: 10px 20px;
    max-width: 120px;
  }
}

.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.gua-card { text-align: center; padding: 24px 20px; }
.gua-main { display: flex; align-items: center; justify-content: center; gap: 10px; }
.gua-symbol { font-size: 32px; }
.gua-name { font-size: 22px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; letter-spacing: 2px; }
.gua-sub { font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
.gua-judgement { font-size: 13px; color: var(--text-primary); margin-top: 10px; line-height: 1.6; }
.gua-changed { font-size: 13px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-top: 10px; opacity: 0.8; }
.yao-detail { display: flex; flex-direction: column; gap: 12px; }
.yao-item-wrapper { display: flex; flex-direction: column; gap: 6px; }
.yao-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: 12px; color: var(--text-secondary); background: var(--bg-primary); }
.yao-row.moving { border-left: 2px solid #DB2777; }
.yao-pos { width: 32px; color: var(--text-primary); font-weight: 500; }
.yao-gz { width: 40px; color: var(--text-primary); }
.yao-rel { width: 36px; }
.yao-god { flex: 1; }
.yao-tag { padding: 1px 5px; border-radius: 3px; font-size: 11px; background: rgba(219, 39, 119, 0.15); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.yao-moving { padding: 1px 5px; border-radius: 3px; font-size: 11px; background: rgba(199, 80, 80, 0.15); color: #c75050; }
.yao-text { font-size: 12px; color: var(--text-secondary); line-height: 1.6; padding-left: 12px; border-left: 2px solid rgba(219, 39, 119, 0.2); margin-left: 10px; }

/* 直断卡片 */
.zhiduan-card {
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(202, 138, 4, 0.05) 100%);
  border: 1px solid rgba(219, 39, 119, 0.3);
}

.zhiduan-content {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.8;
  text-align: center;
  padding: 12px 0;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

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
