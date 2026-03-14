<template>
  <div class="page">
    <van-nav-bar
      title="记录"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 分类筛选 -->
    <div class="tabs">
      <span
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >{{ tab.label }}</span>
    </div>

    <div v-if="loading" class="empty">
      <span class="loading-spinner"><BrandLogo /></span>
      <span>加载中...</span>
    </div>

    <div v-else-if="!filteredRecords.length" class="empty">
      <p>暂无记录</p>
    </div>

    <div v-else class="list">
      <div
        v-for="item in filteredRecords"
        :key="item.id"
        class="item"
        @click="$router.push(`/result/${item.id}`)"
      >
        <div class="item-left">
          <span class="item-category" :class="item.category">{{ categoryLabel(item.category) }}</span>
        </div>
        <div class="item-main">
          <span class="item-title">{{ serviceLabel(item.service_code) }}</span>
          <span class="item-name" v-if="item.input_name">{{ item.input_name }}</span>
          <span class="item-time">{{ formatTime(item.created_at) }}</span>
        </div>
        <span class="status" :class="item.status === 1 ? 'done' : 'pending'">
          {{ item.status === 1 ? '已完成' : '进行中' }}
        </span>
      </div>
    </div>

    <div v-if="hasMore && !loading" class="load-more" @click="loadMore">加载更多</div>

    <!-- Tabbar -->
    <TabBar v-model="tabbarActive" />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import TabBar from '@/components/TabBar.vue'
import { ref, computed, onMounted } from 'vue'
import http from '../utils/http'

const loading = ref(false)
const records = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 20
const activeTab = ref('all')
const tabbarActive = ref('history')
const hasMore = computed(() => records.value.length < total.value)

const tabs = [
  { label: '全部', value: 'all' },
  { label: '算', value: 'suan' },
  { label: '问', value: 'wen' },
  { label: '看', value: 'kan' },
  { label: '寻', value: 'xun' },
]

// service_code → 类别
const serviceCategoryMap: Record<string, string> = {
  bazi: 'suan', bazi_basic: 'suan', ziwei: 'suan', qimen: 'suan',
  meihua: 'wen', liuyao: 'wen', yijing: 'wen', xiaoliuren: 'wen', huangji: 'wen', chouqian: 'wen',
  face: 'kan', palm: 'kan', fengshui: 'kan',
  zeji: 'xun', naming: 'xun', hehun: 'xun',
}

// service_code → 中文名
const serviceNameMap: Record<string, string> = {
  bazi: '八字精批', bazi_basic: '八字精批',
  ziwei: '紫微斗数', qimen: '奇门遁甲',
  meihua: '梅花易数', liuyao: '六爻占卜', yijing: '易经占卜',
  xiaoliuren: '小六壬', huangji: '皇极天数', chouqian: '抽签占验',
  face: '面相分析', palm: '手相解读', fengshui: '风水布局',
  zeji: '择日择吉', naming: '起名改名', hehun: '合婚配对',
}

const categoryLabelMap: Record<string, string> = {
  suan: '算', wen: '问', kan: '看', xun: '寻',
}

function serviceLabel(code: string) {
  return serviceNameMap[code] || code
}

function categoryLabel(cat: string) {
  return categoryLabelMap[cat] || cat
}

function resolveCategory(record: any): string {
  if (record.category && categoryLabelMap[record.category]) return record.category
  return serviceCategoryMap[record.service_code] || record.category || 'wen'
}

const filteredRecords = computed(() => {
  const mapped = records.value.map(r => ({ ...r, category: resolveCategory(r) }))
  if (activeTab.value === 'all') return mapped
  return mapped.filter(r => r.category === activeTab.value)
})

function formatTime(dt: string) {
  if (!dt) return ''
  const d = new Date(dt)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

async function fetchRecords() {
  loading.value = true
  try {
    const res: any = await http.get('/divination/history', { params: { page: page.value, pageSize } })
    const data = res.data ?? res
    records.value = data.records || []
    total.value = data.total || 0
    // 提取 input_name
    records.value.forEach((r: any) => {
      if (!r.input_name && r.input_params) {
        const p = typeof r.input_params === 'string' ? JSON.parse(r.input_params) : r.input_params
        r.input_name = p.name || p.userName || ''
      }
    })
  } catch {
    records.value = []
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  page.value++
  try {
    const res: any = await http.get('/divination/history', { params: { page: page.value, pageSize } })
    const data = res.data ?? res
    const newRecords = data.records || []
    newRecords.forEach((r: any) => {
      if (!r.input_name && r.input_params) {
        const p = typeof r.input_params === 'string' ? JSON.parse(r.input_params) : r.input_params
        r.input_name = p.name || p.userName || ''
      }
    })
    records.value.push(...newRecords)
    total.value = data.total || 0
  } catch {}
}

onMounted(fetchRecords)
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 32px; }

.tabs {
  display: flex; gap: 0; margin: 0 20px 16px; background: var(--bg-secondary);
  border-radius: var(--radius); overflow: hidden;
}
.tab {
  flex: 1; text-align: center; padding: 10px 0; font-size: 13px;
  color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
  letter-spacing: 2px;
}
.tab.active {
  background: rgba(219, 39, 119, 0.1);
  font-weight: 500;
  color: #DB2777;
}

.empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; height: 40vh; color: var(--text-tertiary); font-size: 14px;
}
.loading-spinner {
  font-size: 24px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: spin 2s linear infinite; display: inline-flex; align-items: center; justify-content: center;
}
@keyframes spin { to { transform: rotate(360deg); } }

.list {
  margin: 0 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  overflow: hidden;
}

.item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.item:last-child { border-bottom: none; }
.item:active { background: var(--bg-card); }

.item-left { flex-shrink: 0; }
.item-category {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  font-size: 13px; font-weight: 500; letter-spacing: 1px;
}
.item-category.suan { background: rgba(219, 39, 119, 0.12); background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.item-category.wen { background: rgba(100, 149, 237, 0.12); color: #6495ed; }
.item-category.kan { background: rgba(144, 238, 144, 0.12); color: #90ee90; }
.item-category.xun { background: rgba(219, 112, 147, 0.12); color: #db7093; }

.item-main { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.item-title { font-size: 14px; color: var(--text-primary); }
.item-name { font-size: 12px; color: var(--text-secondary); }
.item-time { font-size: 11px; color: var(--text-tertiary); }

.status {
  font-size: 11px; padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
}
.status.done { color: #FFFFFF; background: rgba(219, 39, 119, 0.1); }
.status.pending { color: var(--text-secondary); background: rgba(255,255,255,0.04); }

.load-more {
  text-align: center; padding: 16px; font-size: 13px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer;
}
.load-more:active { opacity: 0.7; }
</style>
