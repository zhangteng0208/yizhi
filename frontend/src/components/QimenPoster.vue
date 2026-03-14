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

interface QimenData {
  ju?: {
    type: string
    number: number
  }
  yuan?: string
  timeInfo?: {
    solarTerm: string
    timeName: string
  }
  zhiFu?: {
    star: string
    heavenlyStem: string
  }
  zhiShi?: {
    gate: string
  }
  palaces?: Array<{
    position: number
    deity: string
    trigram: string
    star: string
    heavenlyStem: any
    earthlyStem: any
    gate: string
    isZhiFu?: boolean
    isZhiShi?: boolean
  }>
  auspicious?: Array<{
    name: string
    type: string
    position: number
  }>
  inauspicious?: Array<{
    name: string
    type: string
    position: number
  }>
}

interface FormData {
  name?: string
  birthday?: string
  hour?: number | string
}

const props = defineProps<{
  modelValue: boolean
  data: QimenData | null
  form: FormData | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const canvasRef = ref<HTMLCanvasElement>()
const imageUrl = ref('')

const hourLabels = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
const luoshuOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]

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

  // 设置画布尺寸
  const width = 750
  const height = 1600
  canvas.width = width
  canvas.height = height

  // 背景渐变（金色主题）
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#1a1410')
  bgGradient.addColorStop(0.5, '#2d1f0f')
  bgGradient.addColorStop(1, '#1a1410')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 装饰性图案
  drawDecorations(ctx, width, height)

  let y = 60

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 奇门遁甲', width / 2, y)
  y += 80

  // 用户信息和局数
  y = drawUserInfo(ctx, width, y)
  y += 40

  // 九宫盘面
  y = drawJiuGong(ctx, width, y)
  y += 40

  // 格局判断
  y = drawPatterns(ctx, width, y)
  y += 60

  // 底部信息
  drawFooter(ctx, width, height)

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png')
}

function drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.05

  // 八卦符号装饰
  ctx.fillStyle = '#CA8A04'
  ctx.font = '80px serif'
  ctx.textAlign = 'center'
  ctx.fillText('☰', 100, 150)
  ctx.fillText('☷', width - 100, height - 150)

  ctx.restore()
}

function drawUserInfo(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 200

  // 卡片背景
  ctx.fillStyle = 'rgba(202, 138, 4, 0.15)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 45

  // 姓名
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('姓名', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(props.form?.name || '—', cardX + cardWidth - 40, infoY)
  infoY += 45

  // 局数信息
  const gradient = ctx.createLinearGradient(cardX + cardWidth / 2 - 100, infoY, cardX + cardWidth / 2 + 100, infoY)
  gradient.addColorStop(0, '#CA8A04')
  gradient.addColorStop(1, '#f59e0b')
  ctx.fillStyle = gradient
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${props.data?.ju?.type}${props.data?.ju?.number}局`, cardX + cardWidth / 2, infoY)
  infoY += 45

  // 时间信息
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  const timeText = `${props.data?.yuan} · ${props.data?.timeInfo?.solarTerm} · ${props.data?.timeInfo?.timeName}`
  ctx.fillText(timeText, cardX + cardWidth / 2, infoY)
  infoY += 40

  // 值符值使
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  const zhiText = `值符 ${props.data?.zhiFu?.star}(${props.data?.zhiFu?.heavenlyStem}) · 值使 ${props.data?.zhiShi?.gate}`
  ctx.fillText(zhiText, cardX + cardWidth / 2, infoY)

  return y + cardHeight
}

function drawJiuGong(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('九宫盘面', cardX, y)
  y += 50

  if (!props.data?.palaces) return y

  // 3x3 网格
  const cellSize = (cardWidth - 20) / 3
  const gap = 10

  // 按洛书顺序排列
  const sortedPalaces = luoshuOrder
    .map(n => props.data!.palaces!.find(p => p.position === n))
    .filter(Boolean)

  sortedPalaces.forEach((palace, index) => {
    if (!palace) return

    const col = index % 3
    const row = Math.floor(index / 3)
    const x = cardX + col * (cellSize + gap)
    const cellY = y + row * (cellSize + gap)

    // 判断是否为值符或值使
    const isSpecial = palace.isZhiFu || palace.isZhiShi

    // 宫位背景
    ctx.fillStyle = isSpecial ? 'rgba(202, 138, 4, 0.2)' : 'rgba(202, 138, 4, 0.1)'
    roundRect(ctx, x, cellY, cellSize, cellSize, 12)
    ctx.fill()

    // 宫位边框
    ctx.strokeStyle = isSpecial ? 'rgba(202, 138, 4, 0.8)' : 'rgba(202, 138, 4, 0.4)'
    ctx.lineWidth = isSpecial ? 2.5 : 1.5
    ctx.stroke()

    let contentY = cellY + 25

    // 顶部：神和宫位
    ctx.fillStyle = '#CA8A04'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(palace.deity, x + 10, contentY)

    ctx.textAlign = 'right'
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(`${palace.position}宫`, x + cellSize - 10, contentY)
    contentY += 20

    // 八卦
    ctx.textAlign = 'center'
    ctx.font = '13px sans-serif'
    ctx.fillText(palace.trigram, x + cellSize / 2, contentY)
    contentY += 25

    // 天盘：九星
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('天', x + 10, contentY)

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(palace.star, x + cellSize / 2, contentY)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(formatStem(palace.heavenlyStem), x + cellSize - 10, contentY)
    contentY += 22

    // 地盘
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('地', x + 10, contentY)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(formatStem(palace.earthlyStem), x + cellSize / 2, contentY)
    contentY += 25

    // 八门
    const gateColor = getGateColor(palace.gate)
    ctx.fillStyle = gateColor
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(palace.gate, x + cellSize / 2, contentY)
  })

  return y + 3 * (cellSize + gap)
}

function drawPatterns(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  const hasPatterns = (props.data?.auspicious?.length || 0) + (props.data?.inauspicious?.length || 0) > 0
  if (!hasPatterns) return y

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('格局判断', cardX, y)
  y += 50

  let currentY = y

  // 吉格
  if (props.data?.auspicious && props.data.auspicious.length > 0) {
    props.data.auspicious.forEach(pattern => {
      const cardHeight = 60

      // 背景
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'
      roundRect(ctx, cardX, currentY, cardWidth, cardHeight, 12)
      ctx.fill()

      // 边框
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 吉标签
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('吉', cardX + 20, currentY + 38)

      // 格局名称
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px sans-serif'
      ctx.fillText(`${pattern.name}（${pattern.type}）${pattern.position}宫`, cardX + 60, currentY + 38)

      currentY += cardHeight + 10
    })
  }

  // 凶格
  if (props.data?.inauspicious && props.data.inauspicious.length > 0) {
    props.data.inauspicious.forEach(pattern => {
      const cardHeight = 60

      // 背景
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
      roundRect(ctx, cardX, currentY, cardWidth, cardHeight, 12)
      ctx.fill()

      // 边框
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 凶标签
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('凶', cardX + 20, currentY + 38)

      // 格局名称
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px sans-serif'
      ctx.fillText(`${pattern.name}（${pattern.type}）${pattern.position}宫`, cardX + 60, currentY + 38)

      currentY += cardHeight + 10
    })
  }

  return currentY
}

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const y = height - 60

  // 分割线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, y - 20)
  ctx.lineTo(width - 60, y - 20)
  ctx.stroke()

  // 底部文字
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 传承国学智慧', width / 2, y + 20)
}

function formatStem(stem: any): string {
  if (Array.isArray(stem)) {
    return stem.join(' ')
  }
  return String(stem || '')
}

function getGateColor(gate: string): string {
  if (['开门', '休门', '生门'].includes(gate)) return '#22c55e'
  if (['死门', '惊门', '伤门'].includes(gate)) return '#ef4444'
  return 'rgba(255, 255, 255, 0.8)'
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
  link.download = `易知先生-奇门遁甲-${props.form?.name || '结果'}.png`
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
  background: linear-gradient(135deg, #CA8A04 0%, #f59e0b 100%);
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
