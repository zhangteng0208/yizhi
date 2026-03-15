// 书籍阅读通用逻辑
import { ref, computed } from 'vue'
import { DATA_BASE_URL } from '@/config/data-source'

// 书籍数据源配置
const BOOK_SOURCES = {
  ruzang: { path: '/ruzang', hasBooklist: true },
  fozang: { path: '/fozang', hasBooklist: true },
  daozang: { path: '/daozang', hasBooklist: true },
  yz: { path: '/yz', hasBooklist: true },
  yizang: { path: '/yizang', hasBooklist: true },
  shizang: { path: '/shizang', hasBooklist: true },
  jizang: { path: '/jizang', hasBooklist: true },
  zizang: { path: '/zizang', hasBooklist: true },
  shishizang: { path: '/shishizang', hasBooklist: true },
  yishuzang: { path: '/yishuzang', hasBooklist: true }
}

// 固定书籍映射
const FIXED_BOOKS: Record<string, string> = {
  daodejing: '/daodejing.json',
  yijing: '/yijing.json',
  lunyu: '/lunyu.json',
  zhuangzi: '/zhuangzi.json',
  mengzi: '/mengzi.json',
  sunzi: '/sunzi.json',
  baopuzi: '/baopuzi.json',
  huangting: '/huangting.json',
  guanyinzi: '/guanyinzi.json',
  daxue: '/daxue.json',
  zhongyong: '/zhongyong.json',
  mozi: '/mozi.json',
  xinjing: '/xinjing.json',
  jingangjing: '/jingangjing.json',
  shijing: '/shijing.json',
  chuci: '/chuci.json',
  guwenguanzhi: '/guwenguanzhi.json',
  shiji: '/shiji.json',
  huangdineijing: '/huangdineijing.json',
  chajing: '/chajing.json'
}

// 书名映射
const BOOK_TITLES: Record<string, string> = {
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

/**
 * 获取书籍数据文件路径
 */
export function getBookDataPath(bookId: string): string {
  // 检查是否是固定书籍
  if (FIXED_BOOKS[bookId]) {
    return `${DATA_BASE_URL}${FIXED_BOOKS[bookId]}`
  }

  // 检查是否是藏书
  for (const [key, config] of Object.entries(BOOK_SOURCES)) {
    if (bookId.startsWith(`${key}/`)) {
      const decodedBookId = decodeURIComponent(bookId)
      const fileName = decodedBookId.replace(`${key}/`, '')
      return `${DATA_BASE_URL}${config.path}/${fileName}.json`
    }
  }

  return ''
}

/**
 * 获取书籍列表路径
 */
export function getBooklistPath(bookId: string): string | null {
  for (const [key, config] of Object.entries(BOOK_SOURCES)) {
    if (bookId.startsWith(`${key}/`) && config.hasBooklist) {
      return `${DATA_BASE_URL}${config.path}/_booklist.json`
    }
  }
  return null
}

/**
 * 加载书名
 */
export async function loadBookTitle(bookId: string): Promise<string> {
  // 固定书籍直接返回
  if (BOOK_TITLES[bookId]) {
    return BOOK_TITLES[bookId]
  }

  // 从书籍列表加载
  const booklistPath = getBooklistPath(bookId)
  if (booklistPath) {
    try {
      const response = await fetch(booklistPath)
      const booklist = await response.json()
      const decodedBookId = decodeURIComponent(bookId)
      const book = booklist.find((b: any) => b.id === decodedBookId)
      if (book) {
        return book.name
      }
    } catch (error) {
      console.error('加载书名失败:', error)
    }
  }

  return '经典'
}

/**
 * 获取章节编号格式
 */
export function getChapterNumber(bookId: string, num: number): string {
  if (bookId === 'yijing') return `第${num}卦`
  if (['lunyu', 'zhuangzi', 'mengzi', 'sunzi', 'mozi', 'shijing', 'chuci', 'guwenguanzhi'].includes(bookId)) {
    return `第${num}篇`
  }
  if (bookId === 'baopuzi') return `卷${num}`
  if (['huangting', 'guanyinzi', 'chajing'].includes(bookId)) return `第${num}章`
  if (['daxue', 'zhongyong', 'xinjing', 'jingangjing', 'shiji', 'huangdineijing'].includes(bookId)) {
    return `全文`
  }
  return `第${num}章`
}

/**
 * 书籍阅读器 Composable
 */
export function useBookReader(bookId: string) {
  const chapters = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadChapters() {
    loading.value = true
    error.value = null

    try {
      const dataPath = getBookDataPath(bookId)
      if (!dataPath) {
        throw new Error('未找到书籍数据')
      }

      const response = await fetch(dataPath)
      const data = await response.json()
      chapters.value = data
      return data
    } catch (e: any) {
      error.value = e.message
      console.error('加载章节失败:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    chapters,
    loading,
    error,
    loadChapters
  }
}
