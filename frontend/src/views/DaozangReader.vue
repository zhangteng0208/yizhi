<template>
  <div class="chapter-reader">
    <van-nav-bar
      :title="bookTitle"
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
        <h1 class="chapter-title">{{ bookTitle }}</h1>
        <p class="chapter-number">正统道藏·正一部</p>
      </div>

      <div v-if="loading" class="loading">
        <van-loading type="spinner" color="var(--gold)">加载中...</van-loading>
      </div>

      <div v-else-if="content" class="chapter-text">
        <p
          v-for="(paragraph, index) in content.paragraphs"
          :key="index"
          class="paragraph"
          :id="`para-${index}`"
        >
          {{ paragraph }}
        </p>
      </div>

      <div v-else class="error">加载失败</div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { DATA_BASE_URL } from '@/config/data-source'
import { useReadingProgress, useAutoSaveProgress } from '@/composables/useReadingProgress'
import { useReaderSettings } from '@/composables/useReaderSettings'
import type { SearchResult } from '@/composables/useContentSearch'
import ReaderSettings from '@/components/ReaderSettings.vue'
import SearchPanel from '@/components/SearchPanel.vue'

const route = useRoute()
const bookId = route.params.bookId as string
const bookTitle = ref('')
const content = ref<any>(null)
const loading = ref(true)
const allChapters = ref<any[]>([])

const showSettings = ref(false)
const showSearch = ref(false)
const contentRef = ref<HTMLElement>()

// 初始化阅读设置（会自动应用CSS变量到document.documentElement）
useReaderSettings()
const { getProgress } = useReadingProgress()

// 自动保存进度
let autoSave: ReturnType<typeof useAutoSaveProgress> | null = null

onMounted(async () => {
  try {
    // 加载书籍列表获取标题
    const listResponse = await fetch(`${DATA_BASE_URL}/daozang/_booklist.json`)
    const books = await listResponse.json()
    const book = books.find((b: any) => b.id === bookId)
    if (book) {
      bookTitle.value = book.name
    }

    // 加载内容
    const response = await fetch(`${DATA_BASE_URL}/daozang/${bookId}.json`)
    const data = await response.json()
    content.value = data[0] // 取第一章（全文）

    // 准备搜索数据（将单章转换为数组格式）
    allChapters.value = [{
      chapter: bookTitle.value,
      paragraphs: content.value.paragraphs
    }]

    loading.value = false

    // 恢复阅读位置
    const progress = getProgress(`daozang_${bookId}`)
    if (progress && progress.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, progress.scrollPosition)
      }, 100)
    }

    // 启动自动保存
    autoSave = useAutoSaveProgress(
      `daozang_${bookId}`,
      1, // 道藏书籍只有一章
      bookTitle.value,
      bookTitle.value
    )
    autoSave.startAutoSave()
  } catch (error) {
    console.error('加载道藏内容失败:', error)
    loading.value = false
  }
})

onUnmounted(() => {
  // 停止自动保存
  if (autoSave) {
    autoSave.stopAutoSave()
  }
})

function handleSearchSelect(result: SearchResult) {
  // 滚动到对应段落
  const element = document.getElementById(`para-${result.paragraphIndex}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 高亮效果
    element.style.background = 'var(--gold-dim)'
    setTimeout(() => {
      element.style.background = ''
    }, 2000)
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

.error {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
  font-size: 16px;
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

@media (min-width: 768px) {
  .reader-content {
    padding: 32px;
  }

  .chapter-title {
    font-size: 28px;
  }
}
</style>
