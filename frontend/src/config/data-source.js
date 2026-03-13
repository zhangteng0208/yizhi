// 数据源配置
// 部署到 NAS 后，修改 DATA_BASE_URL 为你的 NAS 公网地址

export const config = {
  // 开发环境：使用本地数据
  development: {
    DATA_BASE_URL: '/data/classics/daizhigev20'
  },
  
  // 生产环境：使用 NAS 数据
  production: {
    // 替换为你的极空间公网地址
    DATA_BASE_URL: 'https://your-nas-id.zspace.cn:59000/classics/daizhigev20'
  }
}

// 根据环境自动选择
const env = import.meta.env.MODE || 'development'
export const DATA_BASE_URL = config[env].DATA_BASE_URL

// 使用示例：
// import { DATA_BASE_URL } from '@/config/data-source'
// const bookUrl = `${DATA_BASE_URL}/医藏/黄帝内经.txt`
