// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import './registerServiceWorker'
import { Button, Select, Input, Option } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.component('sk-select', Select)
Vue.component('sk-button', Button)
Vue.component('sk-input', Input)
Vue.component('sk-option', Option)

Vue.config.productionTip = false

/* eslint-disable no-new */

new Vue({
  render: h => h(App)
}).$mount('#app')
