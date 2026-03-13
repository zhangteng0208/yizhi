<template>
  <div class="page">
    <van-nav-bar
      title="测算"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="form">
      <div class="field">
        <label>姓名</label>
        <div class="input-with-icon">
          <input v-model="form.name" placeholder="请输入姓名" class="input" />
          <ProfilePicker @select="importProfile" />
        </div>
      </div>

      <div class="field">
        <label>性别</label>
        <div class="toggle-row">
          <button
            v-for="g in ['男', '女']"
            :key="g"
            class="toggle-btn"
            :class="{ active: form.gender === g }"
            @click="form.gender = g"
          >{{ g }}</button>
        </div>
      </div>

      <div class="field">
        <label>出生日期</label>
        <input v-model="form.birthday" type="date" class="input" />
      </div>

      <div class="field">
        <label>出生时辰</label>
        <select v-model="form.hour" class="input">
          <option value="" disabled>请选择</option>
          <option v-for="h in hours" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <div class="field">
        <label>历法</label>
        <div class="toggle-row">
          <button
            v-for="c in ['公历', '农历']"
            :key="c"
            class="toggle-btn"
            :class="{ active: form.calendar === c }"
            @click="form.calendar = c"
          >{{ c }}</button>
        </div>
      </div>
      <div class="field">
        <label>想了解的问题</label>
        <textarea v-model="form.question" placeholder="选填" rows="3" class="input textarea"></textarea>
      </div>

      <button class="submit" :disabled="!canSubmit" @click="onSubmit">开始测算</button>
    </div>

    <LoadingOverlay :visible="showLoading" text="正在排盘..." />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDivinationStore } from '../stores/divination'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import ProfilePicker from '../components/ProfilePicker.vue'
import { checkAndPromptSaveProfile } from '../utils/profileSaveCheck'

const route = useRoute()
const router = useRouter()
const store = useDivinationStore()
const showLoading = ref(false)

const form = reactive({
  name: '',
  gender: '',
  birthday: '',
  hour: '',
  calendar: '公历',
  question: '',
})

const canSubmit = computed(() => form.name && form.gender && form.birthday && form.hour)

const hours = [
  { value: '子', label: '子时 (23:00-01:00)' },
  { value: '丑', label: '丑时 (01:00-03:00)' },
  { value: '寅', label: '寅时 (03:00-05:00)' },
  { value: '卯', label: '卯时 (05:00-07:00)' },
  { value: '辰', label: '辰时 (07:00-09:00)' },
  { value: '巳', label: '巳时 (09:00-11:00)' },
  { value: '午', label: '午时 (11:00-13:00)' },
  { value: '未', label: '未时 (13:00-15:00)' },
  { value: '申', label: '申时 (15:00-17:00)' },
  { value: '酉', label: '酉时 (17:00-19:00)' },
  { value: '戌', label: '戌时 (19:00-21:00)' },
  { value: '亥', label: '亥时 (21:00-23:00)' },
]

const shichenChars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function importProfile(p: any) {
  form.name = p.name || ''
  form.gender = p.gender === 1 ? '男' : p.gender === 2 ? '女' : ''
  if (p.birth_year) {
    const m = String(p.birth_month || 1).padStart(2, '0')
    const d = String(p.birth_day || 1).padStart(2, '0')
    form.birthday = `${p.birth_year}-${m}-${d}`
  }
  if (p.birth_hour != null && p.birth_hour >= 0) form.hour = shichenChars[p.birth_hour] || ''
  form.calendar = p.is_lunar ? '农历' : '公历'
}

async function onSubmit() {
  if (!canSubmit.value) return
  // 检查是否需要保存档案
  const [y, m, d] = form.birthday.split('-').map(Number)
  const hourIdx = shichenChars.indexOf(form.hour)
  await checkAndPromptSaveProfile({
    name: form.name,
    gender: form.gender === '男' ? 1 : 2,
    birth_year: y, birth_month: m, birth_day: d,
    birth_hour: hourIdx >= 0 ? hourIdx : undefined,
    is_lunar: form.calendar === '农历',
  })
  showLoading.value = true
  try {
    const result = await store.submitDivination({
      name: form.name,
      gender: form.gender,
      birthday: form.birthday,
      hour: form.hour,
      calendar: form.calendar,
      question: form.question || undefined,
    })
    router.push(`/result/${result.id}`)
  } catch {
    showLoading.value = false
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg-primary); }

.form {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  color: var(--text-secondary);
}

.input {
  height: 44px;
  padding: 0 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  -webkit-appearance: none;
}

.input:focus { border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2); }
.input::placeholder { color: var(--text-tertiary); }
.input-with-icon { display: flex; gap: 8px; }
.input-with-icon .input { flex: 1; }

.textarea {
  height: auto;
  padding: 12px 14px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
}

select.input { color: var(--text-primary); }
select.input option { background: var(--bg-secondary); color: var(--text-primary); }

.toggle-row {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  flex: 1;
  height: 44px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  border-color: #DB2777;
  color: #DB2777;
  background: rgba(219, 39, 119, 0.1);
}

.submit {
  height: 48px;
  margin-top: 12px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: var(--radius);
  color: #0d0d0d;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 4px;
  cursor: pointer;
}

.submit:active { opacity: 0.85; }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
