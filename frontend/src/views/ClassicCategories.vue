<template>
  <div class="categories-page">
    <van-nav-bar
      title="国学经典"
      fixed
      placeholder
    />

    <div class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        @click="handleCategoryClick(category)"
      >
        <div class="category-icon" :class="{ 'category-icon-dao': category.id === 'dao', 'category-icon-fo': category.id === 'fo', 'category-icon-ru': category.id === 'ru', 'category-icon-yijing': category.id === 'yijing', 'category-icon-yi': category.id === 'yi', 'category-icon-shishi': category.id === 'shishi', 'category-icon-zi': category.id === 'zi', 'category-icon-ji': category.id === 'ji', 'category-icon-shi': category.id === 'shi', 'category-icon-yishu': category.id === 'yishu' }" :style="{
          background: `linear-gradient(135deg, rgba(${categoryColors[category.id].rgba}, 0.15) 0%, rgba(${categoryColors[category.id].rgba}, 0.08) 100%)`,
          boxShadow: `inset 0 1px 3px rgba(${categoryColors[category.id].rgba}, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2)`
        }">
          <img v-if="category.id === 'dao'" src="/images/dao-icon.png" alt="道藏" class="category-image" />
          <img v-else-if="category.id === 'fo'" src="/images/fo-icon.png" alt="佛藏" class="category-image" />
          <img v-else-if="category.id === 'ru'" src="/images/ru-icon.png" alt="儒藏" class="category-image" />
          <img v-else-if="category.id === 'yijing'" src="/images/yijing-icon.png" alt="易藏" class="category-image" />
          <img v-else-if="category.id === 'yi'" src="/images/yi-icon.png" alt="医藏" class="category-image" />
          <img v-else-if="category.id === 'shishi'" src="/images/shishi-icon.png" alt="史藏" class="category-image" />
          <img v-else-if="category.id === 'zi'" src="/images/zi-icon.png" alt="子藏" class="category-image" />
          <img v-else-if="category.id === 'ji'" src="/images/ji-icon.png" alt="集藏" class="category-image" />
          <img v-else-if="category.id === 'shi'" src="/images/shi-icon.png" alt="诗藏" class="category-image" />
          <img v-else-if="category.id === 'yishu'" src="/images/yishu-icon.png" alt="艺藏" class="category-image" />
          <span v-else class="category-char" :style="{
            color: categoryColors[category.id].light,
            filter: `drop-shadow(0 2px 4px rgba(${categoryColors[category.id].rgba}, 0.3))`
          }">{{ category.char }}</span>
        </div>
        <div class="category-info">
          <h3 class="category-title" :style="{
            color: categoryColors[category.id].light
          }">{{ category.title }}</h3>
          <p class="category-desc">{{ category.desc }}</p>
          <div class="category-count">{{ category.count }} 部经典</div>
        </div>
      </div>
    </div>

    <TabBar v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const activeTab = ref('classics')

// 每个分类的主题色配置
const categoryColors: Record<string, { light: string; dark: string; rgba: string }> = {
  dao: { light: '#0891B2', dark: '#0E7490', rgba: '8, 145, 178' }, // 青色 - 道家清静
  fo: { light: '#F59E0B', dark: '#D97706', rgba: '245, 158, 11' }, // 金色 - 佛教庄严
  ru: { light: '#FFFFFF', dark: '#E5E5E5', rgba: '255, 255, 255' }, // 白色 - 儒家纯正
  ji: { light: '#9333EA', dark: '#6B21A8', rgba: '147, 51, 234' }, // 紫色 - 文集典雅
  shi: { light: '#EC4899', dark: '#BE185D', rgba: '236, 72, 153' }, // 粉色 - 诗词浪漫
  shishi: { light: '#8B5A3C', dark: '#654321', rgba: '139, 90, 60' }, // 棕色 - 史书厚重
  yi: { light: '#10B981', dark: '#059669', rgba: '16, 185, 129' }, // 绿色 - 医学生机
  yishu: { light: '#8B5C2E', dark: '#654321', rgba: '139, 92, 46' }, // 褐色 - 艺术古朴
  yijing: { light: '#6366F1', dark: '#4338CA', rgba: '99, 102, 241' }, // 靛蓝 - 易学玄妙
  zi: { light: '#EF4444', dark: '#B91C1C', rgba: '239, 68, 68' } // 橙红 - 诸子百家
}

const categories = [
  {
    id: 'ru',
    title: '儒藏',
    desc: '儒家经典，修齐治平，仁义礼智',
    count: 912,
    char: '儒'
  },
  {
    id: 'fo',
    title: '佛藏',
    desc: '佛教经典，明心见性，慈悲智慧',
    count: 5135,
    char: '佛'
  },
  {
    id: 'dao',
    title: '道藏',
    desc: '道家经典，修身养性，天人合一',
    count: 1677,
    char: '道'
  },
  {
    id: 'yijing',
    title: '易藏',
    desc: '易学经典，阴阳变化，占卜预测',
    count: 343,
    char: '易'
  },
  {
    id: 'yi',
    title: '医藏',
    desc: '医学经典，岐黄之术，济世救人',
    count: 911,
    char: '医'
  },
  {
    id: 'shishi',
    title: '史藏',
    desc: '史书典籍，鉴古知今，以史为镜',
    count: 2044,
    char: '史'
  },
  {
    id: 'zi',
    title: '子藏',
    desc: '诸子百家，兵法谋略，百家争鸣',
    count: 1465,
    char: '子'
  },
  {
    id: 'ji',
    title: '集藏',
    desc: '诗文集萃，文章典范，辞章之美',
    count: 1949,
    char: '集'
  },
  {
    id: 'shi',
    title: '诗藏',
    desc: '诗词歌赋，韵律之美，情感抒发',
    count: 778,
    char: '诗'
  },
  {
    id: 'yishu',
    title: '艺藏',
    desc: '艺术典籍，琴棋书画，技艺精湛',
    count: 447,
    char: '艺'
  }
]

function handleCategoryClick(category: any) {
  if (category.count === 0) {
    showToast('该藏经典正在整理中，敬请期待')
  } else {
    router.push(`/classics/category/${category.id}`)
  }
}
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 20px 80px;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.category-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
  border-radius: 16px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:active::before {
  left: 100%;
}

.category-card:active {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(24, 24, 24, 0.98) 100%);
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(219, 39, 119, 0.2);
}

.category-icon {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.category-icon-dao {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-fo {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-ru {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-yijing {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-yi {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-shishi {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-zi {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-ji {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-shi {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-icon-yishu {
  width: 50px;
  height: 88px;
  border-radius: 8px;
}

.category-char {
  font-size: 40px;
  font-weight: 500;
  font-family: 'Noto Serif SC', serif;
  transition: transform 0.25s ease-out;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
  transition: transform 0.25s ease-out;
}

.category-card:active .category-char {
  transform: scale(1.1);
}

.category-card:active .category-image {
  transform: scale(1.1);
}

.category-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(219, 39, 119, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease-out;
}

.category-card:active .category-icon::before {
  opacity: 1;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.category-title {
  font-size: 22px;
  font-weight: 600;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 2px;
  line-height: 1.3;
}

.category-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  font-family: 'Noto Serif SC', serif;
}

.category-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  letter-spacing: 0.3px;
  font-weight: 500;
}
@media (min-width: 768px) {
  .categories-page {
    padding: 0 32px 80px;
  }

  .categories-grid {
    gap: 20px;
  }

  .category-card {
    padding: 28px;
  }

  .category-icon {
    width: 100px;
    height: 100px;
  }

  .category-char {
    font-size: 44px;
  }

  .category-title {
    font-size: 24px;
  }

  .category-desc {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-card,
  .category-card::before,
  .category-icon::before,
  .category-char {
    transition: none;
  }

  .category-card:active,
  .category-card:active .category-char {
    transform: none;
  }
}
</style>
