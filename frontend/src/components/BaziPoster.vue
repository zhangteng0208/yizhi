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

interface BaziData {
  bazi?: {
    rawBaZi?: string
    siZhu?: {
      year: { tianGan: string; diZhi: string; wuXing: string; naYin: string }
      month: { tianGan: string; diZhi: string; wuXing: string; naYin: string }
      day: { tianGan: string; diZhi: string; wuXing: string; naYin: string }
      hour: { tianGan: string; diZhi: string; wuXing: string; naYin: string }
    }
    wuXingCount?: Record<string, number>
    wuXingLack?: string[]
    riZhu?: string
    riZhuWuXing?: string
    shenQiangRuo?: string
    geJu?: string
    yongShen?: string
    jiShen?: string
    lunarInfo?: {
      lunarYear: string
      lunarMonth: string
      lunarDay: string
      shengXiao: string
      xingZuo: string
    }
  }
  ai?: {
    score?: number
  }
}

interface UserParams {
  name?: string
  gender?: string
  birthday?: string
  hour?: string
  calendar?: string
}

const props = defineProps<{
  modelValue: boolean
  data: BaziData | null
  params: UserParams | null
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

  // 设置画布尺寸 (750x1334 适合手机屏幕)
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
  ctx.fillText('易知先生 · 八字详批', width / 2, y)
  y += 80

  // 用户信息卡片
  y = drawUserInfo(ctx, width, y)
  y += 40

  // 四柱排盘
  y = drawSiZhu(ctx, width, y)
  y += 40

  // 五行分析
  y = drawWuXing(ctx, width, y)
  y += 40

  // 命局核心
  y = drawCore(ctx, width, y)
  y += 60

  // 底部信息
  drawFooter(ctx, width, height)

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png')
}

function drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // 太极图案装饰
  ctx.save()
  ctx.globalAlpha = 0.05

  // 左上角
  drawTaiji(ctx, 100, 100, 80)

  // 右下角
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

function drawUserInfo(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 200

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 40

  // 姓名
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('姓名', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(props.params?.name || '—', cardX + cardWidth - 40, infoY)
  infoY += 40

  // 性别
  ctx.textAlign = 'left'
  ctx.fillText('性别', cardX + 40, infoY)
  ctx.textAlign = 'right'
  ctx.fillText(props.params?.gender || '—', cardX + cardWidth - 40, infoY)
  infoY += 40

  // 出生
  ctx.textAlign = 'left'
  ctx.fillText('出生', cardX + 40, infoY)
  ctx.textAlign = 'right'
  const cal = props.params?.calendar === '农历' ? '农历' : '公历'
  const birthday = props.params?.birthday || '—'
  const hour = props.params?.hour || '—'
  const birth = `${birthday} ${hour}时（${cal}）`
  ctx.font = '24px sans-serif'
  ctx.fillText(birth, cardX + cardWidth - 40, infoY)
  infoY += 40

  // 八字
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('八字', cardX + 40, infoY)
  ctx.textAlign = 'right'

  // 八字渐变色
  const gradient = ctx.createLinearGradient(cardX + cardWidth - 300, infoY, cardX + cardWidth - 40, infoY)
  gradient.addColorStop(0, '#DB2777')
  gradient.addColorStop(1, '#CA8A04')
  ctx.fillStyle = gradient
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(props.data?.bazi?.rawBaZi || '—', cardX + cardWidth - 40, infoY)

  return y + cardHeight
}

function drawSiZhu(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('四柱排盘', cardX, y)
  y += 50

  if (!props.data?.bazi?.siZhu) return y

  const pillars = [
    { label: '年柱', ...props.data.bazi.siZhu.year },
    { label: '月柱', ...props.data.bazi.siZhu.month },
    { label: '日柱', ...props.data.bazi.siZhu.day },
    { label: '时柱', ...props.data.bazi.siZhu.hour },
  ]

  const colWidth = (cardWidth - 30) / 4
  const colHeight = 240

  pillars.forEach((pillar, i) => {
    const x = cardX + i * (colWidth + 10)

    // 柱子背景
    ctx.fillStyle = i === 2 ? 'rgba(219, 39, 119, 0.15)' : 'rgba(255, 255, 255, 0.08)'
    roundRect(ctx, x, y, colWidth, colHeight, 12)
    ctx.fill()

    // 柱子边框
    ctx.strokeStyle = i === 2 ? 'rgba(219, 39, 119, 0.5)' : 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = i === 2 ? 3 : 1.5
    ctx.stroke()

    // 标签
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(pillar.label, x + colWidth / 2, y + 30)

    // 天干地支
    ctx.font = 'bold 48px sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(pillar.tianGan, x + colWidth / 2, y + 100)
    ctx.fillText(pillar.diZhi, x + colWidth / 2, y + 160)

    // 五行
    ctx.font = '18px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText(pillar.wuXing, x + colWidth / 2, y + 190)

    // 纳音
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText(pillar.naYin, x + colWidth / 2, y + 220)
  })

  return y + colHeight
}

function drawWuXing(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('五行分析', cardX, y)
  y += 50

  if (!props.data?.bazi?.wuXingCount) return y

  const wuxingData = [
    { label: '金', count: props.data.bazi.wuXingCount['金'] || 0, color: '#d4a843' },
    { label: '木', count: props.data.bazi.wuXingCount['木'] || 0, color: '#5b9a5b' },
    { label: '水', count: props.data.bazi.wuXingCount['水'] || 0, color: '#4a8db7' },
    { label: '火', count: props.data.bazi.wuXingCount['火'] || 0, color: '#c75050' },
    { label: '土', count: props.data.bazi.wuXingCount['土'] || 0, color: '#8b6b4a' },
  ]

  const colWidth = (cardWidth - 40) / 5
  const colHeight = 180

  wuxingData.forEach((wx, i) => {
    const x = cardX + i * (colWidth + 10)

    // 背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    roundRect(ctx, x, y, colWidth, colHeight, 12)
    ctx.fill()

    // 边框
    ctx.strokeStyle = wx.count === 0 ? 'rgba(255, 255, 255, 0.1)' : wx.color
    ctx.lineWidth = 2
    ctx.setLineDash(wx.count === 0 ? [5, 5] : [])
    ctx.stroke()
    ctx.setLineDash([])

    // 五行名称
    ctx.fillStyle = wx.color
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(wx.label, x + colWidth / 2, y + 45)

    // 数量
    ctx.font = 'bold 56px sans-serif'
    ctx.fillStyle = wx.count === 0 ? 'rgba(255, 255, 255, 0.3)' : wx.color
    ctx.fillText(String(wx.count), x + colWidth / 2, y + 120)

    // 状态标签
    let status = ''
    if (wx.count === 0) status = '缺'
    else if (wx.count >= 3) status = '旺'
    else if (wx.count === 1) status = '弱'

    if (status) {
      ctx.font = '18px sans-serif'
      ctx.fillStyle = wx.count === 0 ? '#c75050' : wx.count >= 3 ? '#d4a843' : '#4a8db7'
      ctx.fillText(status, x + colWidth / 2, y + 155)
    }
  })

  return y + colHeight
}

function drawCore(ctx: CanvasRenderingContext2D, width: number, y: number): number {
  const cardX = 60
  const cardWidth = width - 120
  const cardHeight = 180

  // 卡片背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundRect(ctx, cardX, y, cardWidth, cardHeight, 16)
  ctx.fill()

  // 卡片边框
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  let infoY = y + 50

  // 日主
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('日主', cardX + 40, infoY)

  const gradient1 = ctx.createLinearGradient(cardX + 200, infoY, cardX + 400, infoY)
  gradient1.addColorStop(0, '#DB2777')
  gradient1.addColorStop(1, '#CA8A04')
  ctx.fillStyle = gradient1
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(`${props.data?.bazi?.riZhu}（${props.data?.bazi?.riZhuWuXing}）`, cardX + 200, infoY)

  // 身强弱标签
  const badge = props.data?.bazi?.shenQiangRuo || ''
  ctx.fillStyle = badge === '身强' ? '#d4a843' : '#4a8db7'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(badge, cardX + cardWidth - 40, infoY)
  infoY += 50

  // 格局
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('格局', cardX + 40, infoY)
  ctx.fillText(props.data?.bazi?.geJu || '—', cardX + 200, infoY)
  infoY += 50

  // 用神 / 忌神
  ctx.fillText('用神', cardX + 40, infoY)
  ctx.fillStyle = '#CA8A04'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(props.data?.bazi?.yongShen || '—', cardX + 200, infoY)

  ctx.fillStyle = '#ffffff'
  ctx.font = '28px sans-serif'
  ctx.fillText('/', cardX + 320, infoY)

  ctx.fillText('忌神', cardX + 360, infoY)
  ctx.fillStyle = '#c75050'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(props.data?.bazi?.jiShen || '—', cardX + 480, infoY)

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
    gradient.addColorStop(0, '#DB2777')
    gradient.addColorStop(1, '#CA8A04')
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

  // 创建下载链接
  const link = document.createElement('a')
  link.download = `易知先生-八字详批-${props.params?.name || '结果'}.png`
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
