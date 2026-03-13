<template>
  <div class="page">
    <van-nav-bar
      title="奇门遁甲"
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
          <input v-model="form.name" placeholder="请输入姓名" class="input" />
          <ProfilePicker @select="importProfile" />
        </div>
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="form.birthday" type="date" class="input" />
      </div>
      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.hour" class="input">
          <option value="" disabled>请选择</option>
          <option v-for="h in hours" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">排盘解读</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 局数信息 -->
      <div class="card ju-card">
        <div class="ju-main">{{ result.ju?.type }}{{ result.ju?.number }}局</div>
        <div class="ju-sub">{{ result.yuan }} · {{ result.timeInfo?.solarTerm }} · {{ result.timeInfo?.timeName }}</div>
        <div class="ju-sub">值符 {{ result.zhiFu?.star }}({{ result.zhiFu?.heavenlyStem }}) · 值使 {{ result.zhiShi?.gate }}</div>
      </div>

      <!-- 九宫盘面 - 优化版 -->
      <div class="card jiugong-card">
        <h3 class="card-title">九宫盘面</h3>
        <div class="grid-9-enhanced">
          <div v-for="p in sortedPalaces" :key="p.position" class="palace-cell" :class="{ 'is-zhifu': p.isZhiFu, 'is-zhishi': p.isZhiShi }">
            <!-- 顶部：宫位和神 -->
            <div class="palace-header">
              <span class="palace-name">{{ p.deity }}</span>
              <span class="palace-pos">{{ p.position }}宫</span>
              <span class="palace-trigram">{{ p.trigram }}</span>
            </div>

            <!-- 天盘：九星 -->
            <div class="palace-section sky">
              <div class="section-label">天</div>
              <div class="section-content">
                <div class="star-name">{{ p.star }}</div>
                <div class="stem-info">{{ formatStem(p.heavenlyStem) }}</div>
              </div>
            </div>

            <!-- 地盘：地支 -->
            <div class="palace-section earth">
              <div class="section-label">地</div>
              <div class="section-content">
                <div class="stem-info">{{ formatStem(p.earthlyStem) }}</div>
              </div>
            </div>

            <!-- 八门 -->
            <div class="palace-gate" :class="gateClass(p.gate)">
              {{ p.gate }}
            </div>
          </div>
        </div>
      </div>

      <!-- 吉凶格局 -->
      <div class="card" v-if="result.auspicious?.length || result.inauspicious?.length">
        <h3 class="card-title">格局判断</h3>
        <div class="pattern-list">
          <div v-for="a in result.auspicious" :key="a.name + a.position" class="pattern-item ji">
            <span class="pattern-tag">吉</span>
            <span class="pattern-text">{{ a.name }}（{{ a.type }}）{{ a.position }}宫</span>
          </div>
          <div v-for="a in result.inauspicious" :key="a.name + a.position" class="pattern-item xiong">
            <span class="pattern-tag">凶</span>
            <span class="pattern-text">{{ a.name }}（{{ a.type }}）{{ a.position }}宫</span>
          </div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">盘面解读</h3>
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
        <button class="btn-again" @click="reset">重新排盘</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="排盘解读中..." />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { reactive, ref, computed } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'
import { checkAndPromptSaveProfile } from '../utils/profileSaveCheck'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const expanded = ref<string>('zonglun')
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({ name: '', birthday: '', hour: '' })

const canSubmit = computed(() => form.name && form.birthday && form.hour !== '')

const hours = [
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

const aiSections = [
  { key: 'zonglun', label: '盘面总论' },
  { key: 'shiye', label: '事业分析' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'ganqing', label: '感情分析' },
  { key: 'jiankang', label: '健康提醒' },
  { key: 'chuxing', label: '出行方位' },
  { key: 'jixiong', label: '吉凶总断' },
]

// 九宫按洛书排列：4 9 2 / 3 5 7 / 8 1 6
const luoshuOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]
const sortedPalaces = computed(() => {
  if (!result.value?.palaces) return []
  return luoshuOrder.map(n => result.value.palaces.find((p: any) => p.position === n)).filter(Boolean)
})

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

function importProfile(p: any) {
  form.name = p.name || ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.birthday = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.hour = p.birth_hour
}

function gateClass(gate: string): string {
  if (['开门', '休门', '生门'].includes(gate)) return 'gate-ji'
  if (['死门', '惊门', '伤门'].includes(gate)) return 'gate-xiong'
  return ''
}

function formatStem(stem: any): string {
  if (Array.isArray(stem)) {
    return stem.join(' ')
  }
  return String(stem || '')
}

async function onSubmit() {
  if (!canSubmit.value) return
  // 检查是否需要保存档案
  const [y0, m0, d0] = form.birthday.split('-').map(Number)
  await checkAndPromptSaveProfile({
    name: form.name,
    birth_year: y0, birth_month: m0, birth_day: d0,
    birth_hour: Number(form.hour),
  })
  loading.value = true
  try {
    const [y, m, d] = form.birthday.split('-').map(Number)
    const res: any = await http.post('/divination/qimen', {
      name: form.name,
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthHour: Number(form.hour),
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
  await fetchAiStream('qimen', result.value, { name: form.name }, result.value?.id, {
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
.input::placeholder { color: var(--text-tertiary); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }
select.input { color: var(--text-primary); }
select.input option { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); color: var(--text-primary); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.ju-card { text-align: center; padding: 24px 20px; }
.ju-main { font-size: 22px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 500; letter-spacing: 2px; }
.ju-sub { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
/* 九宫盘面 - 优化版样式 */
.jiugong-card {
  margin: 0 16px 20px;
  padding: 20px 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.grid-9-enhanced {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.palace-cell {
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.palace-cell.is-zhifu {
  border: 2px solid rgba(219, 39, 119, 0.6);
  box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.15);
}

.palace-cell.is-zhishi {
  border: 2px solid rgba(202, 138, 4, 0.6);
  box-shadow: 0 0 0 2px rgba(202, 138, 4, 0.15);
}

.palace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.palace-name {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.palace-pos {
  font-size: 10px;
  color: var(--text-tertiary);
}

.palace-trigram {
  font-size: 10px;
  color: var(--text-tertiary);
}

.palace-section {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
}

.palace-section:last-of-type {
  border-bottom: none;
}

.palace-section.sky {
  background: rgba(219, 39, 119, 0.03);
}

.palace-section.earth {
  background: rgba(202, 138, 4, 0.03);
}

.section-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 500;
  min-width: 16px;
}

.section-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.star-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}

.stem-info {
  font-size: 11px;
  color: var(--text-secondary);
}

.palace-gate {
  padding: 6px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-secondary);
}

.palace-gate.gate-ji {
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%);
  color: #DB2777;
}

.palace-gate.gate-xiong {
  background: rgba(199, 80, 80, 0.1);
  color: #c75050;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .jiugong-card {
    margin: 0 10px 16px;
    padding: 14px 8px;
  }

  .grid-9-enhanced {
    gap: 6px;
  }

  .palace-header {
    padding: 5px 6px;
  }

  .palace-name {
    font-size: 10px;
  }

  .palace-pos,
  .palace-trigram {
    font-size: 9px;
  }

  .palace-section {
    gap: 4px;
    padding: 5px 6px;
  }

  .section-label {
    font-size: 9px;
    min-width: 14px;
  }

  .star-name {
    font-size: 12px;
  }

  .stem-info {
    font-size: 10px;
  }

  .palace-gate {
    padding: 5px 6px;
    font-size: 11px;
  }
}
.pattern-list { display: flex; flex-direction: column; gap: 8px; }
.pattern-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.pattern-tag { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.pattern-item.ji .pattern-tag { background: rgba(219, 39, 119, 0.15); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.pattern-item.xiong .pattern-tag { background: rgba(199, 80, 80, 0.15); color: #c75050; }
.pattern-text { color: var(--text-secondary); }
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
