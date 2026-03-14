<template>
  <van-popup v-model:show="visible" position="center" :style="{ background: 'transparent' }">
    <div class="poster-container">
      <canvas ref="canvasRef" width="750" height="1600"></canvas>
      <div class="poster-actions">
        <button class="btn-download" @click="download">保存图片</button>
        <button class="btn-close" @click="visible = false">关闭</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  data: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const canvasRef = ref<HTMLCanvasElement>()

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => drawPoster())
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function drawPoster() {
  const canvas = canvasRef.value
  if (!canvas || !props.data?.sign) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#8B0000')
  gradient.addColorStop(0.5, '#B8860B')
  gradient.addColorStop(1, '#DAA520')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 绘制装饰纹理
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 100 + 50, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  let y = 80

  // 绘制标题
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 48px serif'
  ctx.textAlign = 'center'
  ctx.fillText('灵签占验', width / 2, y)
  y += 80

  // 绘制签号
  const sign = props.data.sign
  ctx.fillStyle = '#FFF8DC'
  ctx.font = '32px serif'
  ctx.fillText(sign.sign_number, width / 2, y)
  y += 60

  // 绘制签名
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 40px serif'
  ctx.fillText(sign.title, width / 2, y)
  y += 60

  // 绘制吉凶
  const fortuneColor = getFortuneColor(sign.fortune)
  ctx.fillStyle = fortuneColor
  ctx.font = 'bold 36px serif'
  ctx.fillText(sign.fortune, width / 2, y)
  y += 80

  // 绘制签诗
  y = drawSection(ctx, width, y, '签诗', sign.poem)
  y += 40

  // 绘制典故
  y = drawSection(ctx, width, y, '典故', sign.story)
  y += 40

  // 绘制解读
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('解读', 60, y)
  y += 50

  // 诗意
  ctx.fillStyle = '#FFF8DC'
  ctx.font = '22px sans-serif'
  ctx.fillText('诗意：', 80, y)
  y += 40
  y = wrapText(ctx, sign.interpretation, 100, y, width - 140, 32, '#FFFFFF', '20px sans-serif')
  y += 30

  // 含义
  ctx.fillStyle = '#FFF8DC'
  ctx.font = '22px sans-serif'
  ctx.fillText('含义：', 80, y)
  y += 40
  y = wrapText(ctx, sign.meaning, 100, y, width - 140, 32, '#FFFFFF', '20px sans-serif')
  y += 30

  // 指引
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('指引：', 80, y)
  y += 40
  y = wrapText(ctx, sign.advice, 100, y, width - 140, 32, '#FFD700', 'bold 20px sans-serif')

  // 绘制底部装饰
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, height - 80)
  ctx.lineTo(width - 60, height - 80)
  ctx.stroke()

  // 绘制底部文字
  ctx.fillStyle = '#FFF8DC'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知 · 灵签占验', width / 2, height - 40)
}

function drawSection(ctx: CanvasRenderingContext2D, width: number, y: number, title: string, content: string): number {
  // 标题
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(title, 60, y)
  y += 50

  // 内容
  if (title === '签诗') {
    // 签诗按句分行
    const lines = content.split('。').filter(line => line.trim())
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '24px serif'
    ctx.textAlign = 'center'
    lines.forEach(line => {
      ctx.fillText(line.trim() + '。', width / 2, y)
      y += 45
    })
  } else {
    // 其他内容自动换行
    y = wrapText(ctx, content, 80, y, width - 120, 32, '#FFFFFF', '20px sans-serif')
  }

  return y
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color: string,
  font: string
): number {
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = 'left'

  const words = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  if (line.length > 0) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
}

function getFortuneColor(fortune: string): string {
  if (fortune.includes('大吉') || fortune.includes('上上')) return '#FFD700'
  if (fortune.includes('吉')) return '#90EE90'
  if (fortune.includes('凶')) return '#FF6B6B'
  return '#FFF8DC'
}

function download() {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `灵签占验-${props.data.sign.sign_number}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
}

canvas {
  max-width: 90vw;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.poster-actions {
  display: flex;
  gap: 12px;
}

.btn-download,
.btn-close {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download {
  background: linear-gradient(135deg, #8B0000 0%, #DAA520 100%);
  color: #fff;
}

.btn-download:active {
  opacity: 0.85;
  transform: translateY(1px);
}

.btn-close {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.btn-close:active {
  background: rgba(255, 255, 255, 0.1);
}
</style>
