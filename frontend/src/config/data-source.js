// 数据源配置
// 开发环境使用 NAS 直连，生产环境使用服务器代理

export const config = {
  // 开发环境：使用本地 Vite 代理
  development: {
    DATA_BASE_URL: '/nas-data'
  },

  // 生产环境：使用服务器代理（外网可访问）
  production: {
    DATA_BASE_URL: '/nas-data'
  }
}

// 根据环境自动选择
const env = import.meta.env.MODE || 'development'
export const DATA_BASE_URL = config[env].DATA_BASE_URL

// 使用示例：
// import { DATA_BASE_URL } from '@/config/data-source'
// const bookUrl = `${DATA_BASE_URL}/医藏/黄帝内经.json`
