<template>
  <van-popup v-model:show="visible" position="center" :style="{ background: 'transparent' }">
    <div class="poster-container">
      <canvas ref="canvasRef" width="750" height="1800"></canvas>
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
  name: string
  strokeDetail: { char: string; strokes: number }[]
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
  if (!canvas || !props.data) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#4A148C')
  gradient.addColorStop(0.5, '#7B1FA2')
  gradient.addColorStop(1, '#9C27B0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 绘制装饰纹理
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 15; i++) {
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 80 + 40, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  let y = 100

  // 绘制标题
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 64px serif'
  ctx.textAlign = 'center'
  ctx.fillText('皇极天数', width / 2, y)
  y += 100

  // 绘制姓名笔画
  if (props.strokeDetail && props.strokeDetail.length > 0) {
    const charSpacing = 120
    const startX = (width - (props.strokeDetail.length - 1) * charSpacing) / 2

    props.strokeDetail.forEach((item, i) => {
      const x = startX + i * charSpacing

      // 字
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 52px serif'
      ctx.textAlign = 'center'
      ctx.fillText(item.char, x, y)

      // 笔画数
      ctx.fillStyle = '#E1BEE7'
      ctx.font = '26px sans-serif'
      ctx.fillText(item.strokes + '画', x, y + 45)
    })
    y += 100
  }

  // 绘制卦数
  ctx.fillStyle = '#E1BEE7'
  ctx.font = '32px sans-serif'
  ctx.fillText(`第${props.data.id}数`, width / 2, y)
  y += 70

  // 绘制先天卦和后天卦
  y = drawGuaPair(ctx, width, y)
  y += 60

  // 绘制五维解析
  y = drawDimensions(ctx, width, y)

  // 绘制底部装饰
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, height - 100)
  ctx.lineTo(width - 60, height - 100)
  ctx.stroke()

  // 绘制底部文字
  ctx.fillStyle = '#E1BEE7'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('易知 · 皇极天数', width / 2, height - 50)
}

function drawGuaPair(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const centerX = width / 2
  const guaWidth = 300
  const gap = 100
  const startY = y

  // 先天卦
  const xiantianX = centerX - guaWidth / 2 - gap / 2
  const xiantianEndY = drawSingleGua(ctx, xiantianX, startY, '先天', props.data.xiantianName, props.data.xiantianLines, '#DB2777')

  // 后天卦（使用相同的起始Y坐标）
  const houtianX = centerX + guaWidth / 2 + gap / 2
  const houtianEndY = drawSingleGua(ctx, houtianX, startY, '后天', props.data.houtianName, props.data.houtianLines, '#6495ED')

  // 箭头（放在两个卦的中间高度）
  const arrowY = startY + 100
  ctx.fillStyle = '#E1BEE7'
  ctx.font = '48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('→', centerX, arrowY)

  // 返回两个卦中较低的结束位置
  return Math.max(xiantianEndY, houtianEndY) + 30
}

function drawSingleGua(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  name: string,
  lines: number[],
  color: string
): number {
  const startY = y

  // 标签
  ctx.fillStyle = color
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, x, startY)
  y = startY + 45

  // 卦名
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px serif'
  ctx.fillText(name, x, y)
  y += 50

  // 卦象（六爻）
  if (lines && lines.length === 6) {
    const lineWidth = 80
    const lineHeight = 8
    const lineGap = 14

    for (let i = 0; i < 6; i++) {
      const lineY = y + i * (lineHeight + lineGap)

      if (lines[i] === 1) {
        // 阳爻 - 实线
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(x - lineWidth / 2, lineY, lineWidth, lineHeight)
      } else {
        // 阴爻 - 断线
        ctx.fillStyle = '#FFFFFF'
        const gapSize = 16
        ctx.fillRect(x - lineWidth / 2, lineY, (lineWidth - gapSize) / 2, lineHeight)
        ctx.fillRect(x + gapSize / 2, lineY, (lineWidth - gapSize) / 2, lineHeight)
      }
    }
    y += 6 * (lineHeight + lineGap) + 30
  }

  return y
}

function drawDimensions(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const leftMargin = 60
  const rightMargin = 60

  // 标题
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('五维解析', leftMargin, y)
  y += 55

  const dims = [
    { key: '道', data: props.data.data.道 },
    { key: '品', data: props.data.data.品 },
    { key: '义', data: props.data.data.义 },
    { key: '慧', data: props.data.data.慧 },
    { key: '财', data: props.data.data.财 },
  ]

  const wuxingColors: Record<string, string> = {
    '金': '#D4A843',
    '木': '#4CAF50',
    '水': '#42A5F5',
    '火': '#EF5350',
    '土': '#8D6E63',
  }

  dims.forEach(dim => {
    // 维度名称
    ctx.fillStyle = wuxingColors[dim.data.五行] || '#FFFFFF'
    ctx.font = 'bold 40px serif'
    ctx.textAlign = 'left'
    ctx.fillText(dim.key, leftMargin + 20, y)

    // 五行标签
    ctx.fillStyle = wuxingColors[dim.data.五行] || '#FFFFFF'
    ctx.font = '24px sans-serif'
    ctx.fillText(dim.data.五行, leftMargin + 90, y)

    // 正偏值
    const barX = leftMargin + 170
    const barY = y - 25
    const barWidth = width - leftMargin - rightMargin - 170 - 90
    const barHeight = 16

    // 正
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    const zhengWidth = dim.data.正 === 2 ? barWidth : dim.data.正 === 1 ? barWidth / 2 : 0
    ctx.fillStyle = '#E06060'
    ctx.fillRect(barX, barY, zhengWidth, barHeight)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'right'
    const zhengText = dim.data.正 === 2 ? '双' : dim.data.正 === 1 ? '有' : '无'
    ctx.fillText(`正: ${zhengText}`, width - rightMargin, barY + 13)

    // 偏
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(barX, barY + 26, barWidth, barHeight)

    const pianWidth = dim.data.偏 === 2 ? barWidth : dim.data.偏 === 1 ? barWidth / 2 : 0
    ctx.fillStyle = '#DB2777'
    ctx.fillRect(barX, barY + 26, pianWidth, barHeight)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'right'
    const pianText = dim.data.偏 === 2 ? '双' : dim.data.偏 === 1 ? '有' : '无'
    ctx.fillText(`偏: ${pianText}`, width - rightMargin, barY + 39)

    y += 70
  })

  return y
}

function download() {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `皇极天数-${props.name}.png`
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
  background: linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%);
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
