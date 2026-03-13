import axios from 'axios'
import { useUserStore } from '../stores/user'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      // 401错误：token无效或过期
      const userStore = useUserStore()
      userStore.logout()

      // 避免在登录页面重复跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export default http
