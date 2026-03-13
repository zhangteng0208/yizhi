<template>
  <div class="page">
    <van-nav-bar
      title="风水布局"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 表单 -->
    <div class="form" v-if="!result">
      <van-cell-group inset title="上传户型图或室内照片">
        <van-cell>
          <p class="upload-hint">请上传清晰的户型图或室内全景照片，以便分析房屋格局</p>
          <van-uploader
            v-model="fileList"
            :max-count="1"
            :after-read="onAfterRead"
            :before-read="beforeRead"
            accept="image/*"
            result-type="dataUrl"
            :max-size="10 * 1024 * 1024"
            @oversize="onOversize"
          >
            <div class="upload-trigger" v-if="!imageBase64">
              <span class="upload-icon">🏠</span>
              <span class="upload-text">点击上传户型图或照片</span>
            </div>
          </van-uploader>
          <div class="preview-wrap" v-if="imageBase64">
            <img :src="'data:image/jpeg;base64,' + imageBase64" class="preview-img" />
            <van-button plain type="primary" size="small" @click="clearImage">重新选择</van-button>
          </div>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="房屋信息">
        <van-cell title="房屋朝向">
          <template #value>
            <div class="dir-grid">
              <span
                v-for="d in directions"
                :key="d"
                class="dir-btn"
                :class="{ active: form.direction === d }"
                @click="form.direction = d"
              >{{ d }}</span>
            </div>
          </template>
        </van-cell>
        <van-cell title="户型描述">
          <template #value>
            <van-field
              v-model="form.houseType"
              placeholder="如：三室两厅、两室一厅"
              :border="false"
              style="padding: 0; text-align: right;"
            />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="户主信息（可选）">
        <van-cell title="性别">
          <template #value>
            <div class="toggle-row">
              <button
                v-for="g in ['男', '女']"
                :key="g"
                class="toggle-btn"
                :class="{ active: form.ownerGender === g }"
                @click="form.ownerGender = g"
              >{{ g }}</button>
            </div>
          </template>
        </van-cell>
        <van-cell title="出生年份">
          <template #value>
            <van-field
              v-model="form.ownerBirthYear"
              type="number"
              placeholder="如 1990"
              :border="false"
              style="padding: 0; text-align: right;"
            />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="submit-wrap">
        <van-button type="primary" block round size="large" :disabled="!canSubmit" @click="onSubmit">
          开始分析
        </van-button>
      </div>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 综合得分 -->
      <van-cell-group inset v-if="result.ai" class="summary-card">
        <van-cell center>
          <template #title>
            <div class="summary-content">
              <div class="summary-label">风水综合评分</div>
              <div class="summary-score" :class="scoreClass(result.ai.score)">{{ result.ai.score }}</div>
              <div class="summary-sub">{{ scoreTip(result.ai.score) }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 八宅排盘 -->
      <van-cell-group inset v-if="bazhaiResult" class="bazhai-card">
        <div class="bazhai-header">
          <h3 class="card-title">八宅排盘</h3>
          <span v-if="imageBase64" class="bazhai-toggle" :class="{ on: showFloorplan }" @click="showFloorplan = !showFloorplan">
            <span class="toggle-label">户型图</span>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </span>
        </div>
        <div class="bazhai-grid-wrap" :class="{ 'floorplan-mode': showFloorplan }">
          <img
            v-if="imageBase64"
            :src="'data:image/jpeg;base64,' + imageBase64"
            class="bazhai-bg-img"
            :style="{ transform: 'rotate(' + floorplanRotation + 'deg)' }"
          />
          <div class="bazhai-grid">
            <template v-for="pos in gridPositions" :key="pos">
              <div v-if="pos === 'center'" class="bz-cell bz-center">
                <span class="bz-zhai-name">{{ bazhaiResult.zhai.name }}</span>
                <span class="bz-zhai-group">{{ bazhaiResult.zhai.group }}</span>
                <span class="bz-zhai-info">朝{{ form.direction }} 坐{{ bazhaiResult.sitting }}</span>
              </div>
              <div v-else class="bz-cell" :class="starInfo[bazhaiResult.stars[directionIndex[pos]]].type">
                <span class="bz-dir">{{ pos }}</span>
                <span class="bz-star" :style="{ color: starInfo[bazhaiResult.stars[directionIndex[pos]]].color }">{{ bazhaiResult.stars[directionIndex[pos]] }}</span>
                <span class="bz-alias">{{ starInfo[bazhaiResult.stars[directionIndex[pos]]].alias }}</span>
                <span class="bz-level" :class="starInfo[bazhaiResult.stars[directionIndex[pos]]].type">{{ starInfo[bazhaiResult.stars[directionIndex[pos]]].level }}</span>
              </div>
            </template>
          </div>
        </div>
        <div class="bazhai-legend">
          <span class="legend-item ji">吉位</span>
          <span class="legend-item xiong">凶位</span>
        </div>
      </van-cell-group>

      <!-- 区域评级 -->
      <van-cell-group inset title="各区域风水评级" v-if="result.ai?.ratings">
        <van-cell v-for="area in fengshuiAreas" :key="area.key">
          <template #title>
            <div class="rating-item">
              <div class="rating-header">
                <span class="rating-dot" :style="{ background: area.color }"></span>
                <span class="rating-name">{{ area.label }}</span>
                <span class="rating-desc">{{ result.ai.ratings[area.key]?.desc }}</span>
                <span class="rating-score">{{ result.ai.ratings[area.key]?.score }}<span class="rating-max">/10</span></span>
              </div>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" :style="{ width: (result.ai.ratings[area.key]?.score || 0) * 10 + '%', background: area.color }"></div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- AI 解读 -->
      <van-cell-group inset title="风水解读">
        <van-cell v-if="aiLoading && !result.ai">
          <div class="ai-loading">
            <van-loading type="spinner" color="#DB2777" vertical>风水解析中...</van-loading>
          </div>
        </van-cell>
        <van-collapse v-if="result.ai && isTyping" v-model="activeNames" accordion>
          <van-collapse-item v-for="sec in aiSections" :key="sec.key" :name="sec.key" :title="sec.label" v-show="displayedContent[sec.key] || sec.key === 'jianyi' && displayedContent.jianyi">
            <template v-if="sec.key === 'jianyi'">
              <ul class="advice-list">
                <li v-for="(a, i) in displayedContent.jianyi" :key="i">{{ a }}</li>
              </ul>
            </template>
            <template v-else>
              {{ displayedContent[sec.key] || '' }}
            </template>
          </van-collapse-item>
        </van-collapse>
        <van-collapse v-if="result.ai && !isTyping" v-model="activeNames" accordion>
          <van-collapse-item v-for="sec in aiSections" :key="sec.key" :name="sec.key" :title="sec.label">
            <template v-if="sec.key === 'jianyi'">
              <ul class="advice-list">
                <li v-for="(a, i) in result.ai?.jianyi" :key="i">{{ a }}</li>
              </ul>
            </template>
            <template v-else>
              {{ result.ai?.[sec.key] }}
            </template>
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button type="primary" block round @click="reset">重新分析</van-button>
        <van-button block round @click="$router.push('/')">返回首页</van-button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="风水分析中..." />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { showToast } from 'vant'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const result = ref<any>(null)
const loading = ref(false)
const aiLoading = ref(false)
const activeNames = ref(['zonglun'])
const imageBase64 = ref('')
const fileList = ref<any[]>([])
const showFloorplan = ref(false)
const isTyping = ref(false)
const displayedContent = ref<any>({})
const directions = ['东', '南', '西', '北', '东南', '东北', '西南', '西北']

const form = reactive({
  direction: '',
  houseType: '',
  ownerGender: '',
  ownerBirthYear: '',
})

const canSubmit = computed(() => !!imageBase64.value)

// ===== 八宅排盘数据 =====
const facingToSitting: Record<string, string> = {
  '南': '北', '北': '南', '东': '西', '西': '东',
  '东南': '西北', '西北': '东南', '东北': '西南', '西南': '东北',
}

const sittingToZhai: Record<string, { name: string; group: string }> = {
  '北': { name: '坎宅', group: '东四宅' },
  '南': { name: '离宅', group: '东四宅' },
  '东': { name: '震宅', group: '东四宅' },
  '东南': { name: '巽宅', group: '东四宅' },
  '西北': { name: '乾宅', group: '西四宅' },
  '西南': { name: '坤宅', group: '西四宅' },
  '东北': { name: '艮宅', group: '西四宅' },
  '西': { name: '兑宅', group: '西四宅' },
}

const starInfo: Record<string, { alias: string; type: 'ji' | 'xiong'; level: string; color: string }> = {
  '生气': { alias: '贪狼', type: 'ji', level: '大吉', color: '#e8b86d' },
  '天医': { alias: '巨门', type: 'ji', level: '大吉', color: '#6de88a' },
  '延年': { alias: '武曲', type: 'ji', level: '中吉', color: '#6db3e8' },
  '伏位': { alias: '辅弼', type: 'ji', level: '小吉', color: '#8b8b6d' },
  '绝命': { alias: '破军', type: 'xiong', level: '大凶', color: '#e86d6d' },
  '五鬼': { alias: '廉贞', type: 'xiong', level: '大凶', color: '#b86de8' },
  '六煞': { alias: '文曲', type: 'xiong', level: '次凶', color: '#e89a6d' },
  '祸害': { alias: '禄存', type: 'xiong', level: '小凶', color: '#8b7d6d' },
}

// 方位顺序：北、东北、东、东南、南、西南、西、西北
const bazhaiTable: Record<string, string[]> = {
  '北': ['伏位','五鬼','天医','生气','延年','祸害','绝命','六煞'],
  '南': ['延年','祸害','绝命','六煞','伏位','生气','天医','五鬼'],
  '东': ['天医','六煞','伏位','延年','生气','绝命','祸害','五鬼'],
  '东南': ['生气','绝命','延年','伏位','天医','五鬼','六煞','祸害'],
  '西北': ['六煞','天医','五鬼','祸害','绝命','延年','生气','伏位'],
  '西南': ['祸害','生气','绝命','五鬼','六煞','伏位','延年','天医'],
  '东北': ['五鬼','伏位','六煞','绝命','祸害','天医','生气','延年'],
  '西': ['绝命','延年','祸害','六煞','天医','生气','伏位','五鬼'],
}

// 九宫格方位排列（标准地图视角：上北下南左西右东）
const gridPositions = ['西北','北','东北','西','center','东','西南','南','东南']
const directionIndex: Record<string, number> = { '北':0,'东北':1,'东':2,'东南':3,'南':4,'西南':5,'西':6,'西北':7 }

const bazhaiResult = computed(() => {
  if (!form.direction) return null
  const sitting = facingToSitting[form.direction]
  if (!sitting) return null
  const zhai = sittingToZhai[sitting]
  const stars = bazhaiTable[sitting]
  return { sitting, zhai, stars }
})

// 户型图旋转角度：假设原图"上方"为入户门朝向（朝向），旋转使其对齐九宫格方位
// 九宫格上北下南，入户门朝向应转到对应方位
const facingRotationMap: Record<string, number> = {
  '北': 180,
  '东北': 135,
  '东': 90,
  '东南': 45,
  '南': 0,
  '西南': -45,
  '西': -90,
  '西北': -135,
}
const floorplanRotation = computed(() => {
  if (!form.direction) return 0
  return facingRotationMap[form.direction] ?? 0
})

const fengshuiAreas = [
  { key: 'damen', label: '大门', color: '#e8b86d' },
  { key: 'zhuwo', label: '主卧', color: '#6db3e8' },
  { key: 'chufang', label: '厨房', color: '#e86d6d' },
  { key: 'keting', label: '客厅', color: '#6de88a' },
  { key: 'weishengjian', label: '卫生间', color: '#b86de8' },
]

const aiSections = [
  { key: 'zonglun', label: '风水总论' },
  { key: 'bazhai', label: '八宅分析' },
  { key: 'damen', label: '大门方位' },
  { key: 'zhuwo', label: '主卧方位' },
  { key: 'chufang', label: '厨房方位' },
  { key: 'caiyun', label: '财位分析' },
  { key: 'shaye', label: '煞气化解' },
  { key: 'buju', label: '布局优化' },
  { key: 'jianyi', label: '改善建议' },
]

function beforeRead(file: File) {
  if (!file.type) return true
  const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  if (!valid.includes(file.type)) {
    showToast('请上传 JPG/PNG/HEIC 格式的图片')
    return false
  }
  return true
}

function onOversize() {
  showToast('图片不能超过 10MB')
}

function onAfterRead(file: any) {
  compressImage(file.content, 800, 0.8).then(b64 => {
    imageBase64.value = b64
  })
}

function clearImage() {
  imageBase64.value = ''
  fileList.value = []
}

function compressImage(dataUrl: string, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const compressed = canvas.toDataURL('image/jpeg', quality)
      resolve(compressed.split(',')[1])
    }
    img.src = dataUrl
  })
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/fengshui', {
      image: imageBase64.value,
      direction: form.direction || undefined,
      houseType: form.houseType || undefined,
      ownerGender: form.ownerGender || undefined,
      ownerBirthYear: form.ownerBirthYear ? Number(form.ownerBirthYear) : undefined,
    })
    result.value = res.data ?? res
    loading.value = false
    // 自动调用分析详解
    await fetchAiInterpretation()
  } catch (e: any) {
    console.error(e)
    showToast(e?.response?.data?.message || '分析请求失败，请重试')
    loading.value = false
  }
}

async function fetchAiInterpretation() {
  if (!result.value) return
  aiLoading.value = true
  displayedContent.value = {}
  await fetchAiStream('fengshui', result.value, { image: imageBase64.value }, result.value?.id, {
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
    if (sec.key === 'jianyi') continue
    if (content[sec.key]) {
      await typeText(sec.key, content[sec.key])
    }
  }

  if (content.jianyi) {
    displayedContent.value.jianyi = content.jianyi
  }

  if (content.score) {
    displayedContent.value.score = content.score
  }

  if (content.ratings) {
    displayedContent.value.ratings = content.ratings
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
  aiLoading.value = false
  activeNames.value = ['zonglun']
}

function scoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

function scoreTip(score: number) {
  if (score >= 90) return '上佳风水，藏风聚气'
  if (score >= 80) return '风水良好，旺宅兴家'
  if (score >= 70) return '风水尚可，稍加调整'
  if (score >= 60) return '风水平平，需要优化'
  return '建议详细调整布局'
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }

.upload-hint { font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; line-height: 1.6; }
.upload-trigger { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 160px; border: 2px dashed rgba(219, 39, 119, 0.3); border-radius: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(219, 39, 119, 0.05); position: relative; overflow: hidden; }
.upload-trigger::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(219, 39, 119, 0.1) 0%, transparent 70%); opacity: 0; transition: opacity 0.25s ease-out; }
.upload-trigger:active::before { opacity: 1; }
.upload-trigger:active { border-color: #DB2777; background: rgba(219, 39, 119, 0.1); transform: scale(0.98); }
.upload-icon { font-size: 36px; }
.upload-text { font-size: 13px; color: var(--text-secondary); }
.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 12px; }
.preview-img { max-width: 200px; max-height: 200px; border-radius: 12px; object-fit: cover; box-shadow: var(--shadow-sm); }

:deep(.van-uploader__preview) { display: none; }

.dir-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; max-width: 200px; }
.dir-btn { padding: 6px 0; border-radius: 6px; font-size: 12px; color: var(--text-secondary); background: var(--bg-primary); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; text-align: center; }
.dir-btn.active { color: #DB2777; border-color: #DB2777; background: rgba(219, 39, 119, 0.1); }

.submit-wrap { padding: 20px; }

.summary-card :deep(.van-cell) { padding: 28px 20px !important; background: transparent; position: relative; overflow: hidden; }
.summary-card :deep(.van-cell)::after { content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: radial-gradient(circle, rgba(219, 39, 119, 0.12) 0%, transparent 70%); pointer-events: none; }
.summary-content { text-align: center; width: 100%; position: relative; z-index: 1; }
.summary-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; }
.summary-score { font-size: 56px; font-weight: 700; line-height: 1; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 2px 8px rgba(219, 39, 119, 0.4)); }
.summary-sub { font-size: 13px; color: var(--text-tertiary); margin-top: 12px; letter-spacing: 1px; }

.ai-loading { display: flex; align-items: center; justify-content: center; padding: 32px 0; }

.advice-list { margin: 0; padding-left: 16px; color: var(--text-secondary); font-size: 13px; line-height: 1.8; }
.advice-list li { margin-bottom: 6px; }
.advice-list li:last-child { margin-bottom: 0; }

.rating-item { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.rating-header { display: flex; align-items: center; gap: 8px; }
.rating-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rating-name { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.rating-desc { font-size: 11px; color: var(--text-tertiary); margin-left: auto; }
.rating-score { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-left: 8px; }
.rating-max { font-size: 11px; font-weight: 400; color: var(--text-tertiary); }
.rating-bar-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.rating-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

.actions { display: flex; flex-direction: column; gap: 12px; padding: 16px 20px; }

/* 八宅排盘 */
.bazhai-card { padding: 20px 16px !important; }
.bazhai-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.bazhai-header .card-title { margin-bottom: 0; font-size: 13px; color: var(--text-secondary); letter-spacing: 1px; }
.bazhai-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
.toggle-label { font-size: 11px; color: var(--text-tertiary); }
.toggle-track { position: relative; width: 36px; height: 20px; border-radius: 10px; background: var(--border); transition: background 0.25s; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--text-tertiary); transition: transform 0.25s, background 0.25s; }
.bazhai-toggle.on .toggle-track { background: rgba(219, 39, 119, 0.4); }
.bazhai-toggle.on .toggle-thumb { transform: translateX(16px); background: #DB2777; }
.bazhai-grid-wrap { position: relative; overflow: hidden; border-radius: 8px; }
.bazhai-bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: center center; opacity: 0.12; pointer-events: none; z-index: 0; transition: opacity 0.35s; }
.bazhai-grid-wrap.floorplan-mode .bazhai-bg-img { opacity: 0.45; }
.bazhai-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; position: relative; z-index: 1; }
.bz-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 10px 4px; border-radius: 8px; background: rgba(26, 26, 26, 0.85); border: 1px solid var(--border); min-height: 76px; transition: background 0.35s, border-color 0.35s; }
.bz-cell.ji { border-color: rgba(219, 39, 119, 0.25); background: rgba(40, 36, 26, 0.88); }
.bz-cell.xiong { border-color: rgba(232, 109, 109, 0.2); background: rgba(40, 26, 26, 0.88); }
.bz-center { background: rgba(40, 36, 26, 0.9); border-color: rgba(219, 39, 119, 0.3); }
.bazhai-grid-wrap.floorplan-mode .bz-cell { background: rgba(26, 26, 26, 0.35); border-color: rgba(255, 255, 255, 0.12); }
.bazhai-grid-wrap.floorplan-mode .bz-cell.ji { background: rgba(40, 36, 26, 0.35); border-color: rgba(219, 39, 119, 0.2); }
.bazhai-grid-wrap.floorplan-mode .bz-cell.xiong { background: rgba(40, 26, 26, 0.35); border-color: rgba(232, 109, 109, 0.15); }
.bazhai-grid-wrap.floorplan-mode .bz-center { background: rgba(40, 36, 26, 0.4); border-color: rgba(219, 39, 119, 0.25); }
.bz-dir { font-size: 11px; color: var(--text-tertiary); }
.bz-star { font-size: 15px; font-weight: 600; }
.bz-alias { font-size: 10px; color: var(--text-tertiary); }
.bz-level { font-size: 10px; font-weight: 500; padding: 1px 6px; border-radius: 3px; }
.bz-level.ji { color: #e8b86d; background: rgba(232, 184, 109, 0.12); }
.bz-level.xiong { color: #e86d6d; background: rgba(232, 109, 109, 0.12); }
.bz-zhai-name { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.bz-zhai-group { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.bz-zhai-info { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; }
.bazhai-legend { display: flex; justify-content: center; gap: 20px; margin-top: 12px; }
.legend-item { font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px; }
.legend-item::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 2px; }
.legend-item.ji::before { background: rgba(219, 39, 119, 0.4); border: 1px solid rgba(219, 39, 119, 0.6); }
.legend-item.xiong::before { background: rgba(232, 109, 109, 0.3); border: 1px solid rgba(232, 109, 109, 0.5); }

/* Vant 组件样式覆盖 */
:deep(.van-nav-bar) {
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
}

:deep(.van-nav-bar__title) {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 4px;
}

:deep(.van-nav-bar__arrow) {
  color: var(--text-secondary);
  font-size: 20px;
}

:deep(.van-cell-group) {
  margin: 16px 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

:deep(.van-cell-group__title) {
  padding: 16px 16px 8px;
  color: var(--text-secondary);
  font-size: 13px;
  letter-spacing: 1px;
}

:deep(.van-cell) {
  background: transparent;
  padding: 16px;
  color: var(--text-primary);
}

:deep(.van-cell__title) {
  color: var(--text-secondary);
  font-size: 14px;
}

:deep(.van-cell__value) {
  display: flex;
  justify-content: flex-end;
}

/* 性别选择按钮 */
.toggle-row {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  flex: 1;
  height: 36px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  border-color: #DB2777;
  color: #DB2777;
  background: rgba(219, 39, 119, 0.1);
  box-shadow: 0 0 12px rgba(219, 39, 119, 0.3);
}

:deep(.van-field__control) {
  color: var(--text-primary);
}

:deep(.van-collapse-item) {
  background: transparent;
}

:deep(.van-collapse-item__title) {
  color: var(--text-primary);
  font-size: 14px;
  padding: 14px 16px;
}

:deep(.van-collapse-item__content) {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
  padding: 0 16px 14px;
  background: transparent;
}

:deep(.van-collapse-item__title::after) {
  border-color: var(--border);
}
</style>
