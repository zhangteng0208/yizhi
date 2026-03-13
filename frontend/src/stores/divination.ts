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
      const res: any = await http.post('/divination/bazi', body)
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
