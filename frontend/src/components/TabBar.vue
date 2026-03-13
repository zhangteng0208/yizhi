<template>
  <div class="tabbar-wrapper">
    <div class="tabbar">
      <div
        v-for="item in items"
        :key="item.name"
        class="tabbar-item"
        :class="{ active: modelValue === item.name }"
        @click="handleClick(item)"
      >
        <div class="tabbar-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient :id="`gradient-${item.name}`" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="{ stopColor: modelValue === item.name ? '#DB2777' : '#707070', stopOpacity: 1 }" />
                <stop offset="100%" :style="{ stopColor: modelValue === item.name ? '#CA8A04' : '#707070', stopOpacity: 1 }" />
              </linearGradient>
            </defs>
            <path :d="item.icon" :fill="`url(#gradient-${item.name})`" />
          </svg>
        </div>
        <span class="tabbar-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface TabBarItem {
  name: string
  label: string
  icon: string
  to: string
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const router = useRouter()

const items: TabBarItem[] = [
  {
    name: 'home',
    label: '首页',
    to: '/',
    // Home icon - 简洁的房屋图标
    icon: 'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z'
  },
  {
    name: 'classics',
    label: '经典',
    to: '/classics',
    // Book icon - 书籍图标
    icon: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'
  },
  {
    name: 'history',
    label: '记录',
    to: '/history',
    // History icon - 时钟图标
    icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z'
  },
  {
    name: 'profile',
    label: '我的',
    to: '/profile',
    // Profile icon - 用户图标
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'
  }
]

function handleClick(item: TabBarItem) {
  emit('update:modelValue', item.name)
  router.push(item.to)
}
</script>

<style scoped>
.tabbar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  background: linear-gradient(135deg, rgba(15, 15, 15, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tabbar-item:active {
  transform: scale(0.95);
}

.tabbar-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tabbar-item.active .tabbar-icon {
  transform: translateY(-2px);
  filter: drop-shadow(0 2px 8px rgba(219, 39, 119, 0.4));
}

.tabbar-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.tabbar-label {
  font-size: 11px;
  color: var(--text-tertiary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 400;
  letter-spacing: 0.02em;
}

.tabbar-item.active .tabbar-label {
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
}

/* 响应式优化 */
@media (min-width: 768px) {
  .tabbar {
    height: 64px;
  }

  .tabbar-icon {
    width: 28px;
    height: 28px;
  }

  .tabbar-label {
    font-size: 12px;
  }
}

/* 尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .tabbar-item,
  .tabbar-icon,
  .tabbar-label {
    transition: none;
    animation: none;
  }

  .tabbar-item:active {
    transform: none;
  }

  .tabbar-item.active .tabbar-icon {
    transform: none;
  }
}
</style>
