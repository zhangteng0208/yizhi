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

interface MeihuaData {
  benGua?: {
    name: string
    guaci: string
    tuan: string
    xiang: string
    yao: string[]
  }
  shangGua?: {
    symbol: string
    name: string
    xiangtian: string
    wuxing: string
    fangwei: string
  }
  xiaGua?: {
    symbol: string
    name: string
    xiangtian: string
    wuxing: string
    fangwei: string
  }
  bianGua?: {
    name: string
    guaci: string
  }
  huGua?: {
    name: string
    guaci: string
  }
  strokes?: Array<{
    char: string
    stroke: number
  }>
  xingTotal?: number
  mingTotal?: number
  totalStrokes?: number
  dongYao?: number
}

const props = defineProps<{
  modelValue: boolean
  data: MeihuaData | null
  name: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const canvasRef = ref<HTMLCanvasElement>()
const imageUrl = ref('')

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

  // 背景渐变（青色主题）
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#0f2027')
  bgGradient.addColorStop(0.5, '#203a43')
  bgGradient.addColorStop(1, '#2c5364')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 装饰性图案
  drawDecorations(ctx, width, height)

  let y = 60

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 梅花易数', width / 2, y)
  y += 80

  // 姓名和本卦
  y = drawMainInfo(ctx, width, y)
  y += 40

  // 上下卦
  y = drawGuaSymbols(ctx, width, y)
  y += 40

  // 卦辞
  y = drawGuaCi(ctx, width, y)
  y += 40

  // 笔画详情
  y = drawStrokes(ctx, width, y)
  y += 40

  // 变卦互卦
  y = drawBianHuGua(ctx, width, y)
  y += 60

  // 底部信息
  drawFooter(ctx, width, height)

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png')
}

function drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.08

  // 太极图案装饰
  ctx.fillStyle = '#06b6d4'
  ctx.font = '100px serif'
  ctx.textAlign = 'center'
  ctx.fillText('☯', 100, 150)
  ctx.fillText('☯', width - 100, height - 150)

  ctx.restore()
}

function drawMainInfo(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 180

  // 卡片背景
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 50

  // 姓名
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('姓名', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(props.name || '—', cardX + cardWidth - 40, infoY)
  infoY += 60

  // 本卦名称
  const gradient = ctx.createLinearGradient(cardX + cardWidth / 2 - 150, infoY, cardX + cardWidth / 2 + 150, infoY)
  gradient.addColorStop(0, '#06b6d4')
  gradient.addColorStop(1, '#0891b2')
  ctx.fillStyle = gradient
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(props.data?.benGua?.name || '—', cardX + cardWidth / 2, infoY)

  return y + cardHeight
}

function drawGuaSymbols(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 200

  // 卡片背景
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  const halfWidth = cardWidth / 2
  const gap = 20

  // 上卦
  let guaY = y + 50
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('上卦', cardX + halfWidth / 2, guaY)

  guaY += 40
  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 48px serif'
  ctx.fillText(props.data?.shangGua?.symbol || '☰', cardX + halfWidth / 2, guaY)

  guaY += 40
  ctx.fillStyle = '#ffffff'
  ctx.font = '22px sans-serif'
  ctx.fillText(props.data?.shangGua?.name || '—', cardX + halfWidth / 2, guaY)

  guaY += 30
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '16px sans-serif'
  ctx.fillText(`${props.data?.shangGua?.wuxing} · ${props.data?.shangGua?.fangwei}`, cardX + halfWidth / 2, guaY)

  // 下卦
  guaY = y + 50
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('下卦', cardX + halfWidth + halfWidth / 2, guaY)

  guaY += 40
  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 48px serif'
  ctx.fillText(props.data?.xiaGua?.symbol || '☷', cardX + halfWidth + halfWidth / 2, guaY)

  guaY += 40
  ctx.fillStyle = '#ffffff'
  ctx.font = '22px sans-serif'
  ctx.fillText(props.data?.xiaGua?.name || '—', cardX + halfWidth + halfWidth / 2, guaY)

  guaY += 30
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '16px sans-serif'
  ctx.fillText(`${props.data?.xiaGua?.wuxing} · ${props.data?.xiaGua?.fangwei}`, cardX + halfWidth + halfWidth / 2, guaY)

  return y + cardHeight
}

function drawGuaCi(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  if (!props.data?.benGua?.guaci) return y

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('卦辞', cardX, y)
  y += 50

  const cardHeight = 120

  // 卡片背景
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 卦辞内容
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'left'

  const guaci = props.data.benGua.guaci
  const maxWidth = cardWidth - 60
  const lines = wrapText(ctx, guaci, maxWidth)

  let textY = y + 40
  lines.slice(0, 3).forEach(line => {
    ctx.fillText(line, cardX + 30, textY)
    textY += 30
  })

  return y + cardHeight
}

function drawStrokes(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('康熙笔画', cardX, y)
  y += 50

  const cardHeight = 140

  // 卡片背景
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  let contentY = y + 45

  // 笔画详情
  if (props.data?.strokes && props.data.strokes.length > 0) {
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'

    const strokeText = props.data.strokes.map(s => `${s.char}(${s.stroke})`).join(' ')
    ctx.fillText(strokeText, cardX + cardWidth / 2, contentY)
    contentY += 45
  }

  // 总计信息
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  const metaText = `姓${props.data?.xingTotal}画 · 名${props.data?.mingTotal}画 · 总${props.data?.totalStrokes}画 · 动爻第${props.data?.dongYao}爻`
  ctx.fillText(metaText, cardX + cardWidth / 2, contentY)

  return y + cardHeight
}

function drawBianHuGua(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('变卦 · 互卦', cardX, y)
  y += 50

  const cardHeight = 180

  // 卡片背景
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  let contentY = y + 40

  // 变卦
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('变卦', cardX + 30, contentY)

  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText(props.data?.bianGua?.name || '—', cardX + 100, contentY)
  contentY += 35

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = '16px sans-serif'
  const bianGuaCi = props.data?.bianGua?.guaci || ''
  const bianLines = wrapText(ctx, bianGuaCi, cardWidth - 60)
  bianLines.slice(0, 1).forEach(line => {
    ctx.fillText(line, cardX + 30, contentY)
    contentY += 25
  })
  contentY += 20

  // 互卦
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('互卦', cardX + 30, contentY)

  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText(props.data?.huGua?.name || '—', cardX + 100, contentY)
  contentY += 35

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = '16px sans-serif'
  const huGuaCi = props.data?.huGua?.guaci || ''
  const huLines = wrapText(ctx, huGuaCi, cardWidth - 60)
  huLines.slice(0, 1).forEach(line => {
    ctx.fillText(line, cardX + 30, contentY)
  })

  return y + cardHeight
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  for (let i = 0; i < text.length; i++) {
    const testLine = currentLine + text[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = text[i]
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
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
  link.download = `易知先生-梅花易数-${props.name || '结果'}.png`
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
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
