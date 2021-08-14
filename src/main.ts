import { createApp } from 'vue'
import "ant-design-vue/dist/antd.css"
import antv from 'ant-design-vue'
import 'moment/dist/locale/zh-cn'
import App from './App.vue'

createApp(App).use(antv).mount('#app')
