import Vue from 'vue'
import Router from 'vue-router'
import IosPay from '../components/IosPay'
import Error from '../components/error'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/h5',
  routes: [
    {
      path: '/',
      name: 'IosPay',
      component: IosPay,
      meta: {
        wechatAuth: true // 如果此路由需要微信授权请设置为true,默认为false
      }
    }, {
      path: '/error',
      name: 'Error',
      component: Error
    }
  ]
})
