import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import ConvertFileFormat from './pages/ConvertFileFormat.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './index.css'

library.add(faArrowLeft, faTrash)

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/convert', component: ConvertFileFormat }
]

const router = createRouter({ history: createWebHashHistory(), routes })

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(router).mount('#app')
