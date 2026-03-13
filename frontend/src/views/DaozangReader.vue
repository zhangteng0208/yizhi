<template>
  <div class="chapter-reader">
    <van-nav-bar
      :title="bookTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="reader-content">
      <div class="chapter-header">
        <h1 class="chapter-title">{{ bookTitle }}</h1>
        <p class="chapter-number">正统道藏·正一部</p>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="content" class="chapter-text">
        <p v-for="(paragraph, index) in content.paragraphs" :key="index" class="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <div v-else class="error">加载失败</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const bookId = computed(() => route.params.bookId as string)
const bookTitle = ref('')
const content = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // 加载书籍列表获取标题
    const listResponse = await fetch('/data/classics/daozang/_booklist.json')
    const books = await listResponse.json()
    const book = books.find((b: any) => b.id === bookId.value)
    if (book) {
      bookTitle.value = book.name
    }

    // 加载内容
    const response = await fetch(`/data/classics/daozang/${bookId.value}.json`)
    const data = await response.json()
    content.value = data[0] // 取第一章（全文）
    loading.value = false
  } catch (error) {
    console.error('加载道藏内容失败:', error)
    loading.value = false
  }
})
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
  font-family: 'Noto Serif SC', serif;
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
  font-family: 'Noto Serif SC', serif;
}

.loading,
.error {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
  font-size: 16px;
}

.chapter-text {
  line-height: 2;
  font-family: 'Noto Serif SC', serif;
  margin-bottom: 48px;
}

.paragraph {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-indent: 2em;
  letter-spacing: 1px;
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
  * {
    transition: none;
  }
}
</style>
