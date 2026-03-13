<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay">
      <div class="spinner"><BrandLogo /></div>
      <p class="text">{{ text }}</p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
defineProps<{
  visible: boolean
  text?: string
}>()
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
}

.spinner {
  font-size: 48px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: spin 2s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.text {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}
</style>
