import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import qs from 'qs';
import VueCookies from 'vue-cookies'
import VueXss from 'vue-xss'
import global from '@/static/script/global'
Vue.use(global)
Vue.use(VueXss)
Vue.use(VueCookies)
Vue.prototype.$qs = qs
Vue.use(VueAxios, axios)
axios.defaults.withCredentials=true;
Vue.config.productionTip = false
var vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
export default vue