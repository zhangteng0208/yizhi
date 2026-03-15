// 阅读设置管理
import { ref, watch } from 'vue'

export interface ReaderSettings {
  fontSize: number        // 字体大小 14-22
  lineHeight: number      // 行距 1.5-2.2
  fontFamily: string      // 字体
  theme: string          // 主题
  pageWidth: string      // 页面宽度
  textAlign: string      // 对齐方式
}

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineHeight: 2.0,
  fontFamily: 'songti',
  theme: 'default',
  pageWidth: 'medium',
  textAlign: 'justify'
}

const STORAGE_KEY = 'reader_settings'

// 字体选项
export const FONT_OPTIONS = [
  { label: '宋体', value: 'songti', family: "'Songti SC', 'STSong', 'SimSun', serif" },
  { label: '黑体', value: 'heiti', family: "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" },
  { label: '楷体', value: 'kaiti', family: "'Kaiti SC', 'STKaiti', 'KaiTi', serif" }
]

// 主题选项
export const THEME_OPTIONS = [
  {
    label: '默认',
    value: 'default',
    bg: '#0a0a0a',
    text: '#e8e8e8',
    secondary: '#a0a0a0'
  },
  {
    label: '护眼',
    value: 'eye-care',
    bg: '#c7edcc',
    text: '#2c3e2c',
    secondary: '#5a6e5a'
  },
  {
    label: '羊皮纸',
    value: 'parchment',
    bg: '#f4e8d0',
    text: '#3d2f1f',
    secondary: '#7d6f5f'
  },
  {
    label: '夜间',
    value: 'night',
    bg: '#000000',
    text: '#666666',
    secondary: '#444444'
  }
]

// 页面宽度选项
export const WIDTH_OPTIONS = [
  { label: '窄', value: 'narrow', width: '600px' },
  { label: '中', value: 'medium', width: '800px' },
  { label: '宽', value: 'wide', width: '1000px' }
]

/**
 * 阅读设置管理 Composable
 */
export function useReaderSettings() {
  const settings = ref<ReaderSettings>(loadSettings())

  /**
   * 加载设置
   */
  function loadSettings(): ReaderSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('加载阅读设置失败:', error)
    }
    return { ...DEFAULT_SETTINGS }
  }

  /**
   * 保存设置
   */
  function saveSettings(newSettings: Partial<ReaderSettings>) {
    try {
      settings.value = { ...settings.value, ...newSettings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      applySettings()
    } catch (error) {
      console.error('保存阅读设置失败:', error)
    }
  }

  /**
   * 应用设置到页面
   */
  function applySettings() {
    const root = document.documentElement

    // 字体大小
    root.style.setProperty('--reader-font-size', `${settings.value.fontSize}px`)

    // 行距
    root.style.setProperty('--reader-line-height', `${settings.value.lineHeight}`)

    // 字体
    const fontOption = FONT_OPTIONS.find(f => f.value === settings.value.fontFamily)
    if (fontOption) {
      root.style.setProperty('--reader-font-family', fontOption.family)
    }

    // 主题
    const themeOption = THEME_OPTIONS.find(t => t.value === settings.value.theme)
    if (themeOption) {
      root.style.setProperty('--reader-bg', themeOption.bg)
      root.style.setProperty('--reader-text', themeOption.text)
      root.style.setProperty('--reader-text-secondary', themeOption.secondary)
    }

    // 页面宽度
    const widthOption = WIDTH_OPTIONS.find(w => w.value === settings.value.pageWidth)
    if (widthOption) {
      root.style.setProperty('--reader-max-width', widthOption.width)
    }

    // 对齐方式
    root.style.setProperty('--reader-text-align', settings.value.textAlign)
  }

  /**
   * 重置设置
   */
  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    localStorage.removeItem(STORAGE_KEY)
    applySettings()
  }

  /**
   * 增加字体大小
   */
  function increaseFontSize() {
    if (settings.value.fontSize < 22) {
      saveSettings({ fontSize: settings.value.fontSize + 2 })
    }
  }

  /**
   * 减小字体大小
   */
  function decreaseFontSize() {
    if (settings.value.fontSize > 14) {
      saveSettings({ fontSize: settings.value.fontSize - 2 })
    }
  }

  // 初始化时应用设置
  applySettings()

  return {
    settings,
    saveSettings,
    resetSettings,
    increaseFontSize,
    decreaseFontSize,
    applySettings
  }
}
