<template>
  <span class="picker-icon" @click="open" title="导入档案"><BrandLogo /></span>
  <Teleport to="body">
    <div class="picker-mask" v-if="visible" @click="visible = false">
      <div class="picker-sheet" @click.stop>
        <div class="sheet-header">
          <span class="sheet-title">选择档案</span>
          <span class="sheet-close" @click="visible = false">×</span>
        </div>
        <div class="sheet-list" v-if="profiles.length > 0">
          <div
            v-for="p in profiles"
            :key="p.id"
            class="sheet-item"
            @click="select(p)"
          >
            <div class="item-avatar" :class="{ female: p.gender === 2 }">{{ p.gender === 2 ? '♀' : '♂' }}</div>
            <div class="item-info">
              <span class="item-name">{{ p.name || '未设置' }}</span>
              <span class="item-label">{{ p.label || '未命名' }}</span>
            </div>
            <span v-if="p.is_default" class="item-badge">默认</span>
          </div>
        </div>
        <div v-else class="sheet-empty">暂无档案，请先在「我的」中添加</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{ select: [profile: any] }>()

const userStore = useUserStore()
const { profiles } = storeToRefs(userStore)
const visible = ref(false)

function open() {
  visible.value = true
}

function select(p: any) {
  emit('select', p)
  visible.value = false
}

onMounted(() => {
  if (profiles.value.length === 0) {
    userStore.fetchProfiles().catch(() => {})
  }
})
</script>

<style scoped>
.picker-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  background: rgba(219, 39, 119, 0.1);
  border: 1px solid rgba(219, 39, 119, 0.3);
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.picker-icon:active {
  background: rgba(219, 39, 119, 0.25);
}
.picker-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.picker-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 60vh;
  background: var(--bg-secondary);
  border-radius: 16px 16px 0 0;
  padding: 0 0 env(safe-area-inset-bottom);
  overflow: hidden;
  animation: slide-up 0.2s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.sheet-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}
.sheet-close {
  font-size: 22px;
  color: var(--text-tertiary);
  cursor: pointer;
  line-height: 1;
}
.sheet-list {
  overflow-y: auto;
  max-height: calc(60vh - 56px);
  padding: 8px 0;
}
.sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.1s;
}
.sheet-item:active {
  background: var(--bg-card);
}
.item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background: rgba(100, 149, 237, 0.12);
  color: #6495ed;
  border: 1px solid rgba(100, 149, 237, 0.25);
  flex-shrink: 0;
}
.item-avatar.female {
  background: rgba(219, 112, 147, 0.12);
  color: #db7093;
  border-color: rgba(219, 112, 147, 0.25);
}
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.item-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}
.item-label {
  font-size: 12px;
  color: var(--text-tertiary);
}
.item-badge {
  font-size: 10px;
  color: #fff;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: 1px solid rgba(219, 39, 119, 0.4);
  border-radius: 4px;
  padding: 1px 6px;
}
.sheet-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary);
}
</style>
