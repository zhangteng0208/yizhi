<template>
  <div class="login">
    <div class="brand">
      <svg class="brand-symbol" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
        <path d="M50 5 A45 45 0 0 1 50 95 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 5" fill="currentColor" opacity="0.8"/>
        <path d="M50 95 A45 45 0 0 1 50 5 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 95" fill="currentColor" opacity="0.2"/>
        <circle cx="50" cy="27.5" r="5" fill="currentColor" opacity="0.8"/>
        <circle cx="50" cy="72.5" r="5" fill="currentColor" opacity="0.3"/>
      </svg>
      <h1 class="brand-name">易知先生</h1>
      <p class="brand-slogan">知命不惧 · 日日自新</p>
    </div>

    <div class="form">
      <div class="field">
        <input
          v-model="phone"
          type="tel"
          placeholder="手机号"
          maxlength="11"
          class="input"
        />
      </div>
      <div class="field">
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          class="input"
        />
      </div>
      <button class="submit" @click="handleLogin">登录</button>
      <div class="register-link" @click="$router.push('/register')">
        还没有账号？立即注册
      </div>
    </div>

    <p class="agreement">登录即同意《用户协议》和《隐私政策》</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const phone = ref('')
const password = ref('')

async function handleLogin() {
  if (phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }

  try {
    const response = await fetch('/api/auth/login/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone.value,
        password: password.value
      })
    })

    const result = await response.json()

    // 检查响应状态
    if (!response.ok) {
      showToast(result.message || '登录失败')
      return
    }

    if (result.code === 200 && result.data) {
      // 使用 userStore 的 setToken 方法，会自动设置过期时间
      userStore.setToken(result.data.access_token)
      localStorage.setItem('user_id', result.data.user_id)
      userStore.userId = result.data.user_id
      showToast('登录成功')
      setTimeout(() => {
        router.replace('/')
      }, 500)
    } else {
      showToast(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    showToast('网络错误，请重试')
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 32px 48px;
}

.brand {
  text-align: center;
  margin-bottom: 56px;
}

.brand-symbol {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="black" stroke-width="2" fill="none" opacity="0.3"/><path d="M50 5 A45 45 0 0 1 50 95 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 5" fill="black" opacity="0.8"/><path d="M50 95 A45 45 0 0 1 50 5 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 95" fill="black" opacity="0.2"/><circle cx="50" cy="27.5" r="5" fill="black" opacity="0.8"/><circle cx="50" cy="72.5" r="5" fill="black" opacity="0.3"/></svg>') center/contain no-repeat;
  mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="black" stroke-width="2" fill="none" opacity="0.3"/><path d="M50 5 A45 45 0 0 1 50 95 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 5" fill="black" opacity="0.8"/><path d="M50 95 A45 45 0 0 1 50 5 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 95" fill="black" opacity="0.2"/><circle cx="50" cy="27.5" r="5" fill="black" opacity="0.8"/><circle cx="50" cy="72.5" r="5" fill="black" opacity="0.3"/></svg>') center/contain no-repeat;
}

.brand-name {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 8px;
}

.brand-slogan {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 3px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
}

.input {
  flex: 1;
  height: 48px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:focus {
  border-color: rgba(219, 39, 119, 0.5);
  box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
}

.submit {
  height: 48px;
  margin-top: 8px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: var(--radius);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.submit:active {
  opacity: 0.85;
}

.register-link {
  text-align: center;
  font-size: 13px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.2s;
}

.register-link:active {
  opacity: 0.7;
}

.agreement {
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
