<template>
  <div class="page">
    <van-nav-bar
      title="梅花易数"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 输入表单 -->
    <div class="form" v-if="!result">
      <div class="field">
        <label>姓名</label>
        <div class="input-with-icon">
          <input v-model="name" placeholder="请输入姓名" class="input" />
          <ProfilePicker @select="importProfile" />
        </div>
      </div>
      <div class="field">
        <label>姓氏字数</label>
        <div class="toggle-row">
          <button v-for="n in [1, 2]" :key="n" class="toggle-btn" :class="{ active: xingLen === n }" @click="xingLen = n">
            {{ n === 1 ? '单姓' : '复姓' }}
          </button>
        </div>
      </div>
      <button class="submit" :disabled="!name.trim()" @click="onSubmit">起卦</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 本卦 - 横向排列 -->
      <div class="card gua-main-enhanced">
        <div class="gua-name-large">{{ result.benGua.name }}</div>

        <div class="gua-symbols-horizontal">
          <div class="gua-symbol-item">
            <div class="symbol-label">上卦</div>
            <div class="symbol-char">{{ result.shangGua.symbol }}</div>
            <div class="symbol-name">{{ result.shangGua.name }}</div>
          </div>
          <div class="gua-symbol-item">
            <div class="symbol-label">下卦</div>
            <div class="symbol-char">{{ result.xiaGua.symbol }}</div>
            <div class="symbol-name">{{ result.xiaGua.name }}</div>
          </div>
        </div>

        <div class="gua-ci-enhanced">{{ result.benGua.guaci }}</div>
      </div>

      <!-- 周易原文 -->
      <div class="card">
        <h3 class="card-title">周易原文</h3>
        <div class="zhouyi-content">
          <div class="zhouyi-section">
            <div class="section-label">彖辞</div>
            <div class="section-text">{{ result.benGua.tuan }}</div>
          </div>
          <div class="zhouyi-section">
            <div class="section-label">象辞</div>
            <div class="section-text">{{ result.benGua.xiang }}</div>
          </div>
          <div class="zhouyi-section">
            <div class="section-label">爻辞</div>
            <div class="yao-list">
              <div v-for="(yao, i) in result.benGua.yao" :key="i" class="yao-item">
                {{ yao }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 笔画详情 -->
      <div class="card">
        <h3 class="card-title">康熙笔画</h3>
        <div class="stroke-row">
          <span v-for="s in result.strokes" :key="s.char" class="stroke-item">
            <span class="stroke-char">{{ s.char }}</span>
            <span class="stroke-num">{{ s.stroke }}</span>
          </span>
        </div>
        <div class="stroke-meta">
          <span>姓 {{ result.xingTotal }} 画 → 上卦</span>
          <span>名 {{ result.mingTotal }} 画 → 下卦</span>
          <span>总 {{ result.totalStrokes }} 画 → 动爻第{{ result.dongYao }}爻</span>
        </div>
      </div>

      <!-- 卦象信息 -->
      <div class="card">
        <h3 class="card-title">卦象</h3>
        <div class="gua-info">
          <div class="gua-row">
            <span class="gua-label">上卦</span>
            <span class="gua-value">{{ result.shangGua.symbol }} {{ result.shangGua.name }}（{{ result.shangGua.xiangtian }}）· {{ result.shangGua.wuxing }} · {{ result.shangGua.fangwei }}</span>
          </div>
          <div class="gua-row">
            <span class="gua-label">下卦</span>
            <span class="gua-value">{{ result.xiaGua.symbol }} {{ result.xiaGua.name }}（{{ result.xiaGua.xiangtian }}）· {{ result.xiaGua.wuxing }} · {{ result.xiaGua.fangwei }}</span>
          </div>
          <div class="gua-row">
            <span class="gua-label">动爻</span>
            <span class="gua-value">第 {{ result.dongYao }} 爻</span>
          </div>
        </div>
      </div>

      <!-- 变卦 & 互卦 -->
      <div class="card">
        <h3 class="card-title">变卦 · 互卦</h3>
        <div class="gua-info">
          <div class="gua-row">
            <span class="gua-label">变卦</span>
            <span class="gua-value">{{ result.bianGua.name }}</span>
          </div>
          <div class="gua-row gua-ci-row">{{ result.bianGua.guaci }}</div>
          <div class="gua-row">
            <span class="gua-label">互卦</span>
            <span class="gua-value">{{ result.huGua.name }}</span>
          </div>
          <div class="gua-row gua-ci-row">{{ result.huGua.guaci }}</div>
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
                <span>行动建议</span>
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
        <button class="btn-share" @click="share">分享海报</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <MeihuaPoster v-model="showPoster" :data="result" :name="name" />

    <LoadingOverlay :visible="loading" text="起卦中..." />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import MeihuaPoster from '@/components/MeihuaPoster.vue'
import { ref } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'

const name = ref('')
const xingLen = ref(1)
const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const isTyping = ref(false)
const displayedContent = ref<any>({})
const expanded = ref<string>('zonglun')
const showPoster = ref(false)

const aiSections = [
  { key: 'zonglun', label: '卦象总论' },
  { key: 'shiye', label: '事业发展' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'ganqing', label: '感情婚姻' },
  { key: 'guiren', label: '贵人助力' },
  { key: 'jinggao', label: '卦象警示' },
]

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

function importProfile(p: any) {
  name.value = p.name || ''
}

async function onSubmit() {
  if (!name.value.trim()) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/meihua', {
      name: name.value.trim(),
      xingLength: xingLen.value,
    })
    result.value = res.data ?? res
    loading.value = false
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
  await fetchAiStream('meihua', result.value, undefined, result.value?.id, {
    onParsed(parsed) {
      result.value = { ...result.value, ai: parsed }
      aiLoading.value = false
      // 开始打字机效果
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

  // 按顺序显示每个部分
  for (const sec of aiSections) {
    if (content[sec.key]) {
      await typeText(sec.key, content[sec.key])
    }
  }

  // 显示建议
  if (content.jianyi) {
    displayedContent.value.jianyi = content.jianyi
  }

  isTyping.value = false
}

async function typeText(key: string, text: string) {
  displayedContent.value[key] = ''
  for (let i = 0; i < text.length; i++) {
    displayedContent.value[key] += text[i]
    await new Promise(resolve => setTimeout(resolve, 20)) // 20ms 每个字符
  }
}

function reset() {
  result.value = null
  name.value = ''
}

function share() {
  showPoster.value = true
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
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }
.toggle-row { display: flex; gap: 10px; }
.toggle-btn { flex: 1; height: 44px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(20px); }
.toggle-btn.active { border-color: #DB2777; color: #DB2777; background: rgba(219, 39, 119, 0.1); box-shadow: 0 0 12px rgba(219, 39, 119, 0.3); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
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

/* 旧样式保留用于其他卡片 */
/* 旧样式保留用于其他卡片 */
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }

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

/* 周易原文样式 */
.zhouyi-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.zhouyi-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  color: #DB2777;
  font-weight: 500;
  letter-spacing: 1px;
}

.section-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.yao-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.yao-item {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 12px;
  border-left: 2px solid rgba(219, 39, 119, 0.2);
}

.stroke-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.stroke-item { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 40px; }
.stroke-char { font-size: 18px; color: var(--text-primary); }
.stroke-num { font-size: 12px; color: #DB2777; }
.stroke-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-secondary); }
.gua-info { display: flex; flex-direction: column; gap: 12px; }
.gua-row { display: flex; font-size: 13px; gap: 12px; }
.gua-label { color: var(--text-secondary); white-space: nowrap; }
.gua-value { color: var(--text-primary); }
.gua-ci-row { font-size: 12px; color: var(--text-secondary); line-height: 1.6; padding-left: 0; }
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
.btn-share { flex: 1; height: 44px; background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(44, 83, 100, 0.3); transition: all 0.2s; }
.btn-share:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-back:active { background: rgba(26, 26, 26, 0.5); }
</style>
