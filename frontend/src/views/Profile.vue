<template>
  <div class="page">
    <van-nav-bar
      title="我的"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- 用户信息条 -->
    <div class="user-bar">
      <span class="user-phone">{{ maskedPhone }}</span>
      <span class="logout-link" @click="handleLogout">退出登录</span>
    </div>

    <!-- 命理档案列表 -->
    <div class="section-header">
      <span class="section-title">命理档案</span>
      <span class="section-action" @click="$router.push('/profile/edit/new')">+ 添加</span>
    </div>

    <div v-if="loading" class="loading-hint">
      <span class="loading-spinner"><BrandLogo /></span>
      <span>加载中...</span>
    </div>

    <div v-for="p in profiles" :key="p.id" class="profile-card" @click="$router.push(`/profile/edit/${p.id}`)">
      <!-- 卡片顶部装饰线 -->
      <div class="card-accent"></div>
      <!-- 头部：头像 + 姓名 + 标签 -->
      <div class="card-header">
        <div class="card-avatar" :class="{ male: p.gender === 1, female: p.gender === 2 }">
          {{ p.gender === 2 ? '♀' : '♂' }}
        </div>
        <div class="card-identity">
          <div class="card-name-row">
            <span class="card-name">{{ p.name || '未设置' }}</span>
            <span v-if="p.is_default" class="card-badge">默认</span>
          </div>
          <span class="card-label">{{ p.label || '未命名' }}</span>
        </div>
        <span class="card-edit">编辑 ›</span>
      </div>
      <!-- 分隔线 -->
      <div class="card-divider"></div>
      <!-- 信息区域：紧凑布局 -->
      <div class="card-info-compact">
        <div class="info-row">
          <div class="info-item">
            <span class="info-icon">☀</span>
            <span class="info-text">{{ formatSolar(p) }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">☽</span>
            <span class="info-text">{{ formatLunar(p) }}</span>
          </div>
        </div>
        <div class="info-row" v-if="p.birth_city || p.birth_province">
          <div class="info-item">
            <span class="info-icon">⊙</span>
            <span class="info-text">{{ p.birth_city || p.birth_province }}
              <span v-if="p.birth_lat != null" class="coords">({{ p.birth_lng?.toFixed(2) }}°, {{ p.birth_lat?.toFixed(2) }}°)</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && profiles.length === 0" class="empty-card" @click="$router.push('/profile/edit/new')">
      <div class="empty-icon"><BrandLogo /></div>
      <span class="empty-text">暂无命理档案</span>
      <span class="empty-action">点击添加第一个档案</span>
    </div>

    <!-- Menu -->
    <div class="menu">
      <div class="menu-item" @click="$router.push('/history')">
        <span>历史记录</span><span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>我的订单</span><span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>联系客服</span><span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>关于</span><span class="arrow">›</span>
      </div>
    </div>

    <!-- Tabbar -->
    <TabBar v-model="tabbarActive" />
  </div>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import TabBar from '@/components/TabBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Solar, Lunar } from 'lunar-javascript'
import http from '../utils/http'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const userInfo = ref<Record<string, any>>({})
const tabbarActive = ref('profile')

const profiles = computed(() => userStore.profiles)

const maskedPhone = computed(() => {
  const p = userInfo.value.phone || ''
  if (p.length >= 11) return p.slice(0, 3) + '****' + p.slice(7)
  return p || '未绑定'
})

const hours = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function formatSolar(p: any) {
  if (!p.birth_year) return '未设置'
  let s = `${p.birth_year}年${p.birth_month || '?'}月${p.birth_day || '?'}日`
  if (p.birth_hour != null && p.birth_hour >= 0) s += ` ${hours[p.birth_hour] || ''}时`
  return s
}

function formatLunar(p: any) {
  if (!p.birth_year) return '未设置'
  try {
    if (p.is_lunar) {
      const isLeap = p.is_leap_month
      const lunar = Lunar.fromYmd(p.birth_year, isLeap ? -p.birth_month : p.birth_month, p.birth_day)
      return `${lunar.getYearInChinese()}年${isLeap ? '闰' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    }
    const solar = Solar.fromYmd(p.birth_year, p.birth_month || 1, p.birth_day || 1)
    const lunar = solar.getLunar()
    return `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
  } catch {
    return '未设置'
  }
}

function handleLogout() {
  userStore.logout()
  router.replace('/login')
}

onMounted(async () => {
  loading.value = true
  try {
    const [meRes] = await Promise.all([
      http.get('/users/me'),
      userStore.fetchProfiles(),
    ])
    userInfo.value = (meRes as any).data ?? meRes
  } catch (err: any) {
    if (err.response?.status === 401) {
      router.push('/login')
    }
  }
  loading.value = false
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 48px; }

.user-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; margin: 0 20px 16px; background: var(--bg-secondary); border-radius: var(--radius); }
.user-phone { font-size: 12px; color: var(--text-tertiary); }
.logout-link { font-size: 12px; color: var(--text-tertiary); cursor: pointer; text-decoration: underline; }
.logout-link:active { color: var(--text-secondary); }

.section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 14px; }
.section-title { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.section-action { font-size: 13px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; }

/* 档案卡片 */
.profile-card {
  position: relative;
  margin: 0 20px 16px;
  padding: 0 20px 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.profile-card:active {
  transform: scale(0.985);
}

/* 顶部金色装饰线 */
.card-accent {
  height: 3px;
  background: linear-gradient(90deg, #DB2777, rgba(219, 39, 119, 0.2));
  margin: 0 -20px 16px;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: rgba(100, 149, 237, 0.12);
  color: #6495ed;
  border: 1.5px solid rgba(100, 149, 237, 0.25);
}
.card-avatar.male {
  background: rgba(100, 149, 237, 0.12);
  color: #6495ed;
  border-color: rgba(100, 149, 237, 0.25);
}
.card-avatar.female {
  background: rgba(219, 112, 147, 0.12);
  color: #db7093;
  border-color: rgba(219, 112, 147, 0.25);
}
.card-identity {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.card-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.card-badge {
  font-size: 9px;
  color: #fff;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: 1px solid rgba(219, 39, 119, 0.4);
  border-radius: 4px;
  padding: 1px 6px;
  letter-spacing: 1px;
}
.card-label {
  font-size: 12px;
  color: var(--text-tertiary);
}
.card-edit {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* 分隔线 */
.card-divider {
  height: 1px;
  background: var(--border);
  margin: 14px 0;
}

/* 信息区域 - 紧凑布局 */
.card-info-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-row {
  display: flex;
  gap: 12px;
}
.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.info-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: rgba(219, 39, 119, 0.1);
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  flex-shrink: 0;
}
.info-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coords {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: 4px;
}

/* 空状态 */
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 20px 16px;
  padding: 36px 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  border: 1px dashed rgba(219, 39, 119, 0.2);
}
.empty-card:active { background: var(--bg-card); }
.empty-icon {
  font-size: 32px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  opacity: 0.4;
  animation: spin 12s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-text { font-size: 14px; color: var(--text-secondary); }
.empty-action { font-size: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; opacity: 0.7; }

/* 加载 */
.loading-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 36px 0;
  font-size: 13px;
  color: var(--text-secondary);
}
.loading-spinner {
  font-size: 18px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: spin 2s linear infinite;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 菜单 */
.menu { margin: 16px 20px 24px; background: var(--bg-secondary); border-radius: var(--radius); overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; font-size: 14px; color: var(--text-primary); border-bottom: 1px solid var(--border); transition: background 0.15s; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--bg-card); }
.arrow { color: var(--text-tertiary); font-size: 18px; }
</style>
