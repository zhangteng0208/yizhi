import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '../utils/http'
import { showToast } from 'vant'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const phone = ref(localStorage.getItem('phone') || '')
  const tokenExpireTime = ref(localStorage.getItem('tokenExpireTime') || '')
  const profile = ref<Record<string, any>>({})
  const profiles = ref<any[]>([])

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)

    // 设置过期时间（7天后）
    const expireTime = Date.now() + 7 * 24 * 60 * 60 * 1000
    tokenExpireTime.value = expireTime.toString()
    localStorage.setItem('tokenExpireTime', expireTime.toString())
  }

  function isTokenValid() {
    if (!token.value || !tokenExpireTime.value) return false
    return Date.now() < parseInt(tokenExpireTime.value)
  }

  async function login(phoneNum: string, code: string) {
    try {
      const res: any = await http.post('/auth/login/phone', { phone: phoneNum, code })
      const data = res.data ?? res
      setToken(data.access_token)
      phone.value = phoneNum
      localStorage.setItem('phone', phoneNum)
      return data
    } catch (e: any) {
      showToast(e.response?.data?.message || '登录失败')
      throw e
    }
  }

  function logout() {
    token.value = ''
    phone.value = ''
    tokenExpireTime.value = ''
    profile.value = {}
    profiles.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('phone')
    localStorage.removeItem('tokenExpireTime')
  }

  async function fetchProfiles() {
    const res: any = await http.get('/users/me/profiles')
    profiles.value = res.data ?? res
    return profiles.value
  }

  async function createProfile(data: Record<string, any>) {
    const res: any = await http.post('/users/me/profiles', data)
    await fetchProfiles()
    return res.data ?? res
  }

  async function updateProfile(id: string, data: Record<string, any>) {
    const res: any = await http.put(`/users/me/profiles/${id}`, data)
    await fetchProfiles()
    return res.data ?? res
  }

  async function deleteProfile(id: string) {
    await http.delete(`/users/me/profiles/${id}`)
    await fetchProfiles()
  }

  return { token, phone, tokenExpireTime, profile, profiles, setToken, isTokenValid, login, logout, fetchProfiles, createProfile, updateProfile, deleteProfile }
})
