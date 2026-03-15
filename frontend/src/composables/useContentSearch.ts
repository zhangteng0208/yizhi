// 内容搜索功能
import { ref, computed } from 'vue'

export interface SearchResult {
  chapterId: number
  chapterTitle: string
  paragraphIndex: number
  paragraph: string
  matchText: string
  beforeText: string
  afterText: string
}

/**
 * 内容搜索 Composable
 */
export function useContentSearch() {
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const searching = ref(false)
  const currentIndex = ref(0)

  /**
   * 在章节数据中搜索
   */
  function search(chapters: any[], query: string): SearchResult[] {
    if (!query.trim()) {
      return []
    }

    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    chapters.forEach((chapter, chapterIndex) => {
      const chapterId = chapterIndex + 1
      const chapterTitle = chapter.chapter || `第${chapterId}章`

      // 搜索每个段落
      chapter.paragraphs?.forEach((paragraph: string, paragraphIndex: number) => {
        const lowerParagraph = paragraph.toLowerCase()
        let startIndex = 0

        // 查找所有匹配位置
        while (true) {
          const matchIndex = lowerParagraph.indexOf(lowerQuery, startIndex)
          if (matchIndex === -1) break

          // 提取匹配文本和上下文
          const matchText = paragraph.substring(matchIndex, matchIndex + query.length)
          const contextStart = Math.max(0, matchIndex - 20)
          const contextEnd = Math.min(paragraph.length, matchIndex + query.length + 20)

          const beforeText = paragraph.substring(contextStart, matchIndex)
          const afterText = paragraph.substring(matchIndex + query.length, contextEnd)

          results.push({
            chapterId,
            chapterTitle,
            paragraphIndex,
            paragraph,
            matchText,
            beforeText: contextStart > 0 ? '...' + beforeText : beforeText,
            afterText: contextEnd < paragraph.length ? afterText + '...' : afterText
          })

          startIndex = matchIndex + 1
        }
      })
    })

    return results
  }

  /**
   * 执行搜索
   */
  async function performSearch(chapters: any[], query: string) {
    searching.value = true
    searchQuery.value = query

    try {
      // 模拟异步搜索（避免阻塞UI）
      await new Promise(resolve => setTimeout(resolve, 100))
      searchResults.value = search(chapters, query)
      currentIndex.value = 0
    } finally {
      searching.value = false
    }
  }

  /**
   * 清除搜索
   */
  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
    currentIndex.value = 0
  }

  /**
   * 下一个结果
   */
  function nextResult() {
    if (searchResults.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % searchResults.value.length
    }
  }

  /**
   * 上一个结果
   */
  function prevResult() {
    if (searchResults.value.length > 0) {
      currentIndex.value = currentIndex.value === 0
        ? searchResults.value.length - 1
        : currentIndex.value - 1
    }
  }

  /**
   * 当前结果
   */
  const currentResult = computed(() => {
    return searchResults.value[currentIndex.value] || null
  })

  /**
   * 结果统计
   */
  const resultStats = computed(() => {
    return {
      total: searchResults.value.length,
      current: searchResults.value.length > 0 ? currentIndex.value + 1 : 0
    }
  })

  return {
    searchQuery,
    searchResults,
    searching,
    currentIndex,
    currentResult,
    resultStats,
    performSearch,
    clearSearch,
    nextResult,
    prevResult
  }
}

/**
 * 搜索历史管理
 */
const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10

export function useSearchHistory() {
  /**
   * 获取搜索历史
   */
  function getHistory(): string[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('读取搜索历史失败:', error)
      return []
    }
  }

  /**
   * 添加搜索历史
   */
  function addHistory(query: string) {
    if (!query.trim()) return

    try {
      let history = getHistory()

      // 移除重复项
      history = history.filter(item => item !== query)

      // 添加到开头
      history.unshift(query)

      // 限制数量
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY)
      }

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  /**
   * 清除搜索历史
   */
  function clearHistory() {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }

  /**
   * 删除单条历史
   */
  function removeHistory(query: string) {
    try {
      let history = getHistory()
      history = history.filter(item => item !== query)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('删除搜索历史失败:', error)
    }
  }

  return {
    getHistory,
    addHistory,
    clearHistory,
    removeHistory
  }
}
