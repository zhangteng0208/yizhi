<template>
  <van-popup
    v-model:show="visible"
    position="top"
    :style="{ height: '100%' }"
  >
    <div class="search-panel">
      <!-- 搜索框 -->
      <div class="search-header">
        <van-search
          v-model="searchQuery"
          placeholder="搜索内容"
          show-action
          autofocus
          @search="handleSearch"
        >
          <template #left>
            <button class="back-btn" @click="visible = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </template>
          <template #action>
            <div @click="handleSearch">搜索</div>
          </template>
        </van-search>
      </div>

      <!-- 搜索历史 -->
      <div v-if="!searching && searchResults.length === 0 && !searchQuery" class="search-history">
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <button v-if="history.length > 0" class="clear-btn" @click="handleClearHistory">
            清空
          </button>
        </div>
        <div v-if="history.length > 0" class="history-list">
          <div
            v-for="(item, index) in history"
            :key="index"
            class="history-item"
            @click="searchQuery = item; handleSearch()"
          >
            <svg class="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span class="history-text">{{ item }}</span>
            <button class="remove-btn" @click.stop="handleRemoveHistory(item)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div v-else class="empty-history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <p>暂无搜索历史</p>
        </div>
      </div>

      <!-- 搜索中 -->
      <div v-if="searching" class="searching">
        <van-loading type="spinner" color="var(--gold)">搜索中...</van-loading>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <span class="results-count">找到 {{ resultStats.total }} 个结果</span>
          <div class="results-nav">
            <button class="nav-btn" @click="prevResult" :disabled="resultStats.total === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <span class="nav-text">{{ resultStats.current }}/{{ resultStats.total }}</span>
            <button class="nav-btn" @click="nextResult" :disabled="resultStats.total === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="results-list">
          <div
            v-for="(result, index) in searchResults"
            :key="index"
            class="result-item"
            :class="{ active: index === currentIndex }"
            @click="handleSelectResult(result, index)"
          >
            <div class="result-chapter">{{ result.chapterTitle }}</div>
            <div class="result-content">
              <span class="result-before">{{ result.beforeText }}</span>
              <span class="result-match">{{ result.matchText }}</span>
              <span class="result-after">{{ result.afterText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else-if="searchQuery && !searching" class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>未找到"{{ searchQuery }}"相关内容</p>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useContentSearch, useSearchHistory, type SearchResult } from '@/composables/useContentSearch'
import { showConfirmDialog } from 'vant'

const props = defineProps<{
  show: boolean
  chapters: any[]
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select': [result: SearchResult]
}>()

const visible = ref(props.show)
const {
  searchQuery,
  searchResults,
  searching,
  currentIndex,
  resultStats,
  performSearch,
  clearSearch,
  nextResult,
  prevResult
} = useContentSearch()

const { getHistory, addHistory, clearHistory, removeHistory } = useSearchHistory()
const history = ref<string[]>(getHistory())

watch(() => props.show, (val) => {
  visible.value = val
  if (val) {
    history.value = getHistory()
  } else {
    clearSearch()
  }
})

watch(visible, (val) => {
  emit('update:show', val)
})

async function handleSearch() {
  if (!searchQuery.value.trim()) return

  addHistory(searchQuery.value)
  history.value = getHistory()
  await performSearch(props.chapters, searchQuery.value)
}

function handleSelectResult(result: SearchResult, index: number) {
  currentIndex.value = index
  emit('select', result)
  visible.value = false
}

async function handleClearHistory() {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '确定要清空搜索历史吗？'
    })
    clearHistory()
    history.value = []
  } catch {
    // 用户取消
  }
}

function handleRemoveHistory(item: string) {
  removeHistory(item)
  history.value = getHistory()
}
</script>

<style scoped>
.search-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.search-header {
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  margin-right: 8px;
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.back-btn:active {
  opacity: 0.6;
}

.search-history,
.search-results,
.searching,
.no-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 搜索历史 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title {
  font-size: 14px;
  color: var(--text-secondary);
}

.clear-btn {
  font-size: 13px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:active {
  transform: scale(0.98);
  background: var(--bg-secondary);
}

.history-icon {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.remove-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
}

.remove-btn svg {
  width: 16px;
  height: 16px;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.empty-history svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-history p {
  font-size: 14px;
}

/* 搜索中 */
.searching {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

/* 搜索结果 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.results-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.results-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):active {
  transform: scale(0.95);
}

.nav-btn svg {
  width: 16px;
  height: 16px;
}

.nav-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item.active {
  border-color: var(--gold);
  background: var(--gold-dim);
}

.result-item:active {
  transform: scale(0.98);
}

.result-chapter {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.result-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

.result-before,
.result-after {
  color: var(--text-secondary);
}

.result-match {
  color: var(--gold);
  font-weight: 600;
  background: var(--gold-dim);
  padding: 2px 4px;
  border-radius: 4px;
}

/* 无结果 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.no-results svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-results p {
  font-size: 14px;
  text-align: center;
}
</style>
