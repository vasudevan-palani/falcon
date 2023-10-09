import { createApp } from 'vue'
import "./style.css"

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import './samples/node-api'

import {createRouter, createWebHistory} from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import VueComponents from './components/VueComponents.vue'
import Inputs from './components/forms/Inputs.vue'
import Aws from './components/settings/Aws.vue'
import Home from './components/Home.vue'

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/home',
    component: Home,
  }
];


const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})


const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

