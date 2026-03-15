<template>
  <div class="chapter-reader" :style="readerStyles">
    <van-nav-bar
      :title="chapterTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <div class="nav-actions">
          <button class="action-btn" @click="showSearch = true" title="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button class="action-btn" @click="showSettings = true" title="设置">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </template>
    </van-nav-bar>

    <div class="reader-content" ref="contentRef">
      <div class="chapter-header">
        <h1 class="chapter-title">{{ chapterTitle }}</h1>
        <p class="chapter-number">{{ chapterNumber }}</p>
      </div>

      <div v-if="loading" class="loading">
        <van-loading type="spinner" color="var(--gold)">加载中...</van-loading>
      </div>

      <div v-else class="chapter-text">
        <p
          v-for="(paragraph, index) in content"
          :key="index"
          class="paragraph"
          :id="`para-${index}`"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="chapter-navigation">
        <button
          v-if="hasPrev"
          class="nav-btn prev"
          @click="goToPrevChapter"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>上一章</span>
        </button>
        <button
          v-if="hasNext"
          class="nav-btn next"
          @click="goToNextChapter"
        >
          <span>下一章</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 阅读设置面板 -->
    <ReaderSettings v-model:show="showSettings" />

    <!-- 搜索面板 -->
    <SearchPanel
      v-model:show="showSearch"
      :chapters="allChapters"
      @select="handleSearchSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookDataPath, getChapterNumber } from '@/composables/useBookReader'
import { useReadingProgress, useAutoSaveProgress } from '@/composables/useReadingProgress'
import { useReaderSettings } from '@/composables/useReaderSettings'
import type { SearchResult } from '@/composables/useContentSearch'
import ReaderSettings from '@/components/ReaderSettings.vue'
import SearchPanel from '@/components/SearchPanel.vue'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => route.params.id as string)
const chapterId = computed(() => Number(route.params.chapterId))

const chapterTitle = ref('')
const content = ref<string[]>([])
const loading = ref(true)
const maxChapters = ref(100)
const allChapters = ref<any[]>([])

const showSettings = ref(false)
const showSearch = ref(false)
const contentRef = ref<HTMLElement>()

const { settings } = useReaderSettings()
const { getProgress, saveProgress } = useReadingProgress()

// 阅读器样式
const readerStyles = computed(() => ({
  '--reader-font-size': `${settings.value.fontSize}px`,
  '--reader-line-height': settings.value.lineHeight,
  '--reader-bg': 'var(--bg-primary)',
  '--reader-text': 'var(--text-primary)'
}))

// 自动保存进度
let autoSave: ReturnType<typeof useAutoSaveProgress> | null = null

onMounted(async () => {
  await loadChapter()

  // 恢复阅读位置
  const progress = getProgress(bookId.value)
  if (progress && progress.chapterId === chapterId.value && progress.scrollPosition) {
    setTimeout(() => {
      window.scrollTo(0, progress.scrollPosition)
    }, 100)
  }

  // 启动自动保存
  autoSave = useAutoSaveProgress(
    bookId.value,
    chapterId.value,
    bookId.value,
    chapterTitle.value
  )
  autoSave.startAutoSave()
})

onUnmounted(() => {
  // 停止自动保存
  if (autoSave) {
    autoSave.stopAutoSave()
  }
})

watch(() => route.params.chapterId, async () => {
  // 停止旧的自动保存
  if (autoSave) {
    autoSave.stopAutoSave()
  }

  await loadChapter()

  // 启动新的自动保存
  autoSave = useAutoSaveProgress(
    bookId.value,
    chapterId.value,
    bookId.value,
    chapterTitle.value
  )
  autoSave.startAutoSave()

  // 滚动到顶部
  window.scrollTo(0, 0)
})

async function loadChapter() {
  loading.value = true
  try {
    const dataFile = getBookDataPath(bookId.value)

    if (!dataFile) {
      chapterTitle.value = '章节'
      content.value = ['内容暂未加载...']
      loading.value = false
      return
    }

    const response = await fetch(dataFile)
    const data = await response.json()

    allChapters.value = data
    maxChapters.value = data.length

    const chapterData = data[chapterId.value - 1]
    if (chapterData) {
      chapterTitle.value = chapterData.chapter
      content.value = chapterData.paragraphs
    } else {
      chapterTitle.value = '章节未找到'
      content.value = ['该章节内容不存在']
    }
  } catch (error) {
    console.error('加载章节内容失败:', error)
    chapterTitle.value = '加载失败'
    content.value = ['无法加载章节内容']
  } finally {
    loading.value = false
  }
}

const chapterNumber = computed(() => {
  return getChapterNumber(bookId.value, chapterId.value)
})

const hasPrev = computed(() => chapterId.value > 1)
const hasNext = computed(() => chapterId.value < maxChapters.value)

function goToPrevChapter() {
  if (hasPrev.value) {
    router.push(`/classics/${bookId.value}/chapter/${chapterId.value - 1}`)
  }
}

function goToNextChapter() {
  if (hasNext.value) {
    router.push(`/classics/${bookId.value}/chapter/${chapterId.value + 1}`)
  }
}

function handleSearchSelect(result: SearchResult) {
  // 如果搜索结果在当前章节，滚动到对应段落
  if (result.chapterId === chapterId.value) {
    const element = document.getElementById(`para-${result.paragraphIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 高亮效果
      element.style.background = 'var(--gold-dim)'
      setTimeout(() => {
        element.style.background = ''
      }, 2000)
    }
  } else {
    // 跳转到对应章节
    router.push(`/classics/${bookId.value}/chapter/${result.chapterId}`)
  }
}
</script>

<style scoped>
.chapter-reader {
  min-height: 100vh;
  background: var(--reader-bg, var(--bg-primary));
  transition: background 0.3s;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:active {
  background: var(--bg-secondary);
  transform: scale(0.95);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.reader-content {
  padding: 20px;
  max-width: var(--reader-max-width, 800px);
  margin: 0 auto;
}

.chapter-header {
  text-align: center;
  padding: 24px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.chapter-title {
  font-size: var(--reader-font-size, 24px);
  font-weight: 600;
  color: var(--reader-text, var(--text-primary));
  font-family: var(--reader-font-family, 'Songti SC', 'STSong', 'SimSun', serif);
  letter-spacing: 2px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chapter-number {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: var(--reader-font-family, 'Songti SC', 'STSong', 'SimSun', serif);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.chapter-text {
  line-height: var(--reader-line-height, 2);
  font-family: var(--reader-font-family, 'Songti SC', 'STSong', 'SimSun', serif);
  margin-bottom: 48px;
}

.paragraph {
  font-size: var(--reader-font-size, 16px);
  color: var(--reader-text, var(--text-primary));
  margin-bottom: 24px;
  text-indent: 2em;
  letter-spacing: 1px;
  text-align: var(--reader-text-align, justify);
  transition: background 0.3s;
}

.chapter-navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 0 48px;
  border-top: 1px solid var(--border);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
}

.nav-btn svg {
  width: 20px;
  height: 20px;
}

.nav-btn:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.15);
}

.nav-btn.prev {
  margin-right: auto;
}

.nav-btn.next {
  margin-left: auto;
}

@media (min-width: 768px) {
  .reader-content {
    padding: 32px;
  }

  .chapter-title {
    font-size: 28px;
  }
}
</style>
