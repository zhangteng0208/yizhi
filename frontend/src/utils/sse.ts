const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface AiStreamCallbacks {
  onToken?: (token: string) => void
  onParsed?: (parsed: any) => void
  onError?: (fallback: any) => void
  onDone?: () => void
}

export async function fetchAiStream(
  type: string,
  data: any,
  extraParams?: any,
  recordId?: string,
  callbacks?: AiStreamCallbacks,
): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'
    return
  }

  const res = await fetch(`${API_BASE}/divination/ai-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, data, extraParams, recordId }),
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  if (!res.ok || !res.body) {
    callbacks?.onError?.({})
    callbacks?.onDone?.()
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') {
        callbacks?.onDone?.()
        return
      }
      try {
        const msg = JSON.parse(payload)
        if (msg.token) callbacks?.onToken?.(msg.token)
        if (msg.done && msg.parsed) callbacks?.onParsed?.(msg.parsed)
        if (msg.error && msg.fallback) callbacks?.onError?.(msg.fallback)
      } catch { /* ignore malformed lines */ }
    }
  }
  callbacks?.onDone?.()
}
