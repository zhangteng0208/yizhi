import { useUserStore } from '../stores/user'
import { showConfirmDialog, showToast } from 'vant'

interface ProfileData {
  name?: string
  gender?: number
  birth_year?: number
  birth_month?: number
  birth_day?: number
  birth_hour?: number
  is_lunar?: boolean
  birth_province?: string
  birth_city?: string
  birth_lat?: number
  birth_lng?: number
}

export async function checkAndPromptSaveProfile(data: ProfileData) {
  if (!data.name) return
  const store = useUserStore()
  if (!store.profiles.length) {
    try { await store.fetchProfiles() } catch { return }
  }
  const exists = store.profiles.some(p => p.name === data.name)
  if (exists) return
  try {
    await showConfirmDialog({
      title: '保存档案',
      message: `「${data.name}」不在命理档案中，是否保存？`,
      confirmButtonText: '保存',
      cancelButtonText: '不了',
      confirmButtonColor: '#c9a96e',
    })
    await store.createProfile({ ...data, label: store.profiles.some(p => p.label === '本人') ? '居士' : '本人' })
    showToast('已保存到命理档案')
  } catch {
    // 用户取消
  }
}
