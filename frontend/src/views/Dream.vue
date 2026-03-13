<template>
  <div class="page">
    <header class="nav">
      <span class="back" @click="$router.back()">‹</span>
      <span class="title">周公解梦</span>
      <span class="placeholder"></span>
    </header>

    <!-- 输入 -->
    <div class="form" v-if="!result">
      <div class="field">
        <textarea 
          v-model="form.dream" 
          placeholder="例如：梦见蛇在水里游，还看到了金色的鱼..." 
          class="textarea" 
          rows="6"
        ></textarea>
      </div>

      <div class="examples">
        <p class="examples-title">常见梦境示例：</p>
        <div class="example-tags">
          <span class="tag" @click="form.dream = '梦见蛇'">蛇</span>
          <span class="tag" @click="form.dream = '梦见龙飞在天上'">龙</span>
          <span class="tag" @click="form.dream = '梦见掉牙齿'">掉牙</span>
          <span class="tag" @click="form.dream = '梦见去世的亲人'">亲人</span>
          <span class="tag" @click="form.dream = '梦见下大雨'">下雨</span>
          <span class="tag" @click="form.dream = '梦见自己飞起来了'">飞翔</span>
          <span class="tag" @click="form.dream = '梦见被狗追'">狗追</span>
          <span class="tag" @click="form.dream = '梦见捡钱'">捡钱</span>
        </div>
      </div>

      <button class="submit" :disabled="!form.dream.trim()" @click="onSubmit">
        开始解梦
      </button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 总体吉凶 -->
      <div class="card result-header" :class="{ good: result.overall?.isGood, bad: !result.overall?.isGood }">
        <div class="result-icon">{{ result.overall?.isGood ? '✨' : '⚠️' }}</div>
        <div class="result-title">{{ result.overall?.isGood ? '吉梦' : '需注意' }}</div>
        <div class="result-summary">{{ result.overall?.summary }}</div>
      </div>

      <!-- 梦境回顾 -->
      <div class="card">
        <h3 class="card-title">梦境回顾</h3>
        <div class="dream-content">{{ result.dream }}</div>
      </div>

      <!-- 解析结果 -->
      <div class="card" v-if="result.keywords?.length">
        <h3 class="card-title">梦境元素</h3>
        <div class="keywords">
          <span 
            v-for="kw in result.keywords" 
            :key="kw" 
            class="keyword"
          >{{ kw }}</span>
        </div>
      </div>

      <!-- 详细解释 -->
      <div class="card" v-if="result.interpretations?.length">
        <h3 class="card-title">梦境解析</h3>
        <div class="interpretations">
          <div 
            v-for="(item, idx) in result.interpretations" 
            :key="idx" 
            class="interpretation-item"
            :class="{ good: item.isGood, bad: !item.isGood }"
          >
            <div class="interp-header">
              <span class="interp-keyword">{{ item.keyword }}</span>
              <span class="interp-category">{{ item.category }}</span>
            </div>
            <div class="interp-meaning">{{ item.meaning }}</div>
          </div>
        </div>
      </div>

      <!-- 无匹配 -->
      <div class="card" v-if="!result.interpretations?.length">
        <div class="no-result">
          <div class="no-result-icon">🔮</div>
          <p>梦境较为独特，需结合更多细节分析</p>
          <p class="no-result-hint">试着回忆更多梦境细节，如场景、人物、情绪等</p>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">AI 深度解析</h3>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">获取详细解析</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>梦境解析中...</span>
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
        <button class="btn-again" @click="reset">重新解梦</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="解梦分析中..." />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expanded = ref<string>('zonglun')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({ dream: '' })

const aiSections = [
  { key: 'zonglun', label: '梦境总论' },
  { key: 'yuansu', label: '梦境元素分析' },
  { key: 'qingxu', label: '情绪与心理状态' },
  { key: 'caiyun', label: '财运解析' },
  { key: 'shiye', label: '事业解析' },
  { key: 'ganqing', label: '感情解析' },
  { key: 'jiankang', label: '健康解析' },
  { key: 'renji', label: '人际关系' },
  { key: 'jixiong', label: '吉凶判断' },
]

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

async function fetchAiInterpretation() {
  if (!result.value) return
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream('dream', result.value, { dream: form.dream }, result.value?.id, {
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

async function onSubmit() {
  if (!form.dream.trim()) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/dream', {
      dream: form.dream,
    })
    result.value = res.data ?? res
    // 自动调用 AI 解析
    await fetchAiInterpretation()
  } catch (e) {
    console.error(e)
    return
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
  form.dream = ''
  aiLoading.value = false
  expanded.value = 'zonglun'
  isTyping.value = false
  displayedContent.value = {}
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 40px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back {
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 40px;
}

.title {
  font-size: 18px;
  font-weight: 500;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.placeholder {
  width: 40px;
}

/* 输入区域 */
.form {
  padding: 20px;
}

.field {
  margin-bottom: 20px;
}

.textarea {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  outline: none;
  -webkit-appearance: none;
  backdrop-filter: blur(20px);
  transition: all 0.2s;
}

.textarea:focus {
  border-color: rgba(219, 39, 119, 0.5);
  box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
}

.textarea::placeholder {
  color: var(--text-tertiary);
}

.examples {
  margin-bottom: 24px;
}

.examples-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(20px);
}

.tag:active {
  border-color: #DB2777;
  color: #DB2777;
  background: rgba(219, 39, 119, 0.1);
  box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
}

.submit {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.submit:active {
  opacity: 0.85;
  transform: translateY(1px);
}

.submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 结果区域 */
.card {
  margin: 0 20px 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.card-title {
  font-size: 14px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

/* 结果头部 */
.result-header {
  text-align: center;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
}

.result-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(219, 39, 119, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.result-header.good {
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.15) 0%, rgba(219, 39, 119, 0.05) 100%);
  border-color: rgba(219, 39, 119, 0.3);
}

.result-header.bad {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%);
  border-color: rgba(234, 179, 8, 0.3);
}

.result-icon {
  font-size: 48px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.result-header.good .result-title {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-header.bad .result-title {
  color: #eab308;
}

.result-summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6梦境回顾;
}

/*  */
.dream-content {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
}

/* 关键词 */
.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword {
  padding: 8px 16px;
  background: rgba(219, 39, 119, 0.1);
  border-radius: 16px;
  font-size: 14px;
  color: #DB2777;
  border: 1px solid rgba(219, 39, 119, 0.2);
}

/* 解释列表 */
.interpretations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interpretation-item {
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
  border-left: 3px solid var(--border);
}

.interpretation-item.good {
  border-left-color: #22c55e;
}

.interpretation-item.bad {
  border-left-color: #ef4444;
}

.interp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.interp-keyword {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.interp-category {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-tertiary);
}

.interp-meaning {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 无匹配 */
.no-result {
  text-align: center;
  padding: 32px 0;
}

.no-result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-result p {
  color: var(--text-secondary);
  font-size: 14px;
}

.no-result-hint {
  margin-top: 8px;
  font-size: 13px !important;
  color: var(--text-tertiary) !important;
}

/* 按钮 */
.actions {
  display: flex;
  gap: 12px;
  padding: 20px;
}

.btn-again,
.btn-back {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-again {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.btn-again:active {
  opacity: 0.85;
  transform: translateY(1px);
}

.btn-back {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-back:active {
  background: rgba(26, 26, 26, 0.5);
}

/* AI 解读样式 */
.ai-trigger {
  text-align: center;
  padding: 20px 0;
}

.btn-ai {
  padding: 10px 24px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.btn-ai:active {
  opacity: 0.85;
  transform: translateY(1px);
}

.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.ai-spinner {
  font-size: 24px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acc-item {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
}

.acc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  transition: background 0.2s;
}

.acc-header:active {
  background: rgba(219, 39, 119, 0.05);
}

.acc-arrow {
  font-size: 18px;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.acc-arrow.open {
  transform: rotate(90deg);
}

.acc-body {
  padding: 0 16px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.jianyi-item {
  padding: 8px 0;
  line-height: 1.6;
}
</style>
