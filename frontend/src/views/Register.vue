<template>
  <div class="register">
    <div class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 class="title">注册账号</h2>
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
          placeholder="密码（至少6位）"
          class="input"
        />
      </div>
      <div class="field">
        <input
          v-model="email"
          type="email"
          placeholder="邮箱（选填）"
          class="input"
        />
      </div>
      <div class="field">
        <input
          v-model="inviteCode"
          type="text"
          placeholder="邀请码"
          class="input"
        />
      </div>
      <button class="submit" @click="handleRegister">注册</button>
      <div class="login-link" @click="$router.push('/login')">
        已有账号？立即登录
      </div>
    </div>

    <p class="agreement">注册即同意《用户协议》和《隐私政策》</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const phone = ref('')
const password = ref('')
const email = ref('')
const inviteCode = ref('')

async function handleRegister() {
  if (phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  if (password.value.length < 6) {
    showToast('密码至少6位')
    return
  }
  if (!inviteCode.value) {
    showToast('请输入邀请码')
    return
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone.value,
        password: password.value,
        email: email.value || undefined,
        inviteCode: inviteCode.value
      })
    })

    const result = await response.json()

    // 检查响应状态
    if (!response.ok) {
      showToast(result.message || '注册失败')
      return
    }

    if (result.code === 200 && result.data) {
      showToast('注册成功')
      setTimeout(() => {
        router.replace('/login')
      }, 1500)
    } else {
      showToast(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    showToast('网络错误，请重试')
  }
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 32px 48px;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 0 32px;
  gap: 12px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: opacity 0.2s;
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.back-btn:active {
  opacity: 0.6;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
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
  border-color: rgba(219, 39, 119, 0.5); box-shadow: 0 0 12px rgba(219, 39, 119, 0.2);
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
  transition: opacity 0.2s;
}

.submit:active {
  opacity: 0.85;
}

.login-link {
  text-align: center;
  font-size: 13px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.2s;
}

.login-link:active {
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
