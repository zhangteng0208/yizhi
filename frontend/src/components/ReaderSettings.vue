<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '60%' }"
    round
    closeable
  >
    <div class="reader-settings">
      <h3 class="settings-title">阅读设置</h3>

      <!-- 字体大小 -->
      <div class="setting-section">
        <div class="setting-label">字体大小</div>
        <div class="setting-control">
          <button class="control-btn" @click="decreaseFontSize" :disabled="settings.fontSize <= 14">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
            </svg>
          </button>
          <span class="font-size-value">{{ settings.fontSize }}px</span>
          <button class="control-btn" @click="increaseFontSize" :disabled="settings.fontSize >= 22">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 行距 -->
      <div class="setting-section">
        <div class="setting-label">行距</div>
        <div class="setting-options">
          <button
            v-for="height in [1.5, 1.8, 2.0, 2.2]"
            :key="height"
            class="option-btn"
            :class="{ active: settings.lineHeight === height }"
            @click="saveSettings({ lineHeight: height })"
          >
            {{ height }}
          </button>
        </div>
      </div>

      <!-- 字体 -->
      <div class="setting-section">
        <div class="setting-label">字体</div>
        <div class="setting-options">
          <button
            v-for="font in fontOptions"
            :key="font.value"
            class="option-btn"
            :class="{ active: settings.fontFamily === font.value }"
            @click="saveSettings({ fontFamily: font.value })"
          >
            {{ font.label }}
          </button>
        </div>
      </div>

      <!-- 主题 -->
      <div class="setting-section">
        <div class="setting-label">主题</div>
        <div class="theme-options">
          <button
            v-for="theme in themeOptions"
            :key="theme.value"
            class="theme-btn"
            :class="{ active: settings.theme === theme.value }"
            :style="{ background: theme.bg, color: theme.text }"
            @click="saveSettings({ theme: theme.value })"
          >
            {{ theme.label }}
          </button>
        </div>
      </div>

      <!-- 页面宽度 -->
      <div class="setting-section">
        <div class="setting-label">页面宽度</div>
        <div class="setting-options">
          <button
            v-for="width in widthOptions"
            :key="width.value"
            class="option-btn"
            :class="{ active: settings.pageWidth === width.value }"
            @click="saveSettings({ pageWidth: width.value })"
          >
            {{ width.label }}
          </button>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="setting-actions">
        <button class="reset-btn" @click="handleReset">
          恢复默认设置
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useReaderSettings, FONT_OPTIONS, THEME_OPTIONS, WIDTH_OPTIONS } from '@/composables/useReaderSettings'
import { showConfirmDialog } from 'vant'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const visible = ref(props.show)
const { settings, saveSettings, resetSettings, increaseFontSize, decreaseFontSize } = useReaderSettings()

const fontOptions = FONT_OPTIONS
const themeOptions = THEME_OPTIONS
const widthOptions = WIDTH_OPTIONS

watch(() => props.show, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:show', val)
})

async function handleReset() {
  try {
    await showConfirmDialog({
      title: '确认重置',
      message: '确定要恢复默认设置吗？'
    })
    resetSettings()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.reader-settings {
  padding: 24px 20px;
  background: var(--bg-primary);
  height: 100%;
  overflow-y: auto;
}

.settings-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-align: center;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.setting-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn:not(:disabled):active {
  transform: scale(0.95);
  background: var(--bg-secondary);
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.font-size-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
  text-align: center;
}

.setting-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.option-btn {
  flex: 1;
  min-width: 60px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: #000;
}

.option-btn:active {
  transform: scale(0.98);
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-btn {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn.active {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px var(--gold-glow);
}

.theme-btn:active {
  transform: scale(0.98);
}

.setting-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.reset-btn {
  width: 100%;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:active {
  transform: scale(0.98);
  background: var(--bg-secondary);
}
</style>
