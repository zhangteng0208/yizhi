<template>
  <div class="page">
    <van-nav-bar
      title="皇极天数"
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
          <input v-model="form.name" placeholder="请输入姓名（2-4字）" class="input" @keyup.enter="onSubmit" />
          <ProfilePicker @select="importProfile" />
        </div>
      </div>
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">开始推算</button>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 卦象概览 -->
      <div class="card summary-card">
        <div class="summary-name-row">
          <span class="summary-char" v-for="(c, i) in strokeDetail" :key="i">
            <span class="char-text">{{ c.char }}</span>
            <span class="char-strokes">{{ c.strokes }}</span>
          </span>
        </div>
        <div class="summary-id">第{{ result.id }}数</div>
        <div class="gua-row">
          <div class="gua-col">
            <span class="gua-label gua-label-xian">先天</span>
            <span class="gua-name">{{ result.xiantianName }}</span>
            <div class="gua-symbol">
              <div v-for="(line, i) in result.xiantianLines" :key="'x'+i" class="gua-line" :class="{ broken: line === 0 }">
                <template v-if="line === 0"><span></span><span></span></template>
              </div>
            </div>
          </div>
          <div class="gua-divider">→</div>
          <div class="gua-col">
            <span class="gua-label gua-label-hou">后天</span>
            <span class="gua-name">{{ result.houtianName }}</span>
            <div class="gua-symbol">
              <div v-for="(line, i) in result.houtianLines" :key="'h'+i" class="gua-line" :class="{ broken: line === 0 }">
                <template v-if="line === 0"><span></span><span></span></template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 道品义慧财 五维 -->
      <div class="card">
        <h3 class="card-title">五维解析</h3>
        <div class="dim-grid">
          <div class="dim-item" v-for="dim in dimensions" :key="dim.key">
            <div class="dim-header">
              <span class="dim-char" :class="'wx-' + dim.wuxing">{{ dim.key }}</span>
              <span class="dim-wx-badge" :class="'wx-bg-' + dim.wuxing">{{ dim.wuxing }}</span>
            </div>
            <div class="dim-bars">
              <div class="dim-bar-row">
                <span class="dim-bar-label">正</span>
                <div class="dim-bar-track">
                  <div class="dim-bar-fill zheng" :style="{ width: dim.zheng === 2 ? '100%' : dim.zheng === 1 ? '50%' : '0%' }"></div>
                </div>
                <span class="dim-bar-val" :class="{ highlight: dim.zheng === 2 }">{{ dim.zheng === 2 ? '双' : dim.zheng === 1 ? '有' : '无' }}</span>
              </div>
              <div class="dim-bar-row">
                <span class="dim-bar-label">偏</span>
                <div class="dim-bar-track">
                  <div class="dim-bar-fill pian" :style="{ width: dim.pian === 2 ? '100%' : dim.pian === 1 ? '50%' : '0%' }"></div>
                </div>
                <span class="dim-bar-val" :class="{ highlight: dim.pian === 2 }">{{ dim.pian === 2 ? '双' : dim.pian === 1 ? '有' : '无' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-again" @click="reset">重新查询</button>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="推算中..." />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'

const loading = ref(false)
const result = ref<any>(null)
const strokeDetail = ref<{ char: string; strokes: number }[]>([])

const form = reactive({ name: '' })

const canSubmit = computed(() => {
  const n = form.name.trim()
  return n.length >= 2 && n.length <= 4
})

// --- 字典数据缓存 ---
let dictCache: Record<string, number> | null = null

async function loadDict(): Promise<Record<string, number>> {
  if (dictCache) return dictCache
  const res = await fetch('/dictionary.xml')
  const text = await res.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')
  const map: Record<string, number> = {}
  xml.querySelectorAll('dictionaryItem').forEach(item => {
    const strokes = parseInt(item.getAttribute('strokes') || '0')
    const chars = (item.textContent || '').trim().split(/\s+/)
    chars.forEach(c => { if (c) map[c] = strokes })
  })
  dictCache = map
  return map
}

let guaDataCache: any[] | null = null

async function loadGuaData(): Promise<any[]> {
  if (guaDataCache) return guaDataCache
  const res = await fetch('/64.json')
  guaDataCache = await res.json()
  return guaDataCache!
}

// --- 复姓判断 ---
function isCompoundSurname(name: string): boolean {
  const regex = /^(欧阳|司马|端木|上官|东方|独孤|南宫|夏侯|诸葛|尉迟|皇甫|公羊|慕容|宇文|轩辕|令狐|钟离|司徒|长孙|叔孙|公孙|仲孙|鲜于|闾丘|司空|亓官|司寇|子车|颛孙|巫马|公西|漆雕|乐正|壤驷|公良|拓拔|夹谷|宰父|谷梁|百里|东郭|南门|呼延|羊舌|微生|梁丘|左丘|东门|西门)/
  return regex.test(name)
}

// --- 核心算法：根据笔画计算卦数 ---
function calcGuaId(strokeList: number[]): number {
  let upper: number, lower: number
  if (strokeList.length === 2) {
    const [a, b] = strokeList
    lower = ((b + 1) % 8 !== 0 && (b + 1) >= 8) ? (b + 1) % 8 : 8
    upper = ((a + b) % 8 !== 0 && (a + b) >= 8) ? (a + b) % 8 : 8
    // Fix: if value <= 8, use 8
    if (b + 1 <= 8) lower = 8
    if (a + b <= 8) upper = 8
    // Recalc using original logic
    lower = ((b + 1) % 8 === 0 || (b + 1) <= 8) ? 8 : (b + 1) % 8
    upper = ((a + b) % 8 === 0 || (a + b) <= 8) ? 8 : (a + b) % 8
  } else if (strokeList.length === 3) {
    const [a, b, c] = strokeList
    if (isCompoundSurname('')) {
      // 复姓情况暂不处理，用通用逻辑
      lower = ((b + c) % 8 === 0 || (b + c) <= 8) ? 8 : (b + c) % 8
      upper = ((a + lower) % 8 === 0 || (a + lower) <= 8) ? 8 : (a + lower) % 8
    } else {
      lower = ((b + c) % 8 === 0 || (b + c) <= 8) ? 8 : (b + c) % 8
      upper = ((a + lower) % 8 === 0 || (a + lower) <= 8) ? 8 : (a + lower) % 8
    }
  } else if (strokeList.length === 4) {
    const [a, b, c, d] = strokeList
    lower = ((c + d) % 8 === 0 || (c + d) <= 8) ? 8 : (c + d) % 8
    upper = ((a + b + lower) % 8 === 0 || (a + b + lower) <= 8) ? 8 : (a + b + lower) % 8
  } else {
    return 88 // fallback 坤为地
  }
  return upper * 10 + lower
}

// --- 实际的复姓版本 ---
function calcGuaIdWithName(name: string, strokeList: number[]): number {
  let upper: number, lower: number
  if (strokeList.length === 2) {
    const [a, b] = strokeList
    lower = ((b + 1) % 8 === 0 || (b + 1) <= 8) ? 8 : (b + 1) % 8
    upper = ((a + b) % 8 === 0 || (a + b) <= 8) ? 8 : (a + b) % 8
  } else if (strokeList.length === 3) {
    const [a, b, c] = strokeList
    if (isCompoundSurname(name)) {
      lower = (c % 8 === 0 || c <= 8) ? 8 : c % 8
      const sum = a + b + lower
      upper = (sum % 8 === 0 || sum <= 8) ? 8 : sum % 8
    } else {
      lower = ((b + c) % 8 === 0 || (b + c) <= 8) ? 8 : (b + c) % 8
      upper = ((a + lower) % 8 === 0 || (a + lower) <= 8) ? 8 : (a + lower) % 8
    }
  } else if (strokeList.length === 4) {
    const [a, b, c, d] = strokeList
    lower = ((c + d) % 8 === 0 || (c + d) <= 8) ? 8 : (c + d) % 8
    upper = ((a + b + lower) % 8 === 0 || (a + b + lower) <= 8) ? 8 : (a + b + lower) % 8
  } else {
    return 88
  }
  return upper * 10 + lower
}

// --- 卦名映射 ---
const guaNameMap: Record<string, string> = {
  '乾乾': '乾为天', '乾兑': '天泽履', '乾离': '天火同人', '乾震': '天雷无妄',
  '乾巽': '天风姤', '乾坎': '天水讼', '乾艮': '天山遁', '乾坤': '天地否',
  '兑乾': '泽天夬', '兑兑': '兑为泽', '兑离': '泽火革', '兑震': '泽雷随',
  '兑巽': '泽风大过', '兑坎': '泽水困', '兑艮': '泽山咸', '兑坤': '泽地萃',
  '离乾': '火天大有', '离兑': '火泽睽', '离离': '离为火', '离震': '火雷噬嗑',
  '离巽': '火风鼎', '离坎': '火水未济', '离艮': '火山旅', '离坤': '火地晋',
  '震乾': '雷天大壮', '震兑': '雷泽归妹', '震离': '雷火丰', '震震': '震为雷',
  '震巽': '雷风恒', '震坎': '雷水解', '震艮': '雷山小过', '震坤': '雷地豫',
  '巽乾': '风天小畜', '巽兑': '风泽中孚', '巽离': '风火家人', '巽震': '风雷益',
  '巽巽': '巽为风', '巽坎': '风水涣', '巽艮': '风山渐', '巽坤': '风地观',
  '坎乾': '水天需', '坎兑': '水泽节', '坎离': '水火既济', '坎震': '水雷屯',
  '坎巽': '水风井', '坎坎': '坎为水', '坎艮': '水山蹇', '坎坤': '水地比',
  '艮乾': '山天大畜', '艮兑': '山泽损', '艮离': '山火贲', '艮震': '山雷颐',
  '艮巽': '山风蛊', '艮坎': '山水蒙', '艮艮': '艮为山', '艮坤': '山地剥',
  '坤乾': '地天泰', '坤兑': '地泽临', '坤离': '地火明夷', '坤震': '地雷复',
  '坤巽': '地风升', '坤坎': '地水师', '坤艮': '地山谦', '坤坤': '坤为地',
}

// 后天八卦数字到卦名 (后天：艮1 坎2 巽3 震4 离5 兑6 乾7 坤8)
const houtianGua = ['', '艮', '坎', '巽', '震', '离', '兑', '乾', '坤']
// 先天八卦数字到卦名 (先天：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8)
const xiantianGua = ['', '乾', '兑', '离', '震', '巽', '坎', '艮', '坤']

// 三爻：1=阳 0=阴
const guaLines: Record<string, number[]> = {
  '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
  '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0],
}

function getGuaLines(upper: string, lower: string): number[] {
  return [...(guaLines[upper] || []), ...(guaLines[lower] || [])]
}

// --- 五维数据 ---
const dimensions = computed(() => {
  if (!result.value) return []
  const r = result.value.data
  return [
    { key: '道', zheng: r.道.正, pian: r.道.偏, wuxing: r.道.五行 },
    { key: '品', zheng: r.品.正, pian: r.品.偏, wuxing: r.品.五行 },
    { key: '义', zheng: r.义.正, pian: r.义.偏, wuxing: r.义.五行 },
    { key: '慧', zheng: r.慧.正, pian: r.慧.偏, wuxing: r.慧.五行 },
    { key: '财', zheng: r.财.正, pian: r.财.偏, wuxing: r.财.五行 },
  ]
})

function importProfile(p: any) {
  form.name = p.name || ''
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const [dict, guaData] = await Promise.all([loadDict(), loadGuaData()])
    const chars = form.name.trim().split('')
    const strokes: number[] = []
    const detail: { char: string; strokes: number }[] = []

    for (const c of chars) {
      const s = dict[c]
      if (s === undefined) {
        alert(`未找到"${c}"的笔画数据，请检查姓名`)
        return
      }
      strokes.push(s)
      detail.push({ char: c, strokes: s })
    }

    strokeDetail.value = detail
    const guaId = calcGuaIdWithName(form.name.trim(), strokes)

    // 查找卦数据
    const guaItem = guaData.find((item: any) => item.id === guaId)
    if (!guaItem) {
      alert(`未找到第${guaId}数的数据`)
      return
    }

    const upperDigit = Math.floor(guaId / 10)
    const lowerDigit = guaId % 10

    // 后天卦
    const houtianUpper = houtianGua[upperDigit]
    const houtianLower = houtianGua[lowerDigit]
    const houtianName = guaNameMap[houtianUpper + houtianLower] || (houtianUpper + houtianLower)
    const houtianLines = getGuaLines(houtianUpper, houtianLower)

    // 先天卦
    const xiantianUpper = xiantianGua[upperDigit]
    const xiantianLower = xiantianGua[lowerDigit]
    const xiantianName = guaNameMap[xiantianUpper + xiantianLower] || (xiantianUpper + xiantianLower)
    const xiantianLines = getGuaLines(xiantianUpper, xiantianLower)

    result.value = {
      id: guaId,
      data: guaItem,
      xiantianName,
      xiantianLines,
      houtianName,
      houtianLines,
    }
  } catch (e) {
    console.error(e)
    alert('推算出错，请重试')
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
  strokeDetail.value = []
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }
/* 表单 */
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; backdrop-filter: blur(20px); transition: all 0.2s; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); }
.submit:active { opacity: 0.85; transform: translateY(1px); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
/* 卡片 */
.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }
/* 概览 */
.summary-card { text-align: center; padding: 28px 20px; }
.summary-name-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 4px; }
.summary-char { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.char-text { font-size: 24px; font-weight: 600; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 2px; }
.char-strokes { font-size: 10px; color: var(--text-tertiary); }
.summary-id { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; }
/* 卦象 */
.gua-row { display: flex; align-items: center; justify-content: center; gap: 32px; }
.gua-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.gua-label { font-size: 11px; padding: 2px 10px; border-radius: 4px; }
.gua-label-xian { background: rgba(219, 39, 119, 0.15); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.gua-label-hou { background: rgba(100, 149, 237, 0.15); color: #6495ed; }
.gua-name { font-size: 15px; color: var(--text-primary); font-weight: 500; }
.gua-symbol { display: flex; flex-direction: column; gap: 4px; width: 48px; }
.gua-line { height: 5px; background: var(--text-primary); border-radius: 1px; position: relative; }
.gua-line.broken { background: transparent; display: flex; justify-content: space-between; }
.gua-line.broken span { display: block; width: 44%; height: 5px; background: var(--text-primary); border-radius: 1px; }
.gua-divider { font-size: 18px; color: var(--text-tertiary); margin-top: 20px; }
/* 五维 */
.dim-grid { display: flex; flex-direction: column; gap: 16px; }
.dim-item { display: flex; align-items: center; gap: 12px; }
.dim-header { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 40px; }
.dim-char { font-size: 20px; font-weight: 600; }
.dim-wx-badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; color: #fff; }
.dim-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.dim-bar-row { display: flex; align-items: center; gap: 8px; }
.dim-bar-label { font-size: 11px; color: var(--text-tertiary); width: 16px; }
.dim-bar-track { flex: 1; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
.dim-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.dim-bar-fill.zheng { background: linear-gradient(90deg, #e06060, #ff8a80); }
.dim-bar-fill.pian { background: linear-gradient(90deg, #DB2777, #CA8A04); }
.dim-bar-val { font-size: 11px; color: var(--text-secondary); width: 24px; text-align: right; }
.dim-bar-val.highlight { color: #ff6b6b; font-weight: 600; }
/* 五行颜色 */
.wx-金 { color: #d4a843; }
.wx-木 { color: #4caf50; }
.wx-水 { color: #42a5f5; }
.wx-火 { color: #ef5350; }
.wx-土 { color: #8d6e63; }
.wx-bg-金 { background: #d4a843; }
.wx-bg-木 { background: #4caf50; }
.wx-bg-水 { background: #42a5f5; }
.wx-bg-火 { background: #ef5350; }
.wx-bg-土 { background: #8d6e63; }
/* 操作按钮 */
.actions { display: flex; gap: 10px; padding: 24px 20px 0; }
.btn-again { flex: 1; height: 44px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 14px; font-weight: 500; letter-spacing: 2px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.btn-again:active { opacity: 0.85; transform: translateY(1px); }
.btn-back { flex: 1; height: 44px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.btn-back:active { background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); }
</style>
