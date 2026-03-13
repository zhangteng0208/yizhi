<template>
  <div class="page">
    <van-nav-bar
      :title="isNew ? '新建档案' : '编辑档案'"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="form">
      <div class="field">
        <label>档案标签</label>
        <input v-model="form.label" placeholder="如：本人、父亲、母亲" class="input" />
      </div>
      <div class="field">
        <label>姓名</label>
        <input v-model="form.name" placeholder="请输入姓名" class="input" />
      </div>
      <div class="field">
        <label>性别</label>
        <div class="toggle-row">
          <button v-for="g in genderOptions" :key="g.value" class="toggle-btn" :class="{ active: form.gender === g.value }" @click="form.gender = g.value">{{ g.label }}</button>
        </div>
      </div>
      <div class="field">
        <label>历法</label>
        <div class="toggle-row">
          <button v-for="c in ['公历', '农历']" :key="c" class="toggle-btn" :class="{ active: calendarMode === c }" @click="calendarMode = c">{{ c }}</button>
        </div>
      </div>

      <!-- 公历输入 -->
      <div class="field">
        <label>{{ calendarMode === '公历' ? '公历生日' : '公历生日（自动计算）' }}</label>
        <div class="date-row">
          <select v-model="solarYear" class="input date-input" :disabled="calendarMode === '农历'">
            <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="solarMonth" class="input date-input" :disabled="calendarMode === '农历'">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
          </select>
          <select v-model="solarDay" class="input date-input" :disabled="calendarMode === '农历'">
            <option v-for="d in solarDays" :key="d" :value="d">{{ d }}日</option>
          </select>
        </div>
      </div>

      <!-- 农历输入 -->
      <div class="field">
        <label>{{ calendarMode === '农历' ? '农历生日' : '农历生日（自动计算）' }}</label>
        <div class="date-row">
          <select v-model="lunarYear" class="input date-input" :disabled="calendarMode === '公历'">
            <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="lunarMonth" class="input date-input" :disabled="calendarMode === '公历'">
            <option v-for="m in lunarMonths" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select v-model="lunarDay" class="input date-input" :disabled="calendarMode === '公历'">
            <option v-for="d in lunarDays" :key="d" :value="d">{{ d }}日</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.birth_hour" class="input">
          <option :value="-1" disabled>请选择</option>
          <option v-for="h in hours" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <div class="field">
        <label>出生地</label>
        <input v-model="birthplace" placeholder="如：北京、上海、广州" class="input" @blur="geocode" />
        <span v-if="form.birth_lat != null" class="coords-hint">经度 {{ form.birth_lng?.toFixed(2) }}° 纬度 {{ form.birth_lat?.toFixed(2) }}°</span>
      </div>

      <button class="submit" :disabled="saving" @click="onSave">{{ saving ? '保存中...' : '保存' }}</button>
      <button v-if="!isNew" class="delete-btn" @click="onDelete">删除档案</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Solar, Lunar, LunarYear } from 'lunar-javascript'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isNew = computed(() => route.params.id === 'new')
const saving = ref(false)

const form = reactive({
  label: '',
  name: '',
  gender: 0,
  birth_year: 2000,
  birth_month: 1,
  birth_day: 1,
  birth_hour: -1,
  birth_minute: 0,
  is_lunar: false,
  is_leap_month: false,
  birth_province: '',
  birth_city: '',
  birth_lat: null as number | null,
  birth_lng: null as number | null,
})

const birthplace = ref('')
const calendarMode = ref('公历')

// 公历日期
const solarYear = ref(2000)
const solarMonth = ref(1)
const solarDay = ref(1)

// 农历日期
const lunarYear = ref(2000)
const lunarMonth = ref(1)
const lunarDay = ref(1)

const genderOptions = [
  { value: 1, label: '男' },
  { value: 2, label: '女' },
]

const years = Array.from({ length: 91 }, (_, i) => 1940 + i)

const hours = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 1, label: '丑时 (01:00-03:00)' },
  { value: 2, label: '寅时 (03:00-05:00)' },
  { value: 3, label: '卯时 (05:00-07:00)' },
  { value: 4, label: '辰时 (07:00-09:00)' },
  { value: 5, label: '巳时 (09:00-11:00)' },
  { value: 6, label: '午时 (11:00-13:00)' },
  { value: 7, label: '未时 (13:00-15:00)' },
  { value: 8, label: '申时 (15:00-17:00)' },
  { value: 9, label: '酉时 (17:00-19:00)' },
  { value: 10, label: '戌时 (19:00-21:00)' },
  { value: 11, label: '亥时 (21:00-23:00)' },
]

const solarDays = computed(() => {
  const d = new Date(solarYear.value, solarMonth.value, 0).getDate()
  return Array.from({ length: d }, (_, i) => i + 1)
})

const lunarMonths = computed(() => {
  try {
    const ly = LunarYear.fromYear(lunarYear.value)
    const months: { value: number; label: string }[] = []
    for (const m of ly.getMonths()) {
      const month = m.getMonth()
      if (month === 0) continue
      const isLeap = m.isLeap()
      months.push({ value: isLeap ? -month : month, label: isLeap ? `闰${month}月` : `${month}月` })
    }
    return months
  } catch {
    return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))
  }
})

const lunarDays = computed(() => {
  try {
    const isLeap = lunarMonth.value < 0
    const absMonth = Math.abs(lunarMonth.value)
    const ly = LunarYear.fromYear(lunarYear.value)
    for (const m of ly.getMonths()) {
      if (m.getMonth() === absMonth && m.isLeap() === isLeap) {
        return Array.from({ length: m.getDayCount() }, (_, i) => i + 1)
      }
    }
  } catch {}
  return Array.from({ length: 30 }, (_, i) => i + 1)
})

// 公历 → 农历
watch([solarYear, solarMonth, solarDay], () => {
  if (calendarMode.value !== '公历') return
  try {
    const solar = Solar.fromYmd(solarYear.value, solarMonth.value, solarDay.value)
    const lunar = solar.getLunar()
    lunarYear.value = lunar.getYear()
    lunarMonth.value = lunar.isLeap() ? -lunar.getMonth() : lunar.getMonth()
    lunarDay.value = lunar.getDay()
  } catch {}
}, { immediate: true })

// 农历 → 公历
watch([lunarYear, lunarMonth, lunarDay], () => {
  if (calendarMode.value !== '农历') return
  try {
    const isLeap = lunarMonth.value < 0
    const absMonth = Math.abs(lunarMonth.value)
    const lunar = Lunar.fromYmd(lunarYear.value, isLeap ? -absMonth : absMonth, lunarDay.value)
    const solar = lunar.getSolar()
    solarYear.value = solar.getYear()
    solarMonth.value = solar.getMonth()
    solarDay.value = solar.getDay()
  } catch {}
})

// 切换历法时同步
watch(calendarMode, (mode) => {
  if (mode === '公历') {
    try {
      const isLeap = lunarMonth.value < 0
      const absMonth = Math.abs(lunarMonth.value)
      const lunar = Lunar.fromYmd(lunarYear.value, isLeap ? -absMonth : absMonth, lunarDay.value)
      const solar = lunar.getSolar()
      solarYear.value = solar.getYear()
      solarMonth.value = solar.getMonth()
      solarDay.value = solar.getDay()
    } catch {}
  } else {
    try {
      const solar = Solar.fromYmd(solarYear.value, solarMonth.value, solarDay.value)
      const lunar = solar.getLunar()
      lunarYear.value = lunar.getYear()
      lunarMonth.value = lunar.isLeap() ? -lunar.getMonth() : lunar.getMonth()
      lunarDay.value = lunar.getDay()
    } catch {}
  }
})

async function geocode() {
  if (!birthplace.value.trim()) { form.birth_lat = null; form.birth_lng = null; return }
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(birthplace.value)}&format=json&limit=1&accept-language=zh`)
    const data = await resp.json()
    if (data.length > 0) {
      form.birth_lat = parseFloat(data[0].lat)
      form.birth_lng = parseFloat(data[0].lon)
    } else {
      form.birth_lat = null
      form.birth_lng = null
    }
  } catch {
    form.birth_lat = null
    form.birth_lng = null
  }
}

async function onSave() {
  if (!form.name?.trim()) { showToast('请输入姓名'); return }
  if (!form.gender) { showToast('请选择性别'); return }
  if (form.label === '本人') {
    const other = userStore.profiles.find((p: any) => p.label === '本人' && p.id !== route.params.id)
    if (other) { showToast('已有"本人"档案，请使用其他标签'); return }
  }
  if (form.birth_hour < 0) { showToast('请选择出生时辰'); return }

  // 同步日期到 form
  form.birth_year = solarYear.value
  form.birth_month = solarMonth.value
  form.birth_day = solarDay.value
  form.is_lunar = calendarMode.value === '农历'
  form.is_leap_month = lunarMonth.value < 0

  // 拆分出生地
  form.birth_city = birthplace.value

  saving.value = true
  try {
    const payload: Record<string, any> = { ...form }
    // 清理无效字段
    if (payload.birth_hour < 0) delete payload.birth_hour
    if (payload.birth_lat == null) delete payload.birth_lat
    if (payload.birth_lng == null) delete payload.birth_lng

    if (isNew.value) {
      await userStore.createProfile(payload)
    } else {
      await userStore.updateProfile(route.params.id as string, payload)
    }
    showToast('保存成功')
    router.back()
  } catch (e: any) {
    showToast(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  try {
    await showConfirmDialog({ title: '确认删除', message: '删除后无法恢复，确定要删除此档案吗？' })
    await userStore.deleteProfile(route.params.id as string)
    showToast('已删除')
    router.back()
  } catch {}
}

onMounted(async () => {
  if (!isNew.value) {
    await userStore.fetchProfiles()
    const p = userStore.profiles.find((p: any) => p.id === route.params.id)
    if (p) {
      form.label = p.label || '居士'
      form.name = p.name || ''
      form.gender = p.gender || 0
      form.birth_hour = p.birth_hour ?? -1
      form.birth_minute = p.birth_minute ?? 0
      form.is_lunar = p.is_lunar || false
      form.is_leap_month = p.is_leap_month || false
      form.birth_province = p.birth_province || ''
      form.birth_city = p.birth_city || ''
      form.birth_lat = p.birth_lat ?? null
      form.birth_lng = p.birth_lng ?? null
      birthplace.value = p.birth_city || p.birth_province || ''

      if (p.birth_year) {
        solarYear.value = p.birth_year
        solarMonth.value = p.birth_month || 1
        solarDay.value = p.birth_day || 1
        calendarMode.value = p.is_lunar ? '农历' : '公历'
        if (p.is_lunar) {
          lunarYear.value = p.birth_year
          lunarMonth.value = p.is_leap_month ? -(p.birth_month || 1) : (p.birth_month || 1)
          lunarDay.value = p.birth_day || 1
        }
      }
    }
  } else {
    // 新建档案：如果已有"本人"标签则默认"居士"，否则默认"本人"
    try { await userStore.fetchProfiles() } catch {}
    const hasBenren = userStore.profiles.some((p: any) => p.label === '本人')
    form.label = hasBenren ? '居士' : '本人'
  }
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 48px; }
.form { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; color: var(--text-secondary); }
.input { height: 44px; padding: 0 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; -webkit-appearance: none; }
.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
.input:disabled { opacity: 0.5; }
select.input { color: var(--text-primary); }
select.input option { background: var(--bg-secondary); color: var(--text-primary); }
.toggle-row { display: flex; gap: 10px; }
.toggle-btn { flex: 1; height: 44px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.toggle-btn.active { border-color: #DB2777; color: #DB2777; background: rgba(219, 39, 119, 0.1); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.date-row { display: flex; gap: 8px; }
.date-input { flex: 1; padding: 0 8px; font-size: 13px; }
.coords-hint { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
.submit { height: 48px; margin-top: 12px; background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); border: none; border-radius: var(--radius); color: #fff; font-size: 15px; font-weight: 500; letter-spacing: 4px; cursor: pointer; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3); transition: all 0.2s; }
.submit:active { opacity: 0.85; }
.submit:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-btn { height: 44px; background: transparent; border: 1px solid #e74c3c44; border-radius: var(--radius); color: #e74c3c; font-size: 14px; cursor: pointer; }
.delete-btn:active { background: #e74c3c11; }
</style>
