import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import ConvertFileFormat from './pages/ConvertFileFormat.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faTrash, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './index.css'
import CreateGlossary from './pages/CreateGlossary.vue'
import MachineTranslate from './pages/MachineTranslate.vue'

library.add(faArrowLeft, faTrash, faGear)

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/convert', component: ConvertFileFormat },
  { path: '/glossary', component: CreateGlossary },
  { path: '/translate', component: MachineTranslate }
]

const router = createRouter({ history: createWebHashHistory(), routes })

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(router).mount('#app')
