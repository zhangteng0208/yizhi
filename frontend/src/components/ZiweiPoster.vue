<template>
  <van-popup
    v-model:show="visible"
    position="center"
    :style="{ background: 'transparent' }"
    :close-on-click-overlay="true"
  >
    <div class="poster-container">
      <div class="poster-header">
        <span class="poster-title">长按保存图片</span>
        <van-icon name="cross" @click="close" class="close-icon" />
      </div>

      <div class="canvas-wrapper">
        <canvas ref="canvasRef" class="poster-canvas"></canvas>
      </div>

      <div class="poster-actions">
        <button class="btn-save" @click="saveImage">保存到相册</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { showToast } from 'vant'

interface ZiweiData {
  solarDate?: string
  lunarDate?: string
  zodiac?: string
  sign?: string
  fiveElementsClass?: string
  soul?: string
  body?: string
  mingMainStar?: string
  birthplace?: string
  lat?: number
  lng?: number
  palaces?: Array<{
    name: string
    heavenlyStem: string
    earthlyBranch: string
    majorStars?: Array<{ name: string; brightness: string }>
    minorStars?: string[]
  }>
  ai?: {
    score?: number
  }
}

interface FormData {
  name?: string
  gender?: string
  birthday?: string
  hour?: number | string
  calendar?: string
  birthplace?: string
}

const props = defineProps<{
  modelValue: boolean
  data: ZiweiData | null
  form: FormData | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const canvasRef = ref<HTMLCanvasElement>()
const imageUrl = ref('')

const hourLabels = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => {
      drawPoster()
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function close() {
  visible.value = false
}

async function drawPoster() {
  if (!canvasRef.value || !props.data) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸（增加高度以容纳十二宫和轴线）
  const width = 750
  const height = 2100
  canvas.width = width
  canvas.height = height

  // 背景渐变（紫色主题）
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#2d1b4e')
  bgGradient.addColorStop(0.5, '#1e1338')
  bgGradient.addColorStop(1, '#0f0a1e')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 装饰性星星
  drawStars(ctx, width, height)

  let y = 60

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 紫微斗数', width / 2, y)
  y += 80

  // 用户信息卡片
  y = drawUserInfo(ctx, width, y)
  y += 40

  // 命盘核心信息
  y = drawCoreInfo(ctx, width, y)
  y += 40

  // 十二宫星曜
  y = drawTwelvePalaces(ctx, width, y)
  y += 40

  // 命迁线和夫官线
  y = drawAxisLines(ctx, width, y)
  y += 60

  // 底部信息
  drawFooter(ctx, width, height)

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png')
}

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'

  // 随机星星
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = Math.random() * 2 + 1
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawUserInfo(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 240

  // 卡片背景
  ctx.fillStyle = 'rgba(147, 51, 234, 0.15)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 40

  // 姓名
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('姓名', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(props.form?.name || '—', cardX + cardWidth - 40, infoY)
  infoY += 40

  // 阳历
  ctx.textAlign = 'left'
  ctx.fillText('阳历', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.font = '24px sans-serif'
  ctx.fillText(props.data?.solarDate || '—', cardX + cardWidth - 40, infoY)
  infoY += 40

  // 农历
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('农历', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.font = '24px sans-serif'
  ctx.fillText(props.data?.lunarDate || '—', cardX + cardWidth - 40, infoY)
  infoY += 40

  // 生肖星座
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('生肖/星座', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(`${props.data?.zodiac || '—'} · ${props.data?.sign || '—'}`, cardX + cardWidth - 40, infoY)
  infoY += 40

  // 出生地
  if (props.data?.birthplace) {
    ctx.textAlign = 'left'
    ctx.fillText('出生地', cardX + 40, infoY)
    ctx.textAlign = 'right'
    ctx.font = '22px sans-serif'
    const location = props.data.lat != null
      ? `${props.data.birthplace} (${props.data.lng?.toFixed(2)}°, ${props.data.lat?.toFixed(2)}°)`
      : props.data.birthplace
    ctx.fillText(location, cardX + cardWidth - 40, infoY)
  }

  return y + cardHeight
}

function drawCoreInfo(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 200

  // 卡片背景
  ctx.fillStyle = 'rgba(147, 51, 234, 0.15)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 50

  // 五行局
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('五行局', cardX + 40, infoY)

  const gradient1 = ctx.createLinearGradient(cardX + 200, infoY, cardX + 400, infoY)
  gradient1.addColorStop(0, '#9333ea')
  gradient1.addColorStop(1, '#ec4899')
  ctx.fillStyle = gradient1
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(props.data?.fiveElementsClass || '—', cardX + 200, infoY)
  infoY += 50

  // 命主/身主
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('命主/身主', cardX + 40, infoY)

  ctx.fillStyle = gradient1
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(`${props.data?.soul || '—'} / ${props.data?.body || '—'}`, cardX + 200, infoY)
  infoY += 50

  // 命宫主星
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('命宫主星', cardX + 40, infoY)

  ctx.fillStyle = gradient1
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(props.data?.mingMainStar || '—', cardX + 200, infoY)

  return y + cardHeight
}

function drawTwelvePalaces(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('十二宫星曜', cardX, y)
  y += 50

  if (!props.data?.palaces || props.data.palaces.length === 0) return y

  // 3x4 网格布局
  const cols = 3
  const rows = 4
  const cellWidth = (cardWidth - 20) / cols
  const cellHeight = 180
  const gap = 10

  props.data.palaces.forEach((palace, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = cardX + col * (cellWidth + gap)
    const cellY = y + row * (cellHeight + gap)

    // 判断是否为命宫
    const isMingGong = palace.name === '命宫'

    // 宫位背景
    ctx.fillStyle = isMingGong ? 'rgba(236, 72, 153, 0.2)' : 'rgba(147, 51, 234, 0.1)'
    roundRect(ctx, x, cellY, cellWidth, cellHeight, 12)
    ctx.fill()

    // 宫位边框
    ctx.strokeStyle = isMingGong ? 'rgba(236, 72, 153, 0.6)' : 'rgba(147, 51, 234, 0.3)'
    ctx.lineWidth = isMingGong ? 2.5 : 1.5
    ctx.stroke()

    // 宫位名称
    ctx.fillStyle = isMingGong ? '#ec4899' : '#ffffff'
    ctx.font = isMingGong ? 'bold 20px sans-serif' : 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(palace.name, x + 12, cellY + 28)

    // 干支
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${palace.heavenlyStem}${palace.earthlyBranch}`, x + cellWidth - 12, cellY + 28)

    let contentY = cellY + 55

    // 主星
    if (palace.majorStars && palace.majorStars.length > 0) {
      ctx.fillStyle = isMingGong ? '#ec4899' : '#9333ea'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'left'

      const majorText = palace.majorStars.map(s => `${s.name}${s.brightness}`).join(' ')

      // 自动换行
      const maxWidth = cellWidth - 24
      const words = majorText.split(' ')
      let line = ''

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, x + 12, contentY)
          line = word
          contentY += 22
        } else {
          line = testLine
        }
      }
      if (line) {
        ctx.fillText(line, x + 12, contentY)
        contentY += 22
      }
    }

    // 辅星
    if (palace.minorStars && palace.minorStars.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'left'

      const minorText = palace.minorStars.slice(0, 8).join(' ')

      // 自动换行
      const maxWidth = cellWidth - 24
      const words = minorText.split(' ')
      let line = ''

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, x + 12, contentY)
          line = word
          contentY += 20

          // 限制最多3行
          if (contentY > cellY + cellHeight - 20) break
        } else {
          line = testLine
        }
      }
      if (line && contentY <= cellY + cellHeight - 20) {
        ctx.fillText(line, x + 12, contentY)
      }
    }
  })

  return y + rows * (cellHeight + gap)
}

function drawAxisLines(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  if (!props.data?.palaces) return y

  const cardX = 60
  const cardWidth = width - 120

  // 找到相关宫位
  const palaces = props.data.palaces
  const mingGong = palaces.find(p => p.name === '命宫')
  const qianyiGong = palaces.find(p => p.name === '迁移')
  const fuqiGong = palaces.find(p => p.name === '夫妻')
  const guanluGong = palaces.find(p => p.name === '官禄')

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('重要宫位轴线', cardX, y)
  y += 50

  // 命迁线
  if (mingGong && qianyiGong) {
    y = drawAxisLine(ctx, cardX, cardWidth, y, '命迁线', '内在格局 ⟷ 外在发展', [mingGong, qianyiGong])
    y += 30
  }

  // 夫官线
  if (fuqiGong && guanluGong) {
    y = drawAxisLine(ctx, cardX, cardWidth, y, '夫官线', '感情婚姻 ⟷ 事业仕途', [fuqiGong, guanluGong])
    y += 30
  }

  return y
}

function drawAxisLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  y: number,
  title: string,
  desc: string,
  palaces: any[]
): number {
  const cardHeight = 200

  // 卡片背景
  ctx.fillStyle = 'rgba(147, 51, 234, 0.12)'
  roundRect(ctx, x, y, width, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  let contentY = y + 35

  // 轴线标题
  ctx.fillStyle = '#ec4899'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(title, x + 30, contentY)

  // 轴线描述
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(desc, x + width - 30, contentY)
  contentY += 45

  // 绘制两个宫位
  const palaceWidth = (width - 100) / 2
  const gap = 20

  palaces.forEach((palace, index) => {
    const palaceX = x + 30 + index * (palaceWidth + gap)

    // 宫位名称和干支
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(palace.name, palaceX, contentY)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${palace.heavenlyStem}${palace.earthlyBranch}`, palaceX + palaceWidth, contentY)

    let starY = contentY + 30

    // 主星
    if (palace.majorStars && palace.majorStars.length > 0) {
      ctx.fillStyle = '#9333ea'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'left'
      const majorText = palace.majorStars.map((s: any) => `${s.name}${s.brightness}`).join(' ')

      // 自动换行
      const maxWidth = palaceWidth - 10
      const words = majorText.split(' ')
      let line = ''

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, palaceX, starY)
          line = word
          starY += 24
        } else {
          line = testLine
        }
      }
      if (line) {
        ctx.fillText(line, palaceX, starY)
        starY += 24
      }
    }

    // 辅星（最多显示前4个）
    if (palace.minorStars && palace.minorStars.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '15px sans-serif'
      ctx.textAlign = 'left'
      const minorText = palace.minorStars.slice(0, 4).join(' ')

      // 自动换行
      const maxWidth = palaceWidth - 10
      const words = minorText.split(' ')
      let line = ''

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, palaceX, starY)
          line = word
          starY += 22
        } else {
          line = testLine
        }
      }
      if (line) {
        ctx.fillText(line, palaceX, starY)
      }
    }

    // 绘制连接箭头（在两个宫位之间）
    if (index === 0) {
      const arrowX = palaceX + palaceWidth + gap / 2
      const arrowY = contentY + 30
      ctx.fillStyle = 'rgba(236, 72, 153, 0.6)'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⟷', arrowX, arrowY)
    }
  })

  return y + cardHeight
}

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const y = height - 80

  // 分割线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, y - 20)
  ctx.lineTo(width - 60, y - 20)
  ctx.stroke()

  // 综合得分
  if (props.data?.ai?.score) {
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('综合得分', width / 2 - 100, y + 10)

    const gradient = ctx.createLinearGradient(width / 2, y, width / 2 + 100, y)
    gradient.addColorStop(0, '#9333ea')
    gradient.addColorStop(1, '#ec4899')
    ctx.fillStyle = gradient
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText(String(props.data.ai.score), width / 2 + 50, y + 15)
  }

  // 底部文字
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 传承国学智慧', width / 2, y + 50)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function saveImage() {
  if (!imageUrl.value) {
    showToast('图片生成中，请稍候')
    return
  }

  const link = document.createElement('a')
  link.download = `易知先生-紫微斗数-${props.form?.name || '结果'}.png`
  link.href = imageUrl.value
  link.click()

  showToast('图片已保存')
}
</script>

<style scoped>
.poster-container {
  width: 90vw;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  overflow: hidden;
}

.poster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.poster-title {
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
}

.close-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.canvas-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;
}

.poster-canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.poster-actions {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-save {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-save:active {
  opacity: 0.85;
}
</style>
