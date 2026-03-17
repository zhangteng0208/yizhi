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

interface YijingData {
  origin?: {
    name?: string
    symbol?: string
    upper?: { nick: string }
    lower?: { nick: string }
    judgement?: string
    text?: string
  }
  changed?: {
    name?: string
    symbol?: string
  }
  rule?: string
  yaos?: Array<{
    position: string
    text: string
    isMoving: boolean
  }>
  focus?: string[]
  ai?: {
    guaxiang?: string
    yili?: string
    qishi?: string
  }
}

const props = defineProps<{
  show: boolean
  data: YijingData | null
  question: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const visible = ref(props.show)
const canvasRef = ref<HTMLCanvasElement>()
const imageUrl = ref('')

watch(() => props.show, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => {
      drawPoster()
    })
  }
})

watch(visible, (val) => {
  emit('update:show', val)
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
  const height = 1334
  canvas.width = width
  canvas.height = height

  // 背景渐变
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#1a1a2e')
  bgGradient.addColorStop(0.5, '#16213e')
  bgGradient.addColorStop(1, '#0f3460')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 装饰性图案
  drawDecorations(ctx, width, height)

  let y = 60

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 易经占卜', width / 2, y)
  y += 80

  // 问题卡片
  if (props.question) {
    y = drawQuestion(ctx, width, y)
    y += 40
  }

  // 卦象卡片
  y = drawGua(ctx, width, y)
  y += 40

  // 断卦规则
  if (props.data.rule) {
    y = drawRule(ctx, width, y)
    y += 40
  }

  // 爻辞
  if (props.data.yaos && props.data.yaos.length > 0) {
    y = drawYaos(ctx, width, y)
    y += 40
  }

  // AI解读
  if (props.data.ai) {
    y = drawAiInterpretation(ctx, width, y)
  }

  // 底部信息
  drawFooter(ctx, width, height)

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png')
}

function drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.05

  // 左上角太极
  drawTaiji(ctx, 100, 100, 80)

  // 右下角太极
  drawTaiji(ctx, width - 100, height - 100, 80)

  ctx.restore()
}

function drawTaiji(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // 外圆
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // 左半圆（黑）
  ctx.beginPath()
  ctx.arc(x, y, r, Math.PI / 2, Math.PI * 1.5)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // 上小圆（白）
  ctx.beginPath()
  ctx.arc(x, y - r / 2, r / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // 下小圆（黑）
  ctx.beginPath()
  ctx.arc(x, y + r / 2, r / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // 上小点（黑）
  ctx.beginPath()
  ctx.arc(x, y - r / 2, r / 6, 0, Math.PI * 2)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // 下小点（白）
  ctx.beginPath()
  ctx.arc(x, y + r / 2, r / 6, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

function drawQuestion(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 120

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 标签
  ctx.fillStyle = '#ffffff'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('心中所惑', cardX + 30, y + 40)

  // 问题内容
  ctx.font = '28px sans-serif'
  const gradient = ctx.createLinearGradient(cardX, y + 80, cardX + cardWidth, y + 80)
  gradient.addColorStop(0, '#DB2777')
  gradient.addColorStop(1, '#CA8A04')
  ctx.fillStyle = gradient

  const question = props.question || '未填写问题'
  const maxWidth = cardWidth - 60
  wrapText(ctx, question, cardX + 30, y + 80, maxWidth, 36)

  return y + cardHeight
}

function drawGua(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('卦象', cardX, y)
  y += 50

  const cardHeight = 360

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  let contentY = y + 50

  // 卦象符号
  ctx.fillStyle = '#ffffff'
  ctx.font = '64px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(props.data?.origin?.symbol || '☰', width / 2, contentY)
  contentY += 80

  // 卦名
  const nameGradient = ctx.createLinearGradient(width / 2 - 100, contentY, width / 2 + 100, contentY)
  nameGradient.addColorStop(0, '#DB2777')
  nameGradient.addColorStop(1, '#CA8A04')
  ctx.fillStyle = nameGradient
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(props.data?.origin?.name || '未知卦', width / 2, contentY)
  contentY += 50

  // 上下卦
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '22px sans-serif'
  const trigrams = `${props.data?.origin?.upper?.nick || ''}上${props.data?.origin?.lower?.nick || ''}下`
  ctx.fillText(trigrams, width / 2, contentY)
  contentY += 50

  // 卦辞
  if (props.data?.origin?.judgement) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '20px sans-serif'
    wrapText(ctx, props.data.origin.judgement, width / 2, contentY, cardWidth - 80, 32)
    contentY += 60
  }

  // 变卦
  if (props.data?.changed) {
    ctx.fillStyle = '#CA8A04'
    ctx.font = '20px sans-serif'
    ctx.fillText(`变 → ${props.data.changed.symbol} ${props.data.changed.name}`, width / 2, contentY)
  }

  return y + cardHeight
}

function drawRule(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 100

  // 卡片背景
  ctx.fillStyle = 'rgba(219, 39, 119, 0.1)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 断卦规则
  const gradient = ctx.createLinearGradient(cardX, y + 50, cardX + cardWidth, y + 50)
  gradient.addColorStop(0, '#DB2777')
  gradient.addColorStop(1, '#CA8A04')
  ctx.fillStyle = gradient
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  wrapText(ctx, props.data?.rule || '', width / 2, y + 50, cardWidth - 60, 32)

  return y + cardHeight
}

function drawYaos(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('爻辞', cardX, y)
  y += 50

  const yaos = props.data?.yaos || []
  const reversedYaos = [...yaos].reverse()
  const lineHeight = 50
  const cardHeight = Math.min(reversedYaos.length * lineHeight + 60, 400)

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  let yaoY = y + 40

  // 只显示前6个爻
  for (let i = 0; i < Math.min(reversedYaos.length, 6); i++) {
    const yao = reversedYaos[i]

    // 动爻背景
    if (yao.isMoving) {
      ctx.fillStyle = 'rgba(219, 39, 119, 0.1)'
      roundRect(ctx, cardX + 20, yaoY - 25, cardWidth - 40, 45, 6)
      ctx.fill()
    }

    // 爻位
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(yao.position, cardX + 30, yaoY)

    // 爻辞（截断过长文本）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '18px sans-serif'
    const maxTextWidth = cardWidth - 150
    let yaoText = yao.text
    if (ctx.measureText(yaoText).width > maxTextWidth) {
      while (ctx.measureText(yaoText + '...').width > maxTextWidth && yaoText.length > 0) {
        yaoText = yaoText.slice(0, -1)
      }
      yaoText += '...'
    }
    ctx.fillText(yaoText, cardX + 120, yaoY)

    yaoY += lineHeight
  }

  return y + cardHeight
}

function drawAiInterpretation(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('义理解读', cardX, y)
  y += 50

  let cardHeight = 80

  // 计算卡片高度
  if (props.data?.ai?.guaxiang) {
    const lines = Math.ceil(props.data.ai.guaxiang.length / 25)
    cardHeight += lines * 32 + 40
  }
  if (props.data?.ai?.yili) {
    const lines = Math.ceil(props.data.ai.yili.length / 25)
    cardHeight += lines * 32 + 40
  }

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  let contentY = y + 40

  // 卦象解读
  if (props.data?.ai?.guaxiang) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'left'
    const lines = wrapText(ctx, props.data.ai.guaxiang, cardX + 30, contentY, cardWidth - 60, 32)
    contentY += lines * 32 + 40
  }

  // 义理阐释
  if (props.data?.ai?.yili) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '22px sans-serif'
    wrapText(ctx, props.data.ai.yili, cardX + 30, contentY, cardWidth - 60, 32)
  }

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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split('')
  let line = ''
  let lineCount = 0

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y + lineCount * lineHeight)
      line = words[i]
      lineCount++
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y + lineCount * lineHeight)
  return lineCount + 1
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
  link.download = `易知先生-易经占卜-${new Date().getTime()}.png`
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
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
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
