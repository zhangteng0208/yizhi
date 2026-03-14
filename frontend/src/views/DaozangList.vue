<template>
  <div class="daozang-list">
    <div class="header">
      <button @click="$router.back()" class="back-btn">
        <span class="icon">←</span>
      </button>
      <h1>正统道藏·正一部</h1>
      <div class="stats">共收录 {{ books.length }} 部经典</div>
    </div>

    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索道藏经典..."
        class="search-input"
      />
    </div>

    <div class="books-grid">
      <div
        v-for="book in filteredBooks"
        :key="book.id"
        @click="openBook(book.id)"
        class="book-card"
      >
        <div class="book-title">{{ book.name }}</div>
        <div class="book-info">{{ book.paragraphs }} 段</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DATA_BASE_URL } from '@/config/data-source'

const router = useRouter()
const books = ref<any[]>([])
const searchQuery = ref('')

const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value
  const query = searchQuery.value.toLowerCase()
  return books.value.filter(book =>
    book.name.toLowerCase().includes(query)
  )
})

function openBook(bookId: string) {
  router.push(`/daozang/${bookId}`)
}

onMounted(async () => {
  try {
    const response = await fetch(`${DATA_BASE_URL}/daozang/_booklist.json`)
    books.value = await response.json()
  } catch (error) {
    console.error('加载道藏书籍列表失败:', error)
  }
})
</script>

<style scoped>
.daozang-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 20px;
}

h1 {
  color: #ffd700;
  font-size: 28px;
  margin: 0 0 10px 0;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.stats {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 25px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffd700;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.book-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.book-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
}

.book-title {
  color: #ffd700;
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 500;
}

.book-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}
</style>
