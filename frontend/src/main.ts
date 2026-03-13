import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'amfe-flexible'
import './styles/global.css'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
