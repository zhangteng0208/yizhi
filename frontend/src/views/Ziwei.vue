<template>
  <div class="page">
    <van-nav-bar
      title="紫微斗数"
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
        <label>性别</label>
        <div class="toggle-row">
          <button v-for="g in ['男', '女']" :key="g" class="toggle-btn" :class="{ active: form.gender === g }" @click="form.gender = g">{{ g }}</button>
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
      <div class="field">
        <label>历法</label>
        <div class="toggle-row">
          <button v-for="c in ['公历', '农历']" :key="c" class="toggle-btn" :class="{ active: form.calendar === c }" @click="form.calendar = c">{{ c }}</button>
        </div>
      </div>
      <div class="field">
        <label>出生地</label>
        <input v-model="form.birthplace" placeholder="如：北京、上海、广州" class="input" @blur="geocode" />
        <span v-if="birthCoords" class="coords-hint">经度 {{ birthCoords.lng.toFixed(2) }}° 纬度 {{ birthCoords.lat.toFixed(2) }}°</span>
      </div>
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">排盘解读</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 基本信息 -->
      <div class="card info-card">
        <div class="info-row"><span class="info-label">姓名</span><span class="info-value">{{ form.name }}</span></div>
        <div class="info-row"><span class="info-label">阳历</span><span class="info-value">{{ result.solarDate }}</span></div>
        <div class="info-row"><span class="info-label">农历</span><span class="info-value">{{ result.lunarDate }}</span></div>
        <div class="info-row"><span class="info-label">生肖/星座</span><span class="info-value">{{ result.zodiac }} · {{ result.sign }}</span></div>
        <div class="info-row"><span class="info-label">五行局</span><span class="info-value gold">{{ result.fiveElementsClass }}</span></div>
        <div class="info-row"><span class="info-label">命主/身主</span><span class="info-value gold">{{ result.soul }} / {{ result.body }}</span></div>
        <div class="info-row"><span class="info-label">命宫主星</span><span class="info-value gold">{{ result.mingMainStar }}</span></div>
        <div class="info-row" v-if="result.birthplace"><span class="info-label">出生地</span><span class="info-value">{{ result.birthplace }}<template v-if="result.lat != null"> ({{ result.lng.toFixed(2) }}°, {{ result.lat.toFixed(2) }}°)</template></span></div>
      </div>

      <!-- 十二宫 -->
      <div class="card">
        <h3 class="card-title">十二宫星曜</h3>
        <div class="palace-grid">
          <div v-for="p in result.palaces" :key="p.name" class="palace-cell" :class="{ highlight: p.name === '命宫' }">
            <div class="palace-header">
              <span class="palace-name">{{ p.name }}</span>
              <span class="palace-gz">{{ p.heavenlyStem }}{{ p.earthlyBranch }}</span>
            </div>
            <div class="palace-majors" v-if="p.majorStars?.length">
              <span v-for="s in p.majorStars" :key="s.name" class="palace-star major">{{ s.name }}<sup>{{ s.brightness }}</sup></span>
            </div>
            <div class="palace-minors" v-if="p.minorStars?.length">
              <span v-for="m in p.minorStars" :key="m" class="palace-star minor">{{ m }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 命迁线 & 夫官线 -->
      <div class="card" v-if="axisLines.length">
        <h3 class="card-title">重要宫位轴线</h3>
        <div class="axis-list">
          <div v-for="axis in axisLines" :key="axis.label" class="axis-item">
            <div class="axis-label">{{ axis.label }}</div>
            <div class="axis-desc">{{ axis.desc }}</div>
            <div class="axis-palaces">
              <div v-for="p in axis.palaces" :key="p.name" class="axis-palace">
                <span class="axis-palace-name">{{ p.name }}</span>
                <span class="axis-palace-gz">{{ p.heavenlyStem }}{{ p.earthlyBranch }}</span>
                <div class="axis-palace-stars">
                  <span v-for="s in p.majorStars" :key="s.name" class="palace-star major">{{ s.name }}<sup>{{ s.brightness }}</sup></span>
                </div>
              </div>
              <span class="axis-connector">⟷</span>
            </div>
            <div class="axis-ai" v-if="result.ai?.[axis.aiKey]">{{ result.ai[axis.aiKey] }}</div>
          </div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">命盘解读</h3>
        <!-- 综合得分 -->
        <div class="ai-score-section" v-if="result.ai?.score">
          <div class="ai-score-wrap">
            <div class="taiji-bg"></div>
            <span class="ai-score">{{ result.ai.score }}</span>
          </div>
          <span class="ai-score-label">综合得分</span>
        </div>
        <div v-if="!result.ai && !aiLoading" class="ai-trigger">
          <button class="btn-ai" @click="fetchAiInterpretation">分析详解</button>
        </div>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <span class="ai-spinner"><BrandLogo /></span>
          <span>卦象解析中...</span>
        </div>
        <div v-if="result.ai" class="accordion">
          <div v-for="sec in aiSections" :key="sec.key" class="acc-item" v-show="result.ai[sec.key]">
            <div class="acc-header" @click="toggle(sec.key)">
              <span>{{ sec.label }}</span>
              <span class="acc-arrow" :class="{ open: expanded === sec.key }">›</span>
            </div>
            <div v-if="expanded === sec.key" class="acc-body">{{ result.ai[sec.key] }}</div>
          </div>
        </div>
      </div>

      <!-- 改运建议 -->
      <div class="card" v-if="result.ai?.advice">
        <h3 class="card-title">改运建议</h3>
        <div class="advice-list">
          <div class="advice-row"><span class="advice-label">吉利方位</span><span class="advice-value">{{ result.ai.advice.luckyDirection }}</span></div>
          <div class="advice-row"><span class="advice-label">幸运五行</span><span class="advice-value">{{ result.ai.advice.luckyElement }}</span></div>
          <div class="advice-row"><span class="advice-label">宜</span><span class="advice-value long">{{ fmt(result.ai.advice.suitable) }}</span></div>
          <div class="advice-row"><span class="advice-label">忌</span><span class="advice-value long">{{ fmt(result.ai.advice.avoid) }}</span></div>
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

const form = reactive({
  name: '',
  gender: '',
  birthday: '',
  hour: '',
  calendar: '公历',
  birthplace: '',
})

const birthCoords = ref<{ lat: number; lng: number } | null>(null)

const canSubmit = computed(() => form.name && form.gender && form.birthday && form.hour !== '')

const axisLines = computed(() => {
  if (!result.value?.palaces) return []
  const palaces = result.value.palaces as any[]
  const find = (name: string) => palaces.find((p: any) => p.name === name)
  const lines = []
  const ming = find('命宫')
  const qianyi = find('迁移')
  if (ming && qianyi) {
    lines.push({ label: '命迁线', desc: '内在格局 ⟷ 外在发展', palaces: [ming, qianyi], aiKey: 'mingqian' })
  }
  const fuqi = find('夫妻')
  const guanlu = find('官禄')
  if (fuqi && guanlu) {
    lines.push({ label: '夫官线', desc: '感情婚姻 ⟷ 事业仕途', palaces: [fuqi, guanlu], aiKey: 'fuguanxian' })
  }
  return lines
})

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
  { key: 'zonglun', label: '命盘总论' },
  { key: 'xingge', label: '性格分析' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'jiankang', label: '健康分析' },
  { key: 'liunian', label: '流年分析' },
  { key: 'yanzheng', label: '过往验证' },
]

function toggle(key: string) {
  expanded.value = expanded.value === key ? '' : key
}

function formatStars(p: any): string {
  const majors = p.majorStars?.map((s: any) => s.name + '(' + s.brightness + ')').join(' ') || ''
  const minors = p.minorStars?.length > 0 ? p.minorStars.join(' ') : ''
  return [majors, minors].filter(Boolean).join(' · ') || '—'
}

function fmt(val: any): string {
  if (Array.isArray(val)) return val.join('、')
  return String(val ?? '')
}

async function geocode() {
  if (!form.birthplace.trim()) { birthCoords.value = null; return }
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.birthplace)}&format=json&limit=1&accept-language=zh`)
    const data = await resp.json()
    if (data.length > 0) {
      birthCoords.value = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } else {
      birthCoords.value = null
    }
  } catch { birthCoords.value = null }
}

function importProfile(p: any) {
  form.name = p.name || ''
  form.gender = p.gender === 1 ? '男' : p.gender === 2 ? '女' : ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.birthday = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.hour = p.birth_hour
  form.calendar = p.is_lunar ? '农历' : '公历'
  form.birthplace = p.birth_city || p.birth_province || ''
  if (p.birth_lat != null) {
    birthCoords.value = { lat: p.birth_lat, lng: p.birth_lng }
  }
}

async function onSubmit() {
  if (!canSubmit.value) return
  if (form.birthplace && !birthCoords.value) await geocode()
  // 检查是否需要保存档案
  const [y0, m0, d0] = form.birthday.split('-').map(Number)
  await checkAndPromptSaveProfile({
    name: form.name,
    gender: form.gender === '男' ? 1 : 2,
    birth_year: y0, birth_month: m0, birth_day: d0,
    birth_hour: Number(form.hour),
    is_lunar: form.calendar === '农历',
    birth_city: form.birthplace || undefined,
    birth_lat: birthCoords.value?.lat,
    birth_lng: birthCoords.value?.lng,
  })
  loading.value = true
  try {
    const [y, m, d] = form.birthday.split('-').map(Number)
    const res: any = await http.post('/divination/ziwei', {
      name: form.name,
      gender: form.gender === '男' ? 1 : 2,
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthHour: Number(form.hour),
      isLunar: form.calendar === '农历',
      birthplace: form.birthplace || undefined,
      lat: birthCoords.value?.lat,
      lng: birthCoords.value?.lng,
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
  await fetchAiStream('ziwei', result.value, {
    name: form.name, birthplace: form.birthplace, lat: birthCoords.value?.lat, lng: birthCoords.value?.lng,
  }, result.value?.id, {
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

  if (content.mingqian) {
    displayedContent.value.mingqian = content.mingqian
  }
  if (content.fuguanxian) {
    displayedContent.value.fuguanxian = content.fuguanxian
  }
  if (content.score) {
    displayedContent.value.score = content.score
  }
  if (content.advice) {
    displayedContent.value.advice = content.advice
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
.toggle-row { display: flex; gap: 10px; }
.toggle-btn { flex: 1; height: 44px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(20px); }
.toggle-btn.active { border-color: #DB2777; color: #DB2777; background: rgba(219, 39, 119, 0.1); box-shadow: 0 0 12px rgba(219, 39, 119, 0.3); }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
.coords-hint { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
.ai-score-section { display: flex; flex-direction: column; align-items: center; padding: 16px 0 20px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
.ai-score-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.taiji-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 72px; height: 72px; border-radius: 50%; opacity: 0.3; background: radial-gradient(circle at 50% 25%, #DB2777 12%, transparent 12.5%), radial-gradient(circle at 50% 75%, var(--bg-primary) 12%, transparent 12.5%), radial-gradient(circle at 50% 25%, var(--bg-primary) 25%, transparent 25.5%), radial-gradient(circle at 50% 75%, #DB2777 25%, transparent 25.5%), linear-gradient(to right, #DB2777 50%, var(--bg-primary) 50%); animation: taiji-spin 30s linear infinite; }
@keyframes taiji-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.ai-score { font-size: 38px; font-weight: 600; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; font-variant-numeric: tabular-nums; position: relative; z-index: 1; }
.ai-score-label { font-size: 12px; color: var(--text-secondary); margin-top: 6px; letter-spacing: 2px; }
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
.info-card { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-label { color: var(--text-secondary); }
.info-value { color: var(--text-primary); }
.info-value.gold { background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.palace-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.palace-cell { display: flex; flex-direction: column; gap: 6px; padding: 10px 8px; background: var(--bg-primary); border-radius: 8px; border: 1px solid transparent; min-height: 80px; }
.palace-cell.highlight { border-background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background: rgba(219, 39, 119, 0.1); }
.palace-header { display: flex; justify-content: space-between; align-items: center; }
.palace-name { font-size: 12px; font-weight: 500; color: var(--text-primary); }
.palace-gz { font-size: 10px; color: var(--text-tertiary); }
.palace-majors { display: flex; flex-wrap: wrap; gap: 4px; }
.palace-star.major { font-size: 11px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.palace-star.major sup { font-size: 8px; color: var(--text-tertiary); margin-left: 1px; }
.palace-minors { display: flex; flex-wrap: wrap; gap: 3px; }
.palace-star.minor { font-size: 9px; color: var(--text-secondary); }
.axis-list { display: flex; flex-direction: column; gap: 16px; }
.axis-item { display: flex; flex-direction: column; gap: 8px; }
.axis-label { font-size: 14px; font-weight: 500; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.axis-desc { font-size: 11px; color: var(--text-tertiary); }
.axis-palaces { display: flex; align-items: center; gap: 8px; }
.axis-palace { flex: 1; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 4px; }
.axis-palace-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.axis-palace-gz { font-size: 10px; color: var(--text-tertiary); }
.axis-palace-stars { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.axis-connector { color: var(--text-tertiary); font-size: 16px; flex-shrink: 0; }
.axis-ai { font-size: 12px; color: var(--text-secondary); line-height: 1.8; margin-top: 4px; padding-top: 8px; border-top: 1px dashed var(--border); }
.accordion { display: flex; flex-direction: column; }
.acc-item { border-bottom: 1px solid var(--border); }
.acc-item:last-child { border-bottom: none; }
.acc-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: var(--text-primary); cursor: pointer; }
.acc-arrow { font-size: 16px; color: var(--text-secondary); transition: transform 0.2s; }
.acc-arrow.open { transform: rotate(90deg); }
.acc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; padding-bottom: 14px; }
.ai-trigger { text-align: center; padding: 20px 0; }
.btn-ai { height: 44px; padding: 0 32px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-ai:active { opacity: 0.85; transform: translateY(1px); }
.ai-loading { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.ai-spinner { display: inline-block; font-size: 24px; animation: spin 2s linear infinite; margin-right: 8px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.advice-list { display: flex; flex-direction: column; gap: 12px; }
.advice-row { display: flex; font-size: 13px; gap: 12px; }
.advice-label { color: var(--text-secondary); white-space: nowrap; }
.advice-value { color: var(--text-primary); flex: 1; }
.advice-value.long { text-align: left; font-size: 12px; line-height: 1.6; }
.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-again { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }
</style>
