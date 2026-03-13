<template>
  <div class="page">
    <!-- Header with Vant NavBar -->
    <van-nav-bar
      :title="categoryName"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <!-- Product cards -->
    <div class="products">
      <div
        v-for="item in products"
        :key="item.code"
        class="product-card"
        @click="navigateTo(item.code)"
      >
        <div class="product-icon">
          <span class="icon-text">{{ item.name.substring(0, 2) }}</span>
        </div>
        <div class="product-info">
          <p class="product-desc">{{ item.desc }}</p>
          <div class="product-tags" v-if="item.tags">
            <span v-for="t in item.tags" :key="t" class="tag">{{ t }}</span>
          </div>
          <p class="product-detail" v-if="item.detail">{{ item.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const routeMap: Record<string, string> = {
  meihua: '/meihua',
  ziwei: '/ziwei',
  qimen: '/qimen',
  liuyao: '/liuyao',
  yijing: '/yijing',
  xiaoliuren: '/xiaoliuren',
  xunwu: '/xunwu',
  zeji: '/zeji',
  naming: '/naming',
  hehun: '/hehun',
  shengyi: '/shengyi',
  huangji: '/huangji',
  face: '/face',
  palm: '/palm',
  tongue: '/tongue',
  fengshui: '/fengshui',
  dream: '/dream',
  chouqian: '/chouqian',
}

function navigateTo(code: string) {
  const path = routeMap[code] || `/divination/${code}`
  router.push(path)
}

const categoryMap: Record<string, { name: string; products: any[] }> = {
  suan: {
    name: '算',
    products: [
      { code: 'bazi', name: '八字精批', desc: '详批一生运势', price: 68, tags: ['年月日时', '五行生克', '十神关系'], detail: '以天干地支推演一生格局，侧重整体命运轨迹' },
      { code: 'ziwei', name: '紫微斗数', desc: '星盘命宫详解', price: 88, tags: ['十二宫位', '星曜庙陷', '宫位轴线'], detail: '排布十二宫位与星曜组合，侧重各领域细致分析' },
      { code: 'qimen', name: '奇门遁甲', desc: '时空能量预测', price: 98, tags: ['九宫八卦', '天地人神', '时空能量'], detail: '融合四盘信息判断吉凶，侧重事件决策与趋吉避凶' },
      { code: 'meihua', name: '梅花易数', desc: '姓名起卦·周易六十四卦', price: 0, tags: ['随机起卦', '六十四卦', '即时占断'], detail: '以数字或姓名随机起卦，快速得出卦象与吉凶判断' },
    ],
  },
  wen: {
    name: '问',
    products: [
      { code: 'liuyao', name: '六爻占卜', desc: '一事一占', price: 0, tags: ['铜钱摇卦', '六亲五行', '动爻变卦'], detail: '模拟铜钱摇卦，通过动爻变化精准分析具体事件走向' },
      { code: 'yijing', name: '易经占卜', desc: '古法筮占', price: 48, tags: ['蓍草筮法', '卦辞爻辞', '义理象数'], detail: '遵循古法筮占流程，结合卦辞爻辞深度解读人生疑惑' },
      { code: 'xiaoliuren', name: '六壬', desc: '掐指速算吉凶', price: 0, tags: ['大安留连', '速喜赤口', '掐指一算'], detail: '以月日时对应六神，三指速断吉凶，适合日常快速占问' },
      { code: 'huangji', name: '皇极天数', desc: '姓名数理卦象', price: 0, tags: ['康熙笔画', '先后天卦', '道品义慧财'], detail: '以姓名康熙笔画推演先后天卦象，解析道品义慧财五维命理' },
      { code: 'chouqian', name: '灵签占验', desc: '百支签诗·随机抽取', price: 0, tags: ['签诗占断', '典故解读', '吉凶指示'], detail: '虔诚默念所求之事，摇动签筒随机抽取一支，解读签诗吉凶与指导' },
      { code: 'dream', name: '周公解梦', desc: '梦境解析·吉凶预测', price: 0, tags: ['梦境解读', '吉凶分析', '关键词匹配'], detail: '输入梦境内容，匹配周公解梦词典，解析梦境中的元素代表的意义与吉凶预兆' },
    ],
  },
  xiang: {
    name: '相',
    products: [
      { code: 'face', name: '面相分析', desc: 'AI 面相解读', price: 18, tags: ['五官格局', '三停比例', 'AI识别'], detail: '通过面部五官与轮廓特征，AI解读性格与运势倾向' },
      { code: 'palm', name: '手相解读', desc: '掌纹命理', price: 18, tags: ['三大主线', '掌丘纹路', '左右对比'], detail: '分析生命线、智慧线、感情线等掌纹，解读先天与后天运势' },
      { code: 'tongue', name: '舌相分析', desc: 'AI 舌诊健康', price: 18, tags: ['舌苔厚薄', '舌质颜色', '健康分析'], detail: '上传舌头照片，AI分析舌苔、舌质等特征，提供健康状况评估与养生建议' },
      { code: 'fengshui', name: '风水布局', desc: '居家风水指南', price: 58, tags: ['方位吉凶', '五行调和', '居家布局'], detail: '根据户型朝向与个人命理，提供居家风水优化建议' },
    ],
  },
  xun: {
    name: '寻',
    products: [
      { code: 'xunwu', name: '寻人寻物', desc: '小六壬寻找指引', price: 0, tags: ['方位指引', '时间预测', '六神断卦'], detail: '基于小六壬起卦，提供方位指引和时间预测，帮助寻找失物或失联之人' },
      { code: 'zeji', name: '择日择吉', desc: '选定良辰吉日', price: 28, tags: ['黄道吉日', '十二建星', '宜忌查询'], detail: '综合天干地支与神煞，为婚嫁搬迁等大事选定吉日' },
      { code: 'naming', name: '起名改名', desc: '五行取名', price: 128, tags: ['五行补缺', '音形义', '三才五格'], detail: '根据八字五行喜忌，兼顾音韵字义，定制吉祥好名' },
      { code: 'hehun', name: '合婚配对', desc: '姻缘匹配分析', price: 58, tags: ['八字合婚', '属相配对', '五行互补'], detail: '对比双方八字与属相，分析姻缘契合度与相处建议' },
      { code: 'shengyi', name: '生意合伙', desc: '事业合作分析', price: 58, tags: ['八字合盘', '易经起卦', '行业匹配'], detail: '基于双方八字与行业选择，通过易经起卦分析合作成功率与互补优势' },
    ],
  },
}

const categoryName = computed(() => categoryMap[route.params.type as string]?.name || '')
const products = computed(() => categoryMap[route.params.type as string]?.products || [])
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 32px;
}

/* Products Grid */
.products {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Product Card - Same as Home sections */
.product-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:active::before {
  left: 100%;
}

.product-card:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.15);
}

/* Product Icon */
.product-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(219, 39, 119, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%);
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(219, 39, 119, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.icon-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #DB2777 0%, #CA8A04 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(219, 39, 119, 0.3));
  line-height: 1;
  font-family: 'Noto Serif SC', serif;
}

.product-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(219, 39, 119, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease-out;
}

.product-card:active .product-icon::before {
  opacity: 1;
}

/* Product Info */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.product-desc {
  font-size: 13px;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  line-height: 1.5;
  font-weight: 500;
}

/* Tags */
.product-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.tag {
  padding: 3px 10px;
  background: rgba(219, 39, 119, 0.1);
  border: 1px solid rgba(219, 39, 119, 0.2);
  border-radius: 6px;
  font-size: 10px;
  color: #DB2777;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Product Detail */
.product-detail {
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.6;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

/* Responsive */
@media (min-width: 768px) {
  .page {
    padding: 0 32px 48px;
  }

  .products {
    gap: 16px;
  }

  .product-card {
    padding: 24px;
  }

  .product-icon {
    width: 64px;
    height: 64px;
  }

  .icon-text {
    font-size: 24px;
  }

  .product-desc {
    font-size: 14px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-card::before,
  .product-icon::before {
    transition: none;
  }

  .product-card:active {
    transform: none;
  }
}
</style>
