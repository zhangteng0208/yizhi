<template>
  <div class="page">
    <header class="nav">
      <span class="back" @click="$router.back()">‹</span>
      <span class="title">灵签占验</span>
      <span class="placeholder"></span>
    </header>

    <!-- 抽签动画 -->
    <div class="draw-animation" v-if="isDrawing">
      <div class="animation-container">
        <div class="qiantong" :class="{ shaking: isShaking }">
          <div class="qiantong-body">
            <div class="qiantong-top"></div>
            <div class="qiantong-middle">
              <div class="qian" v-for="i in 8" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
            </div>
            <div class="qiantong-bottom"></div>
          </div>
        </div>
        <div class="draw-text">{{ drawText }}</div>
      </div>
    </div>

    <!-- 签桶选择 -->
    <div class="bucket-selector" v-if="!result && !isDrawing">
      <p class="selector-hint">默念所求之事，选择签桶</p>

      <div class="bucket-list">
        <div
          v-for="bucket in buckets"
          :key="bucket.id"
          class="bucket-item"
          @click="selectBucketAndDraw(bucket.id)"
          :disabled="loading"
        >
          <div class="bucket-name">{{ bucket.name }}</div>
          <div class="bucket-desc">{{ bucket.description }}</div>
        </div>
      </div>

      <div class="notice">
        <p>抽取后可在历史记录中查看</p>
      </div>
    </div>

    <!-- 抽签结果 -->
    <template v-if="result?.sign">
      <!-- 签号标题 -->
      <div class="card sign-header" :class="fortuneClass">
        <div class="sign-number">{{ result.sign.sign_number }}</div>
        <div class="sign-title">{{ result.sign.title }}</div>
        <div class="sign-fortune">{{ result.sign.fortune }}</div>
      </div>

      <!-- 签诗 -->
      <div class="card">
        <h3 class="card-title">签诗</h3>
        <div class="poem">
          <p v-for="(line, idx) in poemLines" :key="idx" class="poem-line">{{ line }}</p>
        </div>
      </div>

      <!-- 典故 -->
      <div class="card">
        <h3 class="card-title">典故</h3>
        <div class="story">{{ result.sign.story }}</div>
      </div>

      <!-- 解读 -->
      <div class="card">
        <h3 class="card-title">解读</h3>
        <div class="interpretation">
          <div class="interp-item">
            <span class="interp-label">诗意：</span>
            <span class="interp-text">{{ result.sign.interpretation }}</span>
          </div>
          <div class="interp-item">
            <span class="interp-label">含义：</span>
            <span class="interp-text">{{ result.sign.meaning }}</span>
          </div>
          <div class="interp-item advice">
            <span class="interp-label">指引：</span>
            <span class="interp-text">{{ result.sign.advice }}</span>
          </div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card" v-if="aiInterpretation">
        <h3 class="card-title">✨ AI 深度解读</h3>
        <div class="ai-content">
          <div class="ai-section" v-if="aiInterpretation.zonglun">
            <h4>签文总论</h4>
            <p>{{ aiInterpretation.zonglun }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.shiqian">
            <h4>诗签解读</h4>
            <p>{{ aiInterpretation.shiqian }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.diangu">
            <h4>典故启示</h4>
            <p>{{ aiInterpretation.diangu }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.shiye">
            <h4>事业运势</h4>
            <p>{{ aiInterpretation.shiye }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.caiyun">
            <h4>财运分析</h4>
            <p>{{ aiInterpretation.caiyun }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.ganqing">
            <h4>感情婚姻</h4>
            <p>{{ aiInterpretation.ganqing }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.jiankang">
            <h4>健康平安</h4>
            <p>{{ aiInterpretation.jiankang }}</p>
          </div>
          <div class="ai-section" v-if="aiInterpretation.jianyi && aiInterpretation.jianyi.length > 0">
            <h4>建议指引</h4>
            <ul class="advice-list">
              <li v-for="(item, index) in aiInterpretation.jianyi" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- AI 解读加载中 -->
      <div class="card" v-if="aiLoading">
        <div class="ai-loading">
          <div class="loading-spinner"></div>
          <p>AI 正在深度解读...</p>
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">再次抽签</button>
        <button class="btn-share" @click="share">分享海报</button>
      </div>
    </template>

    <LingqianPoster v-model="showPoster" :data="result" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import LingqianPoster from '@/components/LingqianPoster.vue'

interface SignBucket {
  id: string
  name: string
  description: string
}

interface SignInfo {
  id: number
  sign_number: string
  title: string
  poem: string
  story: string
  fortune: string
  interpretation: string
  meaning: string
  advice: string
}

interface DrawResult {
  bucket: { id: string; name: string }
  sign: SignInfo
  drawTime: string
  id?: string
}

const buckets = ref<SignBucket[]>([])
const selectedBucket = ref('guanyin')
const loading = ref(false)
const result = ref<DrawResult | null>(null)
const aiInterpretation = ref<any>(null)
const aiLoading = ref(false)
const isDrawing = ref(false)
const isShaking = ref(false)
const drawText = ref('诚心祈愿...')
const showPoster = ref(false)

const poemLines = computed(() => {
  if (!result.value?.sign.poem) return []
  return result.value.sign.poem.split('。').filter(line => line.trim()).map(line => line.trim() + '。')
})

const fortuneClass = computed(() => {
  if (!result.value?.sign?.fortune) return ''
  const fortune = result.value.sign.fortune
  if (fortune.includes('大吉') || fortune.includes('上上')) return 'fortune-great'
  if (fortune.includes('吉')) return 'fortune-good'
  if (fortune.includes('凶')) return 'fortune-bad'
  return 'fortune-normal'
})

async function onDraw() {
  loading.value = true
  isDrawing.value = true
  isShaking.value = false
  drawText.value = '诚心祈愿...'

  try {
    // 第一阶段：诚心祈愿 (1秒)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 第二阶段：摇签 (2秒)
    drawText.value = '摇签中...'
    isShaking.value = true
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 第三阶段：抽签 (0.5秒)
    drawText.value = '抽取灵签...'
    isShaking.value = false

    const token = localStorage.getItem('token')
    const res = await fetch('/api/divination/chouqian/draw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bucketId: selectedBucket.value }),
    })

    if (!res.ok) throw new Error('抽签失败')

    const data = await res.json()

    // 第四阶段：显示结果 (0.5秒)
    drawText.value = '灵签已出...'
    await new Promise(resolve => setTimeout(resolve, 500))

    result.value = data.data || data
    isDrawing.value = false

    // 获取 AI 解读
    fetchAiInterpretation()
  } catch (e: any) {
    isDrawing.value = false
    showToast(e.message || '抽签失败，请重试')
  } finally {
    loading.value = false
  }
}

function selectBucketAndDraw(bucketId: string) {
  if (loading.value) return
  selectedBucket.value = bucketId
  onDraw()
}

async function fetchBuckets() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/divination/chouqian/buckets', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('获取签桶失败')

    const data = await res.json()
    buckets.value = data.data || data
  } catch (e) {
    console.error('获取签桶失败:', e)
  }
}

onMounted(() => {
  fetchBuckets()
})

async function fetchAiInterpretation() {
  if (!result.value?.sign) return

  aiLoading.value = true
  aiInterpretation.value = null
  let fullText = ''

  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/divination/ai-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'chouqian',
        data: {
          signNumber: result.value.sign.sign_number,
          title: result.value.sign.title,
          poem: result.value.sign.poem,
          story: result.value.sign.story,
          fortune: result.value.sign.fortune,
          interpretation: result.value.sign.interpretation,
          meaning: result.value.sign.meaning,
          advice: result.value.sign.advice,
        },
      }),
    })

    if (!res.ok) throw new Error('AI 解读失败')

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              fullText += data.token
            } else if (data.parsed) {
              aiInterpretation.value = data.parsed
            } else if (data.fallback) {
              aiInterpretation.value = data.fallback
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    console.error('AI 解读失败:', e)
  } finally {
    aiLoading.value = false
  }
}

function reset() {
  result.value = null
  aiInterpretation.value = null
  isDrawing.value = false
  isShaking.value = false
  drawText.value = '诚心祈愿...'
}

function share() {
  showPoster.value = true
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
  justify-content: space-between;
  align-items: center;
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
  transition: color 0.2s;
}

.back:hover {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.title {
  font-size: 18px;
  font-weight: 600;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.placeholder {
  width: 28px;
}

/* 签桶选择器 */
.bucket-selector {
  padding: 24px 20px;
}

.selector-hint {
  font-size: 13px;
  color: var(--text-tertiary);
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 24px;
}

.bucket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bucket-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.bucket-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.bucket-item:hover::before,
.bucket-item:active::before {
  opacity: 1;
}

.bucket-item:hover {
  border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
}

.bucket-item:active {
  transform: scale(0.98);
}

.bucket-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.bucket-item:hover .bucket-name {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.bucket-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  position: relative;
  z-index: 1;
}

.bucket-item:hover .bucket-desc {
  color: var(--text-secondary);
}

.notice {
  text-align: center;
  margin-top: 20px;
}

.notice p {
  font-size: 12px;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.draw-btn {
  width: 200px;
  height: 56px;
  background: var(--gradient-gold);
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(219, 39, 119, 0.3);
}

.draw-btn:active {
  transform: scale(0.95);
}

.draw-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 卡片样式 */
.card {
  margin: 0 16px 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: 16px;
  border: 1px solid var(--border);
}

.card-title {
  font-size: 14px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 16px;
  letter-spacing: 2px;
  font-weight: 500;
}

/* 签头 */
.sign-header {
  text-align: center;
  padding: 32px 20px;
}

.sign-number {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.sign-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 4px;
}

.fortune-great .sign-title {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fortune-good .sign-title {
  color: #4ade80;
}

.fortune-bad .sign-title {
  color: #f87171;
}

.fortune-normal .sign-title {
  color: #94a3b8;
}

.sign-fortune {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(219, 39, 119, 0.15);
  border-radius: 20px;
  font-size: 14px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: 2px;
}

/* 签诗 */
.poem {
  font-family: 'Songti SC', 'SimSun', serif;
}

.poem-line {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 2;
  text-align: center;
  letter-spacing: 2px;
}

/* 典故 */
.story {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* 解读 */
.interpretation {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.interp-item {
  display: flex;
  gap: 8px;
}

.interp-label {
  font-size: 14px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  white-space: nowrap;
  letter-spacing: 1px;
}

.interp-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.advice .interp-text {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-weight: 500;
}

/* AI 解读 */
.ai-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-section h4 {
  font-size: 15px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0;
}

.ai-section p {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.8;
  margin: 0;
  text-align: justify;
}

.advice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advice-list li {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.advice-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-weight: bold;
}


.ai-loading {
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: #DB2777;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-loading p {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 按钮 */
.actions {
  padding: 20px 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-again {
  flex: 1;
  padding: 14px 40px;
  background: transparent;
  border: 1px solid rgba(219, 39, 119, 0.5);
  border-radius: 25px;
  font-size: 15px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 2px;
}

.btn-again:active {
  background: rgba(219, 39, 119, 0.1);
  transform: scale(0.98);
}

.btn-share {
  flex: 1;
  padding: 14px 40px;
  background: linear-gradient(135deg, #8B0000 0%, #DAA520 100%);
  border: none;
  border-radius: 25px;
  font-size: 15px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
}

.btn-share:active {
  opacity: 0.85;
  transform: scale(0.98);
}

/* 抽签动画 */
.draw-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* 签筒 */
.qiantong {
  position: relative;
  width: 180px;
  height: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.qiantong-body {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 签筒顶部 */
.qiantong-top {
  width: 100%;
  height: 30px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border-radius: 15px 15px 0 0;
  border: 2px solid #8b6f47;
  border-bottom: none;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.qiantong-top::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 3px;
  background: #8b6f47;
  border-radius: 2px;
}

/* 签筒中部 */
.qiantong-middle {
  flex: 1;
  width: 100%;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border-left: 2px solid #8b6f47;
  border-right: 2px solid #8b6f47;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 10px 15px;
  gap: 8px;
  box-shadow:
    inset 2px 0 4px rgba(0, 0, 0, 0.2),
    inset -2px 0 4px rgba(0, 0, 0, 0.2);
}

/* 签筒纹理 */
.qiantong-middle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10px,
    rgba(139, 111, 71, 0.1) 10px,
    rgba(139, 111, 71, 0.1) 11px
  );
  pointer-events: none;
}

/* 签条 */
.qian {
  width: 6px;
  height: 60px;
  background: linear-gradient(180deg, #f5e6d3 0%, #e8d4b8 100%);
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  position: relative;
}

.qian::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 50px;
  background: rgba(139, 111, 71, 0.3);
}

/* 摇签动画 */
.shaking .qian {
  animation: qianShake 0.15s ease-in-out infinite;
}

@keyframes qianShake {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-3px) rotate(-2deg);
  }
  75% {
    transform: translateY(-3px) rotate(2deg);
  }
}

.shaking {
  animation: qiantongShake 0.3s ease-in-out infinite;
}

@keyframes qiantongShake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

/* 签筒底部 */
.qiantong-bottom {
  width: 100%;
  height: 25px;
  background: linear-gradient(135deg, #a67c52 0%, #8b6f47 100%);
  border-radius: 0 0 12px 12px;
  border: 2px solid #8b6f47;
  border-top: none;
  box-shadow:
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

/* 抽签文字 */
.draw-text {
  font-size: 18px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: 4px;
  animation: textPulse 1.5s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

</style>
