// 阅读进度管理
import { ref, watch } from 'vue'

interface ReadingProgress {
  bookId: string
  chapterId: number
  scrollPosition: number
  timestamp: number
  bookTitle?: string
  chapterTitle?: string
}

const STORAGE_KEY = 'reading_progress'

/**
 * 阅读进度管理 Composable
 */
export function useReadingProgress() {
  /**
   * 保存阅读进度
   */
  function saveProgress(progress: ReadingProgress) {
    try {
      const allProgress = getAllProgress()
      const key = `${progress.bookId}_${progress.chapterId}`

      allProgress[key] = {
        ...progress,
        timestamp: Date.now()
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress))
    } catch (error) {
      console.error('保存阅读进度失败:', error)
    }
  }

  /**
   * 获取指定书籍的阅读进度
   */
  function getProgress(bookId: string): ReadingProgress | null {
    try {
      const allProgress = getAllProgress()

      // 查找该书籍最新的阅读记录
      const bookProgress = Object.values(allProgress)
        .filter((p: any) => p.bookId === bookId)
        .sort((a: any, b: any) => b.timestamp - a.timestamp)

      return bookProgress[0] || null
    } catch (error) {
      console.error('获取阅读进度失败:', error)
      return null
    }
  }

  /**
   * 获取所有阅读进度
   */
  function getAllProgress(): Record<string, ReadingProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('读取阅读进度失败:', error)
      return {}
    }
  }

  /**
   * 获取最近阅读列表
   */
  function getRecentReading(limit: number = 10): ReadingProgress[] {
    try {
      const allProgress = getAllProgress()
      return Object.values(allProgress)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
    } catch (error) {
      console.error('获取最近阅读失败:', error)
      return []
    }
  }

  /**
   * 清除指定书籍的阅读进度
   */
  function clearProgress(bookId: string) {
    try {
      const allProgress = getAllProgress()
      const filtered = Object.fromEntries(
        Object.entries(allProgress).filter(([_, p]) => p.bookId !== bookId)
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('清除阅读进度失败:', error)
    }
  }

  /**
   * 清除所有阅读进度
   */
  function clearAllProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('清除所有阅读进度失败:', error)
    }
  }

  return {
    saveProgress,
    getProgress,
    getAllProgress,
    getRecentReading,
    clearProgress,
    clearAllProgress
  }
}

/**
 * 自动保存阅读进度的 Hook
 */
export function useAutoSaveProgress(
  bookId: string,
  chapterId: number,
  bookTitle?: string,
  chapterTitle?: string
) {
  const { saveProgress } = useReadingProgress()
  let saveTimer: number | null = null

  // 监听滚动位置
  function handleScroll() {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    // 防抖：停止滚动 1 秒后保存
    saveTimer = window.setTimeout(() => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop

      saveProgress({
        bookId,
        chapterId,
        scrollPosition,
        timestamp: Date.now(),
        bookTitle,
        chapterTitle
      })
    }, 1000)
  }

  // 页面卸载时保存
  function handleBeforeUnload() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop
    saveProgress({
      bookId,
      chapterId,
      scrollPosition,
      timestamp: Date.now(),
      bookTitle,
      chapterTitle
    })
  }

  // 启动自动保存
  function startAutoSave() {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  // 停止自动保存
  function stopAutoSave() {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }

  return {
    startAutoSave,
    stopAutoSave
  }
}
