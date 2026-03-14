// 数据源配置
// 统一使用 NAS 远程数据源

export const config = {
  // 开发环境：使用 NAS 远程数据
  development: {
    DATA_BASE_URL: 'http://115.190.192.7:55880'
  },
  
  // 生产环境：使用 NAS 远程数据
  production: {
    DATA_BASE_URL: 'http://115.190.192.7:55880'
  }
}

// 根据环境自动选择
const env = import.meta.env.MODE || 'development'
export const DATA_BASE_URL = config[env].DATA_BASE_URL

// 使用示例：
// import { DATA_BASE_URL } from '@/config/data-source'
// const bookUrl = `${DATA_BASE_URL}/医藏/黄帝内经.json`
