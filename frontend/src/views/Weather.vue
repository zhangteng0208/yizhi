<template>
  <div class="weather-page">
    <!-- Header -->
    <div class="header">
      <div class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </div>
      <h1 class="title">天气详情</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
      <p>正在获取天气信息...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchWeatherData">重新获取</button>
    </div>

    <!-- Weather Content -->
    <div v-else-if="weatherData" class="weather-content">
      <!-- Current Weather -->
      <div class="current-weather">
        <div class="location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ weatherData.city }}</span>
        </div>

        <div class="temp-main">
          <span class="temp-value">{{ weatherData.temperature }}</span>
          <span class="temp-unit">°C</span>
        </div>

        <div class="weather-desc">{{ weatherData.weather }}</div>

        <div class="temp-range">
          <span>{{ weatherData.lowTemp }}°</span>
          <span class="separator">/</span>
          <span>{{ weatherData.highTemp }}°</span>
        </div>

        <!-- Weather Details Grid -->
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
              </svg>
            </div>
            <div class="detail-label">风力</div>
            <div class="detail-value">{{ weatherData.windDirection }} {{ weatherData.windPower }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div class="detail-label">湿度</div>
            <div class="detail-value">{{ weatherData.humidity }}%</div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="detail-label">能见度</div>
            <div class="detail-value">{{ weatherData.visibility }}km</div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
            </div>
            <div class="detail-label">体感温度</div>
            <div class="detail-value">{{ weatherData.feelsLike }}°C</div>
          </div>
        </div>
      </div>

      <!-- Forecast -->
      <div class="forecast-section">
        <h2 class="section-title">未来天气</h2>
        <div class="forecast-list">
          <div
            v-for="(day, index) in weatherData.forecast"
            :key="index"
            class="forecast-item"
          >
            <div class="forecast-date">
              <div class="date-day">{{ day.date }}</div>
              <div class="date-weekday">{{ day.weekday }}</div>
            </div>
            <div class="forecast-icon">{{ getWeatherEmoji(day.weather) }}</div>
            <div class="forecast-weather">{{ day.weather }}</div>
            <div class="forecast-temp">
              <span class="temp-high">{{ day.highTemp }}°</span>
              <span class="temp-low">{{ day.lowTemp }}°</span>
            </div>
            <div class="forecast-wind">{{ day.windDirection }} {{ day.windPower }}</div>
          </div>
        </div>
      </div>

      <!-- Update Time -->
      <div class="update-time">
        更新时间: {{ weatherData.updateTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const error = ref('')
const weatherData = ref<any>(null)

function getWeatherEmoji(weather: string): string {
  if (weather.includes('晴')) return '☀️'
  if (weather.includes('云') || weather.includes('阴')) return '☁️'
  if (weather.includes('雨')) return '🌧️'
  if (weather.includes('雪')) return '❄️'
  if (weather.includes('雷')) return '⚡'
  if (weather.includes('雾') || weather.includes('霾')) return '🌫️'
  return '🌤️'
}

async function fetchWeatherData() {
  loading.value = true
  error.value = ''

  try {
    if (!navigator.geolocation) {
      throw new Error('浏览器不支持定位功能')
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
    })

    const { latitude, longitude } = position.coords
    const response = await fetch(`/api/weather/detail?lng=${longitude}&lat=${latitude}`)

    if (!response.ok) {
      throw new Error('获取天气信息失败')
    }

    const result = await response.json()

    if (result.data) {
      weatherData.value = result.data
    } else {
      throw new Error(result.message || '获取天气信息失败')
    }
  } catch (err: any) {
    console.error('获取天气失败:', err)
    error.value = err.message || '获取天气信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWeatherData()
})
</script>

<style scoped>
.weather-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 32px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s;
  border-radius: 12px;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.95);
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.placeholder {
  width: 40px;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  color: var(--text-primary);
  animation: spin 1s linear infinite;
}

.spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 80px 20px;
}

.error-state p {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.retry-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:active {
  transform: scale(0.95);
}

/* Current Weather */
.current-weather {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  padding: 24px 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.location svg {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.location span {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.temp-main {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 8px;
}

.temp-value {
  font-size: 72px;
  font-weight: 200;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.temp-unit {
  font-size: 32px;
  color: var(--text-secondary);
  margin-top: 8px;
  margin-left: 4px;
}

.weather-desc {
  text-align: center;
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.temp-range {
  text-align: center;
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.separator {
  margin: 0 8px;
  opacity: 0.5;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.detail-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.detail-icon {
  width: 24px;
  height: 24px;
  margin: 0 auto 16px;
  color: var(--text-primary);
  opacity: 0.8;
}

.detail-icon svg {
  width: 100%;
  height: 100%;
}

.detail-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
}

.detail-value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

/* Forecast Section */
.forecast-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-left: 4px;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.forecast-item {
  display: grid;
  grid-template-columns: 80px 40px 1fr 80px 60px;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.forecast-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-day {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.date-weekday {
  font-size: 11px;
  color: var(--text-secondary);
}

.forecast-icon {
  font-size: 24px;
  text-align: center;
}

.forecast-weather {
  font-size: 13px;
  color: var(--text-primary);
}

.forecast-temp {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.temp-high {
  color: var(--text-primary);
  font-weight: 500;
}

.temp-low {
  color: var(--text-secondary);
}

.forecast-wind {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
}

/* Update Time */
.update-time {
  text-align: center;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.6;
  padding: 16px 0;
}

/* Responsive */
@media (min-width: 768px) {
  .weather-page {
    padding: 0 32px 40px;
  }
}

/* Accessibility - Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .back-btn,
  .retry-btn {
    animation: none;
    transition: none;
  }

  .back-btn:active,
  .retry-btn:active {
    transform: none;
  }
}
</style>
