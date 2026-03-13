<template>
  <div class="page">
    <van-nav-bar
      title="舌相分析"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 表单 -->
    <div class="form" v-if="!result">
      <div class="card upload-card">
        <h3 class="card-title">上传舌头照片</h3>
        <p class="upload-hint">请伸出舌头拍摄清晰照片，自然光线下效果更佳</p>
        <div class="preview-wrap" v-if="imageBase64">
          <img :src="'data:image/jpeg;base64,' + imageBase64" class="preview-img" />
          <span class="re-upload" @click="clearImage">重新选择</span>
        </div>
        <van-uploader
          v-else
          v-model="fileList"
          :max-count="1"
          :after-read="onAfterRead"
          :before-read="beforeRead"
          accept="image/*"
          result-type="dataUrl"
          :max-size="10 * 1024 * 1024"
          @oversize="onOversize"
        >
          <div class="upload-trigger">
            <span class="upload-icon">📷</span>
            <span class="upload-text">点击拍照或选择照片</span>
          </div>
        </van-uploader>
      </div>

      <van-cell-group inset title="辅助信息（可选）">
        <van-cell title="性别">
          <template #value>
            <div class="toggle-row">
              <button
                v-for="g in ['男', '女']"
                :key="g"
                class="toggle-btn"
                :class="{ active: form.gender === g }"
                @click="form.gender = g"
              >{{ g }}</button>
            </div>
          </template>
        </van-cell>
        <van-field
          v-model="form.birthYear"
          type="number"
          label="出生年份"
          placeholder="如 1990"
          :rules="[{ pattern: /^\d{4}$/, message: '请输入有效年份' }]"
        />
      </van-cell-group>

      <div class="submit-wrap">
        <van-button
          type="primary"
          block
          round
          :disabled="!canSubmit"
          @click="onSubmit"
          size="large"
        >
          开始分析
        </van-button>
      </div>
    </div>

    <!-- 结果 -->
    <template v-if="result">
      <!-- 综合得分 -->
      <div class="card summary-card" v-if="result.ai">
        <div class="summary-label">健康综合评分</div>
        <div class="summary-score" :class="scoreClass(result.ai.score)">{{ result.ai.score }}</div>
        <div class="summary-sub">{{ scoreTip(result.ai.score) }}</div>
      </div>

      <!-- 舌相评级 -->
      <div class="card" v-if="result.ai?.ratings">
        <h3 class="card-title">舌相评级</h3>
        <div class="rating-list">
          <div v-for="part in tongueParts" :key="part.key" class="rating-item">
            <div class="rating-header">
              <span class="rating-dot" :style="{ background: part.color }"></span>
              <span class="rating-name">{{ part.label }}</span>
              <span class="rating-desc">{{ result.ai.ratings[part.key]?.desc }}</span>
              <span class="rating-score">{{ result.ai.ratings[part.key]?.score }}<span class="rating-max">/10</span></span>
            </div>
            <div class="rating-bar-bg">
              <div class="rating-bar-fill" :style="{ width: (result.ai.ratings[part.key]?.score || 0) * 10 + '%', background: part.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 解读 -->
      <div class="card">
        <h3 class="card-title">舌诊解读</h3>
        <div v-if="aiLoading && !result.ai" class="ai-loading">
          <van-loading type="spinner" color="#DB2777" vertical>
            舌诊解析中...
          </van-loading>
        </div>
        <van-collapse v-if="result.ai && isTyping" v-model="expandedAi" accordion>
          <van-collapse-item v-for="sec in aiSections" :key="sec.key" :name="sec.key" :title="sec.label" v-show="displayedContent[sec.key] || sec.key === 'jianyi' && displayedContent.jianyi">
            <template v-if="sec.key === 'jianyi'">
              <ul class="advice-list">
                <li v-for="(a, i) in displayedContent.jianyi" :key="i">{{ a }}</li>
              </ul>
            </template>
            <template v-else>
              <div class="collapse-content">{{ displayedContent[sec.key] || '' }}</div>
            </template>
          </van-collapse-item>
        </van-collapse>
        <van-collapse v-if="result.ai && !isTyping" v-model="expandedAi" accordion>
          <van-collapse-item v-for="sec in aiSections" :key="sec.key" :name="sec.key" :title="sec.label">
            <template v-if="sec.key === 'jianyi'">
              <ul class="advice-list">
                <li v-for="(a, i) in result.ai?.jianyi" :key="i">{{ a }}</li>
              </ul>
            </template>
            <template v-else>
              <div class="collapse-content">{{ result.ai?.[sec.key] }}</div>
            </template>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button type="primary" round block @click="reset">重新分析</van-button>
        <van-button round block @click="$router.push('/')">返回首页</van-button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="舌相分析中..." />
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
const expandedAi = ref('zonglun')
const imageBase64 = ref('')
const fileList = ref<any[]>([])
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({
  gender: '',
  birthYear: '',
})

const canSubmit = computed(() => !!imageBase64.value)

const tongueParts = [
  { key: 'shezhi', label: '舌质', color: '#e86d6d' },
  { key: 'shetai', label: '舌苔', color: '#e8b86d' },
  { key: 'shexing', label: '舌形', color: '#6db3e8' },
  { key: 'shetai_houbo', label: '苔厚薄', color: '#6de88a' },
  { key: 'shetai_runzao', label: '苔润燥', color: '#b86de8' },
]

const aiSections = [
  { key: 'zonglun', label: '舌诊总论' },
  { key: 'shezhi', label: '舌质分析' },
  { key: 'shetai', label: '舌苔分析' },
  { key: 'shexing', label: '舌形分析' },
  { key: 'jiankang', label: '健康状况' },
  { key: 'tizhipanduan', label: '体质判断' },
  { key: 'yinshi', label: '饮食建议' },
  { key: 'yangsheng', label: '养生建议' },
  { key: 'jianyi', label: '调理建议' },
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
  const content = file.content || file?.file?.content
  if (!content) return
  compressImage(content, 800, 0.8).then(b64 => {
    imageBase64.value = b64
  })
}

function clearImage() {
  imageBase64.value = ''
  fileList.value = []
}

/** 压缩图片到指定最大尺寸 */
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
    img.onerror = () => {
      // canvas 无法处理此格式，直接用原始 base64
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
      resolve(b64)
    }
    img.src = dataUrl
  })
}

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const res: any = await http.post('/divination/tongue', {
      image: imageBase64.value,
      gender: form.gender || undefined,
      birthYear: form.birthYear ? Number(form.birthYear) : undefined,
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
  await fetchAiStream('tongue', result.value, { image: imageBase64.value }, result.value?.id, {
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

function scoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

function scoreTip(score: number) {
  if (score >= 90) return '上上之相，福泽深厚'
  if (score >= 80) return '吉相，运势通达'
  if (score >= 70) return '中上之相，稳中向好'
  if (score >= 60) return '中等之相，平稳安康'
  return '需多修身养性，广积善缘'
}

function reset() {
  result.value = null
  aiLoading.value = false
  expandedAi.value = ['zonglun']
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; position: relative; z-index: 1; }

.card { margin: 0 20px 16px; padding: 20px; background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.card-title { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-bottom: 16px; letter-spacing: 1px; }

/* 上传区域 */
.upload-hint { font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px; }
.upload-trigger { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 160px; border: 2px dashed rgba(219, 39, 119, 0.3); border-radius: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(219, 39, 119, 0.05); position: relative; overflow: hidden; }
.upload-trigger::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(219, 39, 119, 0.1) 0%, transparent 70%); opacity: 0; transition: opacity 0.25s ease-out; }
.upload-trigger:active::before { opacity: 1; }
.upload-trigger:active { border-color: #DB2777; background: rgba(219, 39, 119, 0.1); transform: scale(0.98); }
.upload-icon { font-size: 36px; }
.upload-text { font-size: 13px; color: var(--text-secondary); }
.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.preview-img { max-width: 200px; max-height: 200px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); border: 2px solid rgba(219, 39, 119, 0.2); }
.re-upload { font-size: 13px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; font-weight: 500; transition: all 0.2s; }
.re-upload:active { transform: scale(0.95); opacity: 0.7; }

/* 隐藏 vant uploader 默认预览 */
:deep(.van-uploader__preview) { display: none; }

/* 提交 */
.submit-wrap { padding: 20px; }

/* 综合得分 */
.summary-card { text-align: center; padding: 32px 20px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
.summary-card::after { content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: radial-gradient(circle, rgba(219, 39, 119, 0.12) 0%, transparent 70%); pointer-events: none; }
.summary-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 2px; text-transform: uppercase; }
.summary-score { font-size: 56px; font-weight: 700; line-height: 1; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 2px 8px rgba(219, 39, 119, 0.4)); }
.summary-sub { font-size: 13px; color: var(--text-tertiary); margin-top: 12px; letter-spacing: 1px; }

.advice-list { margin: 0; padding-left: 16px; }
.advice-list li { margin-bottom: 6px; }
.advice-list li:last-child { margin-bottom: 0; }

.collapse-content { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

.rating-list { display: flex; flex-direction: column; gap: 14px; }
.rating-item { display: flex; flex-direction: column; gap: 6px; }
.rating-header { display: flex; align-items: center; gap: 6px; }
.rating-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rating-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.rating-desc { font-size: 11px; color: var(--text-tertiary); margin-left: auto; }
.rating-score { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-left: 8px; }
.rating-max { font-size: 11px; font-weight: 400; color: var(--text-tertiary); }
.rating-bar-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); }
.rating-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 8px currentColor; }

.ai-loading { display: flex; align-items: center; justify-content: center; padding: 32px 0; }

/* 操作按钮 */
.actions { display: flex; gap: 12px; padding: 16px 20px; }

/* Vant 组件样式覆盖 */
:deep(.van-nav-bar) {
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
}

:deep(.van-nav-bar__title) {
  font-size: 16px;
  font-weight: 500;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
}

:deep(.van-nav-bar__arrow) {
  color: var(--text-secondary);
  font-size: 20px;
}

:deep(.van-cell-group) {
  margin: 0 20px 16px;
  background: transparent;
}

:deep(.van-cell-group__title) {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 0 0 12px;
  letter-spacing: 1px;
}

:deep(.van-cell) {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  margin-bottom: 8px;
  padding: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

:deep(.van-cell:last-child) {
  margin-bottom: 0;
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

:deep(.van-field__label) {
  color: var(--text-secondary);
  font-size: 13px;
}

:deep(.van-field__control) {
  color: var(--text-primary);
  font-size: 13px;
}

:deep(.van-collapse-item) {
  border-bottom: 1px solid var(--border);
}

:deep(.van-collapse-item:last-child) {
  border-bottom: none;
}

:deep(.van-collapse-item__title) {
  padding: 14px 0;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
}

:deep(.van-collapse-item__title--expanded) {
  color: #DB2777;
}

:deep(.van-collapse-item__content) {
  padding: 0 0 14px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}

:deep(.van-button--large) {
  height: 50px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
}

:deep(.van-button--default) {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

</style>
