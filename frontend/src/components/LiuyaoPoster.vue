<template>
  <van-popup v-model:show="visible" position="bottom" :style="{ height: '85%' }" round>
    <div class="poster-container">
      <div class="poster-header">
        <span class="poster-title">六爻占卜海报</span>
        <span class="poster-close" @click="visible = false">×</span>
      </div>

      <div class="poster-canvas-wrapper">
        <canvas ref="canvasRef" width="750" height="1334"></canvas>
      </div>

      <div class="poster-actions">
        <button class="btn-save" @click="saveImage">保存图片</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  show: boolean
  data: any
  question: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:show': [value: boolean] }>()

const visible = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

watch(() => props.show, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => drawPoster())
  }
})

watch(visible, (val) => {
  emit('update:show', val)
})

function drawPoster() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = 750
  const height = 1334

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 背景渐变
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#1a1a1a')
  bgGradient.addColorStop(1, '#141414')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 绘制太极装饰
  drawTaijiDecoration(ctx, width, height)

  let y = 80

  // 标题
  ctx.fillStyle = '#DB2777'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('六爻占卜', width / 2, y)
  y += 80

  // 问题卡片
  if (props.question) {
    y = drawQuestionCard(ctx, width, y)
    y += 40
  }

  // 卦象卡片
  y = drawGuaCard(ctx, width, y)
  y += 40

  // 爻位详情卡片
  y = drawYaoCard(ctx, width, y)
  y += 40

  // AI解读卡片
  if (props.data?.ai) {
    y = drawAiCard(ctx, width, y)
  }

  // 底部信息
  drawFooter(ctx, width, height)
}

function drawTaijiDecoration(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.03

  // 左上角太极
  ctx.translate(100, 100)
  drawTaiji(ctx, 80)
  ctx.translate(-100, -100)

  // 右下角太极
  ctx.translate(width - 100, height - 100)
  ctx.rotate(Math.PI)
  drawTaiji(ctx, 80)

  ctx.restore()
}

function drawTaiji(ctx: CanvasRenderingContext2D, radius: number) {
  // 外圆
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()

  // 黑色半圆
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(0, 0, radius, Math.PI / 2, Math.PI * 1.5)
  ctx.closePath()
  ctx.fill()

  // 上半小圆
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, -radius / 2, radius / 2, 0, Math.PI * 2)
  ctx.fill()

  // 下半小圆
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(0, radius / 2, radius / 2, 0, Math.PI * 2)
  ctx.fill()

  // 上半小点
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(0, -radius / 2, radius / 8, 0, Math.PI * 2)
  ctx.fill()

  // 下半小点
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, radius / 2, radius / 8, 0, Math.PI * 2)
  ctx.fill()
}

function drawQuestionCard(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 40
  const cardWidth = width - 80
  const padding = 30

  // 卡片背景
  ctx.fillStyle = 'rgba(219, 39, 119, 0.1)'
  roundRect(ctx, cardX, y, cardWidth, 120, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 标题
  ctx.fillStyle = '#DB2777'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('所问之事', cardX + padding, y + 45)

  // 问题内容
  ctx.fillStyle = '#e5e5e5'
  ctx.font = '24px sans-serif'
  const question = props.question.length > 30 ? props.question.slice(0, 30) + '...' : props.question
  ctx.fillText(question, cardX + padding, y + 85)

  return y + 120
}

function drawGuaCard(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 40
  const cardWidth = width - 80
  const padding = 30

  const origin = props.data?.origin
  const changed = props.data?.changed

  // 卡片背景
  ctx.fillStyle = 'rgba(26, 26, 26, 0.95)'
  roundRect(ctx, cardX, y, cardWidth, 280, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  let cardY = y + 50

  // 本卦名称
  ctx.fillStyle = '#DB2777'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(origin?.name || '未知卦', width / 2, cardY)
  cardY += 60

  // 上下卦符号
  ctx.font = '56px sans-serif'
  ctx.fillStyle = '#e5e5e5'

  const upperSymbol = origin?.upper?.symbol || '☰'
  const lowerSymbol = origin?.lower?.symbol || '☰'

  ctx.fillText(upperSymbol, width / 2 - 80, cardY)
  ctx.fillText(lowerSymbol, width / 2 + 80, cardY)
  cardY += 20

  // 上下卦名称
  ctx.font = '22px sans-serif'
  ctx.fillStyle = '#999'
  ctx.fillText(origin?.upper?.nick || '', width / 2 - 80, cardY)
  ctx.fillText(origin?.lower?.nick || '', width / 2 + 80, cardY)
  cardY += 50

  // 卦辞
  if (origin?.judgement) {
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#b3b3b3'
    const judgement = origin.judgement.length > 40 ? origin.judgement.slice(0, 40) + '...' : origin.judgement
    ctx.fillText(judgement, width / 2, cardY)
    cardY += 40
  }

  // 变卦信息
  if (changed) {
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#CA8A04'
    ctx.fillText(`变卦：${changed.symbol} ${changed.name}`, width / 2, cardY)
  }

  return y + 280
}

function drawYaoCard(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 40
  const cardWidth = width - 80
  const padding = 30

  const origin = props.data?.origin
  const movingIndexes = props.data?.movingIndexes || []
  const gods = props.data?.gods || []

  // 卡片背景
  ctx.fillStyle = 'rgba(26, 26, 26, 0.95)'
  roundRect(ctx, cardX, y, cardWidth, 420, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 标题
  ctx.fillStyle = '#999'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('爻位详情', cardX + padding, y + 45)

  let yaoY = y + 80
  const lineHeight = 50

  // 绘制六爻（从上到下，索引6到1）
  const labels = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻']

  for (let i = 0; i < 6; i++) {
    const index = 6 - i // 从6到1
    const isMoving = movingIndexes.includes(index)
    const isShi = origin?.shi === index
    const isYing = origin?.ying === index

    // 爻位背景
    if (isMoving) {
      ctx.fillStyle = 'rgba(219, 39, 119, 0.1)'
      roundRect(ctx, cardX + padding, yaoY - 30, cardWidth - padding * 2, 45, 6)
      ctx.fill()
    }

    // 爻位标签
    ctx.fillStyle = '#e5e5e5'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(labels[i], cardX + padding, yaoY)

    // 干支
    ctx.fillStyle = '#e5e5e5'
    ctx.fillText(origin?.ganzhi?.[index] || '', cardX + padding + 80, yaoY)

    // 六亲
    ctx.fillStyle = '#b3b3b3'
    ctx.fillText(origin?.relation?.[index] || '', cardX + padding + 180, yaoY)

    // 六神
    ctx.fillStyle = '#b3b3b3'
    ctx.fillText(gods[index] || '', cardX + padding + 280, yaoY)

    // 世应标记
    if (isShi) {
      ctx.fillStyle = '#DB2777'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText('世', cardX + padding + 400, yaoY)
    }
    if (isYing) {
      ctx.fillStyle = '#CA8A04'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText('应', cardX + padding + 450, yaoY)
    }

    // 动爻标记
    if (isMoving) {
      ctx.fillStyle = '#c75050'
      ctx.font = '18px sans-serif'
      ctx.fillText('动', cardX + padding + 550, yaoY)
    }

    yaoY += lineHeight
  }

  return y + 420
}

function drawAiCard(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 40
  const cardWidth = width - 80
  const padding = 30

  const ai = props.data?.ai

  // 卡片背景
  ctx.fillStyle = 'rgba(26, 26, 26, 0.95)'
  roundRect(ctx, cardX, y, cardWidth, 200, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 标题
  ctx.fillStyle = '#999'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('卦象解读', cardX + padding, y + 45)

  let aiY = y + 85

  // 直断
  if (ai?.zhiduan) {
    ctx.fillStyle = '#DB2777'
    ctx.font = 'bold 22px sans-serif'
    const zhiduan = ai.zhiduan.length > 50 ? ai.zhiduan.slice(0, 50) + '...' : ai.zhiduan
    wrapText(ctx, zhiduan, cardX + padding, aiY, cardWidth - padding * 2, 32)
    aiY += 70
  }

  // 吉凶判断
  if (ai?.jixiong) {
    ctx.fillStyle = '#b3b3b3'
    ctx.font = '20px sans-serif'
    const jixiong = ai.jixiong.length > 40 ? ai.jixiong.slice(0, 40) + '...' : ai.jixiong
    ctx.fillText(jixiong, cardX + padding, aiY)
  }

  return y + 200
}

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const y = height - 80

  // 分隔线
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, y - 20)
  ctx.lineTo(width - 40, y - 20)
  ctx.stroke()

  // 底部文字
  ctx.fillStyle = '#666'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知先生 · 六爻占卜', width / 2, y + 10)

  ctx.font = '18px sans-serif'
  ctx.fillText('传承千年智慧 · 解读人生玄机', width / 2, y + 40)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

function saveImage() {
  const canvas = canvasRef.value
  if (!canvas) return

  try {
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `六爻占卜_${Date.now()}.png`
    link.href = dataURL
    link.click()
  } catch (e) {
    console.error('保存图片失败', e)
  }
}
</script>

<style scoped>
.poster-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.poster-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.poster-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.poster-close {
  font-size: 28px;
  color: var(--text-tertiary);
  cursor: pointer;
  line-height: 1;
}

.poster-canvas-wrapper {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.poster-canvas-wrapper canvas {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.poster-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-save {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:active {
  opacity: 0.85;
  transform: translateY(1px);
}
</style>
