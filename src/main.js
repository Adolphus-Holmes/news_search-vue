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
Vue.use(VueXss)
Vue.use(VueCookies)
Vue.prototype.$qs = qs
Vue.use(VueAxios, axios)
axios.defaults.withCredentials=true;
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
Vue.prototype.$scrollTo = (x = 0, y = 0, type = 'smooth') => {
	window.scrollTo({
		top: x,
		left: y,
		behavior: type // 滚动行为：smooth平滑滚动，instant瞬间滚动，默认值auto，等同于instant
	})
}