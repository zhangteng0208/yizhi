import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/category/:type',
      name: 'Category',
      component: () => import('../views/Category.vue'),
    },
    {
      path: '/meihua',
      name: 'Meihua',
      component: () => import('../views/Meihua.vue'),
    },
    {
      path: '/ziwei',
      name: 'Ziwei',
      component: () => import('../views/Ziwei.vue'),
    },
    {
      path: '/qimen',
      name: 'Qimen',
      component: () => import('../views/Qimen.vue'),
    },
    {
      path: '/liuyao',
      name: 'Liuyao',
      component: () => import('../views/Liuyao.vue'),
    },
    {
      path: '/yijing',
      name: 'Yijing',
      component: () => import('../views/Yijing.vue'),
    },
    {
      path: '/xiaoliuren',
      name: 'Xiaoliuren',
      component: () => import('../views/Xiaoliuren.vue'),
    },
    {
      path: '/xunwu',
      name: 'Xunwu',
      component: () => import('../views/Xunwu.vue'),
    },
    {
      path: '/zeji',
      name: 'Zeji',
      component: () => import('../views/Zeji.vue'),
    },
    {
      path: '/naming',
      name: 'Naming',
      component: () => import('../views/Naming.vue'),
    },
    {
      path: '/hehun',
      name: 'Hehun',
      component: () => import('../views/Hehun.vue'),
    },
    {
      path: '/shengyi',
      name: 'Shengyi',
      component: () => import('../views/Shengyi.vue'),
    },
    {
      path: '/face',
      name: 'Face',
      component: () => import('../views/Face.vue'),
    },
    {
      path: '/palm',
      name: 'Palm',
      component: () => import('../views/Palm.vue'),
    },
    {
      path: '/tongue',
      name: 'Tongue',
      component: () => import('../views/Tongue.vue'),
    },
    {
      path: '/fengshui',
      name: 'Fengshui',
      component: () => import('../views/Fengshui.vue'),
    },
    {
      path: '/huangji',
      name: 'Huangji',
      component: () => import('../views/Huangji.vue'),
    },
    {
      path: '/dream',
      name: 'Dream',
      component: () => import('../views/Dream.vue'),
    },
    {
      path: '/chouqian',
      name: 'Chouchou',
      component: () => import('../views/Chouchou.vue'),
    },
    {
      path: '/almanac',
      name: 'Almanac',
      component: () => import('../views/Almanac.vue'),
    },
    {
      path: '/weather',
      name: 'Weather',
      component: () => import('../views/Weather.vue'),
    },
    {
      path: '/classics',
      name: 'ClassicCategories',
      component: () => import('../views/ClassicCategories.vue'),
    },
    {
      path: '/classics/category/:categoryId',
      name: 'Classics',
      component: () => import('../views/Classics.vue'),
    },
    {
      path: '/classics/:id(.*)',
      name: 'ClassicDetail',
      component: () => import('../views/ClassicDetail.vue'),
    },
    {
      path: '/classics/:id(.*)/chapter/:chapterId',
      name: 'ChapterReader',
      component: () => import('../views/ChapterReader.vue'),
    },
    {
      path: '/daozang',
      name: 'DaozangList',
      component: () => import('../views/DaozangList.vue'),
    },
    {
      path: '/daozang/:bookId',
      name: 'DaozangReader',
      component: () => import('../views/DaozangReader.vue'),
    },
    {
      path: '/divination/:code',
      name: 'Divination',
      component: () => import('../views/Divination.vue'),
    },
    {
      path: '/result/:id',
      name: 'Result',
      component: () => import('../views/Result.vue'),
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/History.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
    },
    {
      path: '/profile/edit/:id',
      name: 'ProfileEdit',
      component: () => import('../views/ProfileEdit.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  // 登录和注册页面直接放行
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  const userStore = useUserStore()

  // 检查token是否存在且有效
  if (!userStore.token || !userStore.isTokenValid()) {
    // token不存在或已过期，清理并跳转登录
    if (userStore.token) {
      userStore.logout()
    }
    next('/login')
  } else {
    next()
  }
})

export default router
