<template>
  <div class="classics-page">
    <van-nav-bar
      :title="categoryTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 搜索框 -->
    <div class="search-container">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索书名..."
        shape="round"
        background="transparent"
        @clear="searchKeyword = ''"
      />
    </div>

    <!-- 无搜索结果提示 -->
    <div v-if="searchKeyword && filteredBooks.length === 0" class="no-results">
      <svg viewBox="0 0 64 64" class="no-results-icon">
        <circle cx="26" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="3"/>
        <line x1="38" y1="38" x2="50" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <p class="no-results-text">未找到相关书籍</p>
      <p class="no-results-hint">试试其他关键词</p>
    </div>

    <div class="classics-grid">
      <div
        v-for="book in filteredBooks"
        :key="book.id"
        class="book-card"
        @click="handleBookClick(book)"
      >
        <div class="book-cover" :style="{
          background: `linear-gradient(135deg, rgba(${currentColors.rgba}, 0.15) 0%, rgba(${currentColors.rgba}, 0.08) 100%)`,
          boxShadow: `inset 0 1px 3px rgba(${currentColors.rgba}, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2)`
        }">
          <svg class="book-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" :style="{
            background: `linear-gradient(135deg, ${currentColors.light} 0%, ${currentColors.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 2px 4px rgba(${currentColors.rgba}, 0.3))`
          }">
            <path d="M816 64h-88v112h104V80c0-8.8-7.2-16-16-16zM192 80v864c0 8.8 7.2 16 16 16h504V64H208c-8.8 0-16 7.2-16 16z m64 72c0-8.8 7.2-16 16-16h160c8.8 0 16 7.2 16 16v528c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V152z m544 696h-72v112h88c8.8 0 16-7.2 16-16v-96h-32z m0-464h-72v240h104V384h-16z m0 256h-72v192h104V640h-16z m0-448h-72v176h104V192h-16z" :fill="currentColors.light"/>
            <path d="M432 136H272c-8.8 0-16 7.2-16 16v528c0 8.8 7.2 16 16 16h160c8.8 0 16-7.2 16-16V152c0-8.8-7.2-16-16-16z m-16 528H288V168h128v496z" :fill="currentColors.dark"/>
            <text x="352" y="420" font-size="80" :fill="currentColors.light" text-anchor="middle" font-family="Songti SC, STSong, SimSun, serif" writing-mode="tb">{{ book.title.slice(0, 5) }}</text>
          </svg>
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-desc">{{ book.desc }}</p>
          <div class="book-meta">
            <span class="book-chapters" :style="{
              background: `rgba(${currentColors.rgba}, 0.12)`,
              border: `1px solid rgba(${currentColors.rgba}, 0.25)`,
              color: currentColors.light
            }">{{ book.chapters }}{{ getChapterUnit(book.id) }}</span>
            <span class="book-category" :style="{
              background: `rgba(${currentColors.rgba}, 0.08)`,
              border: `1px solid rgba(${currentColors.rgba}, 0.2)`,
              color: currentColors.dark
            }">{{ book.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DATA_BASE_URL } from '@/config/data-source'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => route.params.categoryId as string)

// 搜索关键词
const searchKeyword = ref('')

const categoryTitles: Record<string, string> = {
  dao: '道藏',
  fo: '佛藏',
  ru: '儒藏',
  ji: '集藏',
  shi: '诗藏',
  shishi: '史藏',
  yi: '医藏',
  yishu: '艺藏',
  yijing: '易藏',
  zi: '子藏'
}

const categoryTitle = computed(() => categoryTitles[categoryId.value] || '国学经典')

// 每个分类的主题色配置
const categoryColors: Record<string, { light: string; dark: string; rgba: string }> = {
  dao: { light: '#0891B2', dark: '#0E7490', rgba: '8, 145, 178' }, // 青色 - 道家清静
  fo: { light: '#F59E0B', dark: '#D97706', rgba: '245, 158, 11' }, // 金色 - 佛教庄严
  ru: { light: '#FFFFFF', dark: '#E5E5E5', rgba: '255, 255, 255' }, // 白色 - 儒家纯正
  ji: { light: '#9333EA', dark: '#6B21A8', rgba: '147, 51, 234' }, // 紫色 - 文集典雅
  shi: { light: '#EC4899', dark: '#BE185D', rgba: '236, 72, 153' }, // 粉色 - 诗词浪漫
  shishi: { light: '#8B5A3C', dark: '#654321', rgba: '139, 90, 60' }, // 棕色 - 史书厚重
  yi: { light: '#10B981', dark: '#059669', rgba: '16, 185, 129' }, // 绿色 - 医学生机
  yishu: { light: '#8B5C2E', dark: '#654321', rgba: '139, 92, 46' }, // 褐色 - 艺术古朴
  yijing: { light: '#6366F1', dark: '#4338CA', rgba: '99, 102, 241' }, // 靛蓝 - 易学玄妙
  zi: { light: '#EF4444', dark: '#B91C1C', rgba: '239, 68, 68' } // 橙红 - 诸子百家
}

const currentColors = computed(() => categoryColors[categoryId.value] || categoryColors.dao)

const books = ref([
  // 道藏
  {
    id: 'daodejing',
    title: '道德经',
    desc: '老子著，道家哲学思想的重要来源',
    chapters: 81,
    category: '道家',
    categoryId: 'dao'
  },
  {
    id: 'zhuangzi',
    title: '庄子',
    desc: '庄周及其后学所著，道家思想的重要著作',
    chapters: 33,
    category: '道家',
    categoryId: 'dao'
  },
  {
    id: 'baopuzi',
    title: '抱朴子内篇',
    desc: '葛洪著，道教养生修炼的重要著作',
    chapters: 20,
    category: '道家',
    categoryId: 'dao'
  },
  {
    id: 'huangting',
    title: '黄庭内景经',
    desc: '道教内丹修炼经典，阐述人体精气神修炼之法',
    chapters: 36,
    category: '道家',
    categoryId: 'dao'
  },
  {
    id: 'guanyinzi',
    title: '关尹子',
    desc: '关尹著，道家哲学重要著作，论述道之本源',
    chapters: 9,
    category: '道家',
    categoryId: 'dao'
  },
  // 儒藏
  {
    id: 'lunyu',
    title: '论语',
    desc: '孔子及其弟子的语录结集，儒家重要经典',
    chapters: 20,
    category: '儒家',
    categoryId: 'ru'
  },
  {
    id: 'mengzi',
    title: '孟子',
    desc: '孟子及其弟子所著，阐述仁政、民本思想',
    chapters: 14,
    category: '儒家',
    categoryId: 'ru'
  },
  {
    id: 'daxue',
    title: '大学',
    desc: '四书之一，阐述修身齐家治国平天下之道',
    chapters: 1,
    category: '儒家',
    categoryId: 'ru'
  },
  {
    id: 'zhongyong',
    title: '中庸',
    desc: '四书之一，论述中庸之道与诚的哲学',
    chapters: 1,
    category: '儒家',
    categoryId: 'ru'
  },
  // 易藏
  {
    id: 'yijing',
    title: '易经',
    desc: '群经之首，阐述天地世间关于万象变化的古老经典',
    chapters: 63,
    category: '易学',
    categoryId: 'yijing'
  },
  // 子藏
  {
    id: 'sunzi',
    title: '孙子兵法',
    desc: '孙武著，世界上最早的军事著作',
    chapters: 13,
    category: '兵家',
    categoryId: 'zi'
  },
  {
    id: 'mozi',
    title: '墨子',
    desc: '墨翟著，墨家学派代表作，主张兼爱非攻',
    chapters: 50,
    category: '诸子',
    categoryId: 'zi'
  },
  // 佛藏
  {
    id: 'xinjing',
    title: '般若波罗蜜多心经',
    desc: '玄奘译，佛教般若思想的精髓，260字浓缩大乘佛法',
    chapters: 1,
    category: '佛经',
    categoryId: 'fo'
  },
  {
    id: 'jingangjing',
    title: '金刚般若波罗蜜经',
    desc: '鸠摩罗什译，阐述般若空性，破除一切执著',
    chapters: 1,
    category: '佛经',
    categoryId: 'fo'
  },
  // 诗藏
  {
    id: 'shijing',
    title: '诗经',
    desc: '中国最早的诗歌总集，收录西周至春秋诗歌',
    chapters: 267,
    category: '诗歌',
    categoryId: 'shi'
  },
  {
    id: 'chuci',
    title: '楚辞',
    desc: '屈原等人创作，浪漫主义诗歌的源头',
    chapters: 64,
    category: '诗歌',
    categoryId: 'shi'
  },
  // 集藏
  {
    id: 'guwenguanzhi',
    title: '古文观止',
    desc: '清代吴楚材、吴调侯编选，收录历代散文名篇',
    chapters: 222,
    category: '文集',
    categoryId: 'ji'
  },
  // 史藏
  {
    id: 'shiji',
    title: '史记·精选',
    desc: '司马迁著，中国第一部纪传体通史，精选列传',
    chapters: 1,
    category: '史书',
    categoryId: 'shishi'
  },
  // 医藏
  {
    id: 'huangdineijing',
    title: '黄帝内经·精选',
    desc: '中医理论奠基之作，精选素问篇章',
    chapters: 1,
    category: '医学',
    categoryId: 'yi'
  },
  // 艺藏
  {
    id: 'chajing',
    title: '茶经',
    desc: '陆羽著，世界第一部茶学专著，茶文化经典',
    chapters: 4,
    category: '艺术',
    categoryId: 'yishu'
  }
])

// 加载道藏和儒藏书籍
onMounted(async () => {
  const BASE_URL = DATA_BASE_URL

  // 加载道藏
  if (categoryId.value === 'dao') {
    try {
      const response = await fetch(`${BASE_URL}/daozang/_booklist.json`)
      const daozangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'dao')

      daozangBooks.forEach((book: any) => {
        books.value.push({
          id: `daozang/${book.id}`,
          title: book.name,
          desc: `正统道藏·正一部`,
          chapters: book.chapters,
          category: '道藏',
          categoryId: 'dao'
        } as any)
      })
    } catch (error) {
      console.error('加载道藏书籍失败:', error)
    }
  }

  // 加载儒藏
  if (categoryId.value === 'ru') {
    try {
      const response = await fetch(`${BASE_URL}/ruzang/_booklist.json`)
      const ruzangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'ru')

      ruzangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '儒藏',
          categoryId: 'ru'
        } as any)
      })
    } catch (error) {
      console.error('加载儒藏书籍失败:', error)
    }
  }

  // 加载佛藏
  if (categoryId.value === 'fo') {
    try {
      const response = await fetch(`${BASE_URL}/fozang/_booklist.json`)
      const fozangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'fo')

      fozangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '佛藏',
          categoryId: 'fo'
        } as any)
      })
    } catch (error) {
      console.error('加载佛藏书籍失败:', error)
    }
  }

  // 加载易藏
  if (categoryId.value === 'yijing') {
    try {
      const response = await fetch(`${BASE_URL}/yz/_booklist.json`)
      const yzBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'yijing')

      yzBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '易藏',
          categoryId: 'yijing'
        } as any)
      })
    } catch (error) {
      console.error('加载易藏书籍失败:', error)
    }
  }

  // 加载医藏
  if (categoryId.value === 'yi') {
    try {
      const response = await fetch(`${BASE_URL}/yizang/_booklist.json`)
      const yizangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'yi')

      yizangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '医藏',
          categoryId: 'yi'
        } as any)
      })
    } catch (error) {
      console.error('加载医藏书籍失败:', error)
    }
  }

  // 加载诗藏
  if (categoryId.value === 'shi') {
    try {
      const response = await fetch(`${BASE_URL}/shizang/_booklist.json`)
      const shizangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'shi')

      shizangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '诗藏',
          categoryId: 'shi'
        } as any)
      })
    } catch (error) {
      console.error('加载诗藏书籍失败:', error)
    }
  }

  // 加载集藏
  if (categoryId.value === 'ji') {
    try {
      const response = await fetch(`${BASE_URL}/jizang/_booklist.json`)
      const jizangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'ji')

      jizangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '集藏',
          categoryId: 'ji'
        } as any)
      })
    } catch (error) {
      console.error('加载集藏书籍失败:', error)
    }
  }

  // 加载子藏
  if (categoryId.value === 'zi') {
    try {
      const response = await fetch(`${BASE_URL}/zizang/_booklist.json`)
      const zizangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'zi')

      zizangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '子藏',
          categoryId: 'zi'
        } as any)
      })
    } catch (error) {
      console.error('加载子藏书籍失败:', error)
    }
  }

  // 加载史藏
  if (categoryId.value === 'shishi') {
    try {
      const response = await fetch(`${BASE_URL}/shishizang/_booklist.json`)
      const shishizangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'shishi')

      shishizangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '史藏',
          categoryId: 'shishi'
        } as any)
      })
    } catch (error) {
      console.error('加载史藏书籍失败:', error)
    }
  }

  // 加载艺藏
  if (categoryId.value === 'yishu') {
    try {
      const response = await fetch(`${BASE_URL}/yishuzang/_booklist.json`)
      const yishuzangBooks = await response.json()

      // 清空现有书籍，只保留当前分类
      books.value = books.value.filter(book => book.categoryId !== 'yishu')

      yishuzangBooks.forEach((book: any) => {
        books.value.push({
          id: book.id,
          title: book.name,
          desc: `${book.category}`,
          chapters: book.chapters,
          category: '艺藏',
          categoryId: 'yishu'
        } as any)
      })
    } catch (error) {
      console.error('加载艺藏书籍失败:', error)
    }
  }
})

const filteredBooks = computed(() => {
  let result = books.value.filter(book => book.categoryId === categoryId.value)

  // 如果有搜索关键词，进一步过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(book =>
      book.title.toLowerCase().includes(keyword) ||
      book.desc.toLowerCase().includes(keyword)
    )
  }

  return result
})

function getChapterUnit(bookId: string): string {
  if (bookId === 'yijing') return '卦'
  if (['lunyu', 'zhuangzi', 'mengzi', 'sunzi', 'mozi', 'shijing', 'chuci', 'guwenguanzhi'].includes(bookId)) return '篇'
  if (bookId === 'baopuzi') return '卷'
  if (['daxue', 'zhongyong', 'xinjing', 'jingangjing', 'shiji', 'huangdineijing'].includes(bookId)) return '篇'
  if (bookId === 'chajing') return '章'
  return '章'
}

function handleBookClick(book: any) {
  if (book.id.startsWith('daozang/')) {
    // 道藏书籍跳转到道藏阅读器
    const bookId = book.id.replace('daozang/', '')
    router.push(`/daozang/${bookId}`)
  } else if (book.id.startsWith('ruzang/') || book.id.startsWith('fozang/') ||
             book.id.startsWith('yz/') || book.id.startsWith('yizang/') ||
             book.id.startsWith('shizang/') || book.id.startsWith('jizang/') ||
             book.id.startsWith('zizang/') || book.id.startsWith('shishizang/') ||
             book.id.startsWith('yishuzang/')) {
    // 其他藏书籍跳转到通用阅读器
    router.push(`/classics/${book.id}`)
  } else {
    router.push(`/classics/${book.id}`)
  }
}
</script>

<style scoped>
.classics-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.search-container {
  padding: 12px 0 8px;
  position: sticky;
  top: 46px;
  background: var(--bg-primary);
  z-index: 10;
}

.search-container :deep(.van-search) {
  padding: 0;
}

.search-container :deep(.van-search__content) {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

.search-container :deep(.van-field__control) {
  color: var(--text-primary);
}

.search-container :deep(.van-field__control::placeholder) {
  color: var(--text-tertiary);
}

.search-container :deep(.van-icon) {
  color: var(--text-secondary);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.no-results-icon {
  width: 80px;
  height: 80px;
  color: var(--text-tertiary);
  opacity: 0.5;
  margin-bottom: 20px;
}

.no-results-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
}

.no-results-hint {
  font-size: 13px;
  color: var(--text-tertiary);
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
}

.classics-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  padding-bottom: 40px;
  overflow: visible;
}

.book-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: 16px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.book-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--category-color), 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:active::before {
  left: 100%;
}

.book-card:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(var(--category-color), 0.2);
}

.book-cover {
  width: 90px;
  height: 110px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 6px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.book-svg {
  width: 110%;
  height: 110%;
}

.book-svg text {
  font-weight: 500;
  letter-spacing: 8px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  min-width: 0;
}

.book-title {
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  letter-spacing: 2px;
  line-height: 1.3;
}

.book-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.book-meta {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.book-chapters,
.book-category {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

@media (min-width: 768px) {
  .classics-page {
    padding: 0 32px 80px;
  }

  .classics-grid {
    gap: 20px;
  }

  .book-card {
    padding: 24px;
  }

  .book-cover {
    width: 110px;
    height: 130px;
    padding: 8px;
  }

  .book-title {
    font-size: 20px;
  }

  .book-desc {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-card,
  .book-card::before,
  .book-cover::before {
    transition: none;
  }

  .book-card:active {
    transform: none;
  }
}
</style>
