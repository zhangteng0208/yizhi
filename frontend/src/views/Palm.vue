<template>
  <div class="page">
    <van-nav-bar
      title="手相解读"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 表单 -->
    <div class="form" v-if="!result">
      <van-cell-group inset title="上传手掌照片">
        <van-cell>
          <p class="upload-hint">请拍摄清晰的手掌正面照片，五指自然张开，光线充足效果更佳</p>
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
              <span class="upload-icon">🤚</span>
              <span class="upload-text">点击拍照或选择照片</span>
            </div>
          </van-uploader>
          <div class="preview-wrap" v-if="imageBase64">
            <img :src="'data:image/jpeg;base64,' + imageBase64" class="preview-img" />
            <van-button plain type="primary" size="small" @click="clearImage">重新选择</van-button>
          </div>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="辅助信息（可选）">
        <van-cell title="哪只手">
          <template #value>
            <div class="toggle-row">
              <button
                v-for="h in ['左手', '右手']"
                :key="h"
                class="toggle-btn"
                :class="{ active: form.hand === h }"
                @click="form.hand = h"
              >{{ h }}</button>
            </div>
          </template>
        </van-cell>
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
        <van-cell title="出生年份">
          <template #value>
            <van-field
              v-model="form.birthYear"
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
          开始解读
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
              <div class="summary-label">手相综合评分</div>
              <div class="summary-score" :class="scoreClass(result.ai.score)">{{ result.ai.score }}</div>
              <div class="summary-sub">{{ scoreTip(result.ai.score) }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 掌纹评级 -->
      <van-cell-group inset title="掌纹评级" v-if="result.ai?.ratings">
        <van-cell v-for="line in palmLines" :key="line.key">
          <template #title>
            <div class="rating-item">
              <div class="rating-header">
                <span class="rating-dot" :style="{ background: line.color }"></span>
                <span class="rating-name">{{ line.label }}</span>
                <span class="rating-desc">{{ result.ai.ratings[line.key]?.desc }}</span>
                <span class="rating-score">{{ result.ai.ratings[line.key]?.score }}<span class="rating-max">/10</span></span>
              </div>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" :style="{ width: (result.ai.ratings[line.key]?.score || 0) * 10 + '%', background: line.color }"></div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- AI 解读 -->
      <van-cell-group inset title="手相解读">
        <van-cell v-if="aiLoading && !result.ai">
          <div class="ai-loading">
            <van-loading type="spinner" color="#DB2777" vertical>掌纹解析中...</van-loading>
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
        <van-button type="primary" block round @click="reset">重新解读</van-button>
        <van-button block round @click="$router.push('/')">返回首页</van-button>
      </div>
    </template>

    <LoadingOverlay :visible="loading" text="手相分析中..." />
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
const isTyping = ref(false)
const displayedContent = ref<any>({})

const form = reactive({
  hand: '左手',
  gender: '',
  birthYear: '',
})

const canSubmit = computed(() => !!imageBase64.value)

const palmLines = [
  { key: 'shengmingxian', label: '生命线', color: '#6de88a' },
  { key: 'zhihuixian', label: '智慧线', color: '#6db3e8' },
  { key: 'ganqingxian', label: '感情线', color: '#e86d6d' },
  { key: 'shiyexian', label: '事业线', color: '#b86de8' },
]

const aiSections = [
  { key: 'zonglun', label: '手相总论' },
  { key: 'shengmingxian', label: '生命线' },
  { key: 'zhihuixian', label: '智慧线' },
  { key: 'ganqingxian', label: '感情线' },
  { key: 'shiyexian', label: '事业线' },
  { key: 'xingge', label: '性格分析' },
  { key: 'caiyun', label: '财运分析' },
  { key: 'ganqing', label: '感情婚姻' },
  { key: 'jiankang', label: '健康提示' },
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
    const res: any = await http.post('/divination/palm', {
      image: imageBase64.value,
      hand: form.hand || undefined,
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
  await fetchAiStream('palm', result.value, { image: imageBase64.value }, result.value?.id, {
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
  if (score >= 90) return '上上之相，福泽深厚'
  if (score >= 80) return '吉相，运势通达'
  if (score >= 70) return '中上之相，稳中向好'
  if (score >= 60) return '中等之相，平稳安康'
  return '需多修身养性，广积善缘'
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
