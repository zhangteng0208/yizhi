<template>
  <div class="classic-detail">
    <van-nav-bar
      :title="bookTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="chapters-list">
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-item"
        @click="$router.push(`/classics/${bookId}/chapter/${chapter.id}`)"
      >
        <div class="chapter-number">{{ chapter.number }}</div>
        <div class="chapter-info">
          <h3 class="chapter-title">{{ chapter.title }}</h3>
          <p class="chapter-preview">{{ chapter.preview }}</p>
        </div>
        <svg class="chapter-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const bookId = computed(() => route.params.id as string)

interface Chapter {
  id: number
  number: string
  title: string
  preview: string
}

const bookTitles: Record<string, string> = {
  daodejing: '道德经',
  yijing: '易经',
  lunyu: '论语',
  zhuangzi: '庄子',
  mengzi: '孟子',
  sunzi: '孙子兵法',
  baopuzi: '抱朴子内篇',
  huangting: '黄庭内景经',
  guanyinzi: '关尹子',
  daxue: '大学',
  zhongyong: '中庸',
  mozi: '墨子',
  xinjing: '般若波罗蜜多心经',
  jingangjing: '金刚般若波罗蜜经',
  shijing: '诗经',
  chuci: '楚辞',
  guwenguanzhi: '古文观止',
  shiji: '史记·精选',
  huangdineijing: '黄帝内经·精选',
  chajing: '茶经'
}

const bookTitle = ref('经典')
const chapters = ref<Chapter[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadBookTitle()
  await loadChapters()
})

async function loadBookTitle() {
  // 如果是儒藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('ruzang/')) {
    try {
      const response = await fetch('/data/classics/ruzang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是佛藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('fozang/')) {
    try {
      const response = await fetch('/data/classics/fozang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是易藏书籍 (yz目录)，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('yz/')) {
    try {
      const response = await fetch('/data/classics/yz/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是医藏书籍 (yizang目录)，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('yizang/')) {
    try {
      const response = await fetch('/data/classics/yizang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是诗藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('shizang/')) {
    try {
      const response = await fetch('/data/classics/shizang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是集藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('jizang/')) {
    try {
      const response = await fetch('/data/classics/jizang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是子藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('zizang/')) {
    try {
      const response = await fetch('/data/classics/zizang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是史藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('shishizang/')) {
    try {
      const response = await fetch('/data/classics/shishizang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 如果是艺藏书籍，从 _booklist.json 中获取书名
  if (bookId.value.startsWith('yishuzang/')) {
    try {
      const response = await fetch('/data/classics/yishuzang/_booklist.json')
      const booklist = await response.json()
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        bookTitle.value = book.name
        return
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  // 使用固定的书名映射
  bookTitle.value = bookTitles[bookId.value] || '经典'
}

async function loadChapters() {
  loading.value = true
  try {
    let dataFile = ''

    // 处理儒藏书籍
    if (bookId.value.startsWith('ruzang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('ruzang/', '')
      dataFile = `/data/classics/ruzang/${fileName}.json`
    }
    // 处理佛藏书籍
    else if (bookId.value.startsWith('fozang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('fozang/', '')
      dataFile = `/data/classics/fozang/${fileName}.json`
    }
    // 处理易藏书籍 (yz目录)
    else if (bookId.value.startsWith('yz/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yz/', '')
      dataFile = `/data/classics/yz/${fileName}.json`
    }
    // 处理医藏书籍 (yizang目录)
    else if (bookId.value.startsWith('yizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yizang/', '')
      dataFile = `/data/classics/yizang/${fileName}.json`
    }
    // 处理诗藏书籍
    else if (bookId.value.startsWith('shizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('shizang/', '')
      dataFile = `/data/classics/shizang/${fileName}.json`
    }
    // 处理集藏书籍
    else if (bookId.value.startsWith('jizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('jizang/', '')
      dataFile = `/data/classics/jizang/${fileName}.json`
    }
    // 处理子藏书籍
    else if (bookId.value.startsWith('zizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('zizang/', '')
      dataFile = `/data/classics/zizang/${fileName}.json`
    }
    // 处理史藏书籍
    else if (bookId.value.startsWith('shishizang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('shishizang/', '')
      dataFile = `/data/classics/shishizang/${fileName}.json`
    }
    // 处理艺藏书籍
    else if (bookId.value.startsWith('yishuzang/')) {
      // URL 解码，处理中文字符
      const decodedBookId = decodeURIComponent(bookId.value)
      const fileName = decodedBookId.replace('yishuzang/', '')
      dataFile = `/data/classics/yishuzang/${fileName}.json`
    } else {
      // 处理固定的经典书籍
      const dataFiles: Record<string, string> = {
        daodejing: '/data/classics/daodejing.json',
        yijing: '/data/classics/yijing.json',
        lunyu: '/data/classics/lunyu.json',
        zhuangzi: '/data/classics/zhuangzi.json',
        mengzi: '/data/classics/mengzi.json',
        sunzi: '/data/classics/sunzi.json',
        baopuzi: '/data/classics/baopuzi.json',
        huangting: '/data/classics/huangting.json',
        guanyinzi: '/data/classics/guanyinzi.json',
        daxue: '/data/classics/daxue.json',
        zhongyong: '/data/classics/zhongyong.json',
        mozi: '/data/classics/mozi.json',
        xinjing: '/data/classics/xinjing.json',
        jingangjing: '/data/classics/jingangjing.json',
        shijing: '/data/classics/shijing.json',
        chuci: '/data/classics/chuci.json',
        guwenguanzhi: '/data/classics/guwenguanzhi.json',
        shiji: '/data/classics/shiji.json',
        huangdineijing: '/data/classics/huangdineijing.json',
        chajing: '/data/classics/chajing.json'
      }

      dataFile = dataFiles[bookId.value] || ''
    }

    if (!dataFile) {
      // 暂时没有数据的书籍，显示占位
      chapters.value = []
      loading.value = false
      return
    }

    const response = await fetch(dataFile)
    const data = await response.json()

    chapters.value = data.map((item: any, index: number) => ({
      id: index + 1,
      number: getChapterNumber(index + 1),
      title: item.chapter,
      preview: item.paragraphs[0]?.substring(0, 50) + '...'
    }))
  } catch (error) {
    console.error('加载章节失败:', error)
    chapters.value = []
  } finally {
    loading.value = false
  }
}

function getChapterNumber(num: number): string {
  if (bookId.value === 'yijing') return `第${num}卦`
  if (['lunyu', 'zhuangzi', 'mengzi', 'sunzi', 'mozi', 'shijing', 'chuci', 'guwenguanzhi'].includes(bookId.value)) return `第${num}篇`
  if (bookId.value === 'baopuzi') return `卷${num}`
  if (['huangting', 'guanyinzi', 'chajing'].includes(bookId.value)) return `第${num}章`
  if (['daxue', 'zhongyong', 'xinjing', 'jingangjing', 'shiji', 'huangdineijing'].includes(bookId.value)) return `全文`
  return `第${num}章`
}
</script>

<style scoped>
.classic-detail {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 32px;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.chapter-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.chapter-item:active::before {
  left: 100%;
}

.chapter-item:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.15);
}

.chapter-number {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 1px;
}

.chapter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.chapter-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 1px;
}

.chapter-preview {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-arrow {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.chapter-item:active .chapter-arrow {
  transform: translateX(4px);
}

@media (min-width: 768px) {
  .classic-detail {
    padding: 0 32px 32px;
  }

  .chapters-list {
    gap: 12px;
  }

  .chapter-item {
    padding: 20px;
  }

  .chapter-number {
    width: 56px;
    height: 56px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chapter-item,
  .chapter-item::before,
  .chapter-arrow {
    transition: none;
  }

  .chapter-item:active {
    transform: none;
  }

  .chapter-item:active .chapter-arrow {
    transform: none;
  }
}
</style>
