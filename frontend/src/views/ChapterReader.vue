<template>
  <div class="chapter-reader">
    <van-nav-bar
      :title="chapterTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="reader-content">
      <div class="chapter-header">
        <h1 class="chapter-title">{{ chapterTitle }}</h1>
        <p class="chapter-number">{{ chapterNumber }}</p>
      </div>

      <div class="chapter-text">
        <p v-for="(paragraph, index) in content" :key="index" class="paragraph">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DATA_BASE_URL } from '@/config/data-source'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => route.params.id as string)
const chapterId = computed(() => Number(route.params.chapterId))

const chapterTitle = ref('')
const content = ref<string[]>([])
const loading = ref(true)
const maxChapters = ref(100)

onMounted(async () => {
  await loadChapter()
})

watch(() => route.params.chapterId, async () => {
  await loadChapter()
})

async function loadChapter() {
  loading.value = true
  try {
    let dataFile = ''

    const BASE_URL = DATA_BASE_URL
    
    // 处理儒藏书籍
    if (bookId.value.startsWith('ruzang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('ruzang/', '')
      dataFile = `${BASE_URL}/ruzang/${fileName}.json`
    }
    // 处理佛藏书籍
    else if (bookId.value.startsWith('fozang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('fozang/', '')
      dataFile = `${BASE_URL}/fozang/${fileName}.json`
    }
    // 处理易藏书籍 (yz目录)
    else if (bookId.value.startsWith('yz/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yz/', '')
      dataFile = `${BASE_URL}/yz/${fileName}.json`
    }
    // 处理医藏书籍 (yizang目录)
    else if (bookId.value.startsWith('yizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yizang/', '')
      dataFile = `${BASE_URL}/yizang/${fileName}.json`
    }
    // 处理诗藏书籍
    else if (bookId.value.startsWith('shizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('shizang/', '')
      dataFile = `${BASE_URL}/shizang/${fileName}.json`
    }
    // 处理集藏书籍
    else if (bookId.value.startsWith('jizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('jizang/', '')
      dataFile = `${BASE_URL}/jizang/${fileName}.json`
    }
    // 处理子藏书籍
    else if (bookId.value.startsWith('zizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('zizang/', '')
      dataFile = `${BASE_URL}/zizang/${fileName}.json`
    }
    // 处理史藏书籍
    else if (bookId.value.startsWith('shishizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('shishizang/', '')
      dataFile = `${BASE_URL}/shishizang/${fileName}.json`
    }
    // 处理艺藏书籍
    else if (bookId.value.startsWith('yishuzang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yishuzang/', '')
      dataFile = `${BASE_URL}/yishuzang/${fileName}.json`
    } else {
      // 处理固定的经典书籍
      const dataFiles: Record<string, string> = {
        daodejing: `${BASE_URL}/daodejing.json`,
        yijing: `${BASE_URL}/yijing.json`,
        lunyu: `${BASE_URL}/lunyu.json`,
        zhuangzi: `${BASE_URL}/zhuangzi.json`,
        mengzi: `${BASE_URL}/mengzi.json`,
        sunzi: `${BASE_URL}/sunzi.json`,
        baopuzi: `${BASE_URL}/baopuzi.json`,
        huangting: `${BASE_URL}/huangting.json`,
        guanyinzi: `${BASE_URL}/guanyinzi.json`,
        daxue: `${BASE_URL}/daxue.json`,
        zhongyong: `${BASE_URL}/zhongyong.json`,
        mozi: `${BASE_URL}/mozi.json`,
        xinjing: `${BASE_URL}/xinjing.json`,
        jingangjing: `${BASE_URL}/jingangjing.json`,
        shijing: `${BASE_URL}/shijing.json`,
        chuci: `${BASE_URL}/chuci.json`,
        guwenguanzhi: `${BASE_URL}/guwenguanzhi.json`,
        shiji: `${BASE_URL}/shiji.json`,
        huangdineijing: `${BASE_URL}/huangdineijing.json`,
        chajing: `${BASE_URL}/chajing.json`
      }

      dataFile = dataFiles[bookId.value] || ''
    }

    if (!dataFile) {
      chapterTitle.value = '章节'
      content.value = ['内容暂未加载...']
      loading.value = false
      return
    }

    const response = await fetch(dataFile)
    const data = await response.json()

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
  if (bookId.value === 'yijing') return `第${chapterId.value}卦`
  if (['lunyu', 'zhuangzi', 'mengzi', 'sunzi', 'mozi', 'shijing', 'chuci', 'guwenguanzhi'].includes(bookId.value)) {
    return `第${chapterId.value}篇`
  }
  if (bookId.value === 'baopuzi') return `卷${chapterId.value}`
  if (['huangting', 'guanyinzi', 'chajing'].includes(bookId.value)) return `第${chapterId.value}章`
  if (['daxue', 'zhongyong', 'xinjing', 'jingangjing', 'shiji', 'huangdineijing'].includes(bookId.value)) return '全文'
  return `第${chapterId.value}章`
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
</script>

<style scoped>
.chapter-reader {
  min-height: 100vh;
  background: var(--bg-primary);
}

.reader-content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.chapter-header {
  text-align: center;
  padding: 24px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.chapter-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
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
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
}

.chapter-text {
  line-height: 2;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  margin-bottom: 48px;
}

.paragraph {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-indent: 2em;
  letter-spacing: 1px;
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

  .paragraph {
    font-size: 18px;
    margin-bottom: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-btn {
    transition: none;
  }

  .nav-btn:active {
    transform: none;
  }
}
</style>
