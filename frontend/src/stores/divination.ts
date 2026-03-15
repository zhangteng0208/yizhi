import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '../utils/http'
import { fetchAiStream } from '../utils/sse'

export interface DivinationResult {
  id: string
  bazi: any
  ai: any
  status: number
  created_at: string
}

export interface SubmitParams {
  name: string
  gender: string
  birthday: string
  hour: string
  calendar: string
  question?: string
  type?: string  // 占卜类型
}

export const useDivinationStore = defineStore('divination', () => {
  const current = ref<DivinationResult | null>(null)
  const inputParams = ref<SubmitParams | null>(null)
  const loading = ref(false)
  const aiLoading = ref(false)
  const aiRawText = ref('')

  async function submitDivination(params: SubmitParams): Promise<DivinationResult> {
    loading.value = true
    try {
      inputParams.value = params
      const [y, m, d] = params.birthday.split('-').map(Number)
      const body = {
        name: params.name,
        gender: params.gender === '男' ? 1 : 2,
        birthYear: y,
        birthMonth: m,
        birthDay: d,
        birthHour: params.hour,
        isLunar: params.calendar === '农历',
        question: params.question || undefined,
      }
      // 使用传入的 type 或默认为 bazi
      const type = params.type || 'bazi'
      const res: any = await http.post(`/divination/${type}`, body)
      const data = res.data ?? res
      current.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function getResult(id: string): Promise<DivinationResult> {
    loading.value = true
    try {
      const res: any = await http.get(`/divination/${id}`)
      const data = res.data ?? res
      current.value = data

      // 调试：查看返回的数据结构
      console.log('getResult data:', data)
      console.log('input_params:', data.input_params)

      // 恢复用户输入参数
      if (data.input_params) {
        const ip = data.input_params
        inputParams.value = {
          name: ip.name || '',
          gender: ip.gender === 1 ? '男' : ip.gender === 2 ? '女' : ip.gender || '',
          birthday: `${ip.birthYear}-${String(ip.birthMonth).padStart(2, '0')}-${String(ip.birthDay).padStart(2, '0')}`,
          hour: String(ip.birthHour || ''),
          calendar: ip.isLunar ? '农历' : '公历',
          question: ip.question,
        }
        console.log('恢复的 inputParams:', inputParams.value)
      }

      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchAi(type: string, data: any, extraParams?: any, recordId?: string) {
    aiLoading.value = true
    aiRawText.value = ''
    await fetchAiStream(type, data, extraParams, recordId, {
      onToken(token) {
        aiRawText.value += token
      },
      onParsed(parsed) {
        if (current.value) {
          current.value = { ...current.value, ai: parsed, status: 1 }
        }
      },
      onError(fallback) {
        if (current.value) {
          current.value = { ...current.value, ai: fallback, status: 1 }
        }
      },
      onDone() {
        aiLoading.value = false
      },
    })
  }

  return { current, inputParams, loading, aiLoading, aiRawText, submitDivination, getResult, fetchAi }
})
