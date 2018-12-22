// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'amfe-flexible'
import router from './router'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import './assets/scss/my-mint.scss'
import wechatPlugin from 'vue-wechat-plugin'
import axios from 'axios'
Vue.use(MintUI)
Vue.config.productionTip = false
// 微信授权插件初始化
Vue.use(wechatPlugin, {
  router, // 路由实例对象
  appid: 'wx02432c565d387e80', // 您的微信appid
  responseType: 'code', // 返回类型，请填写code
  scope: 'snsapi_userinfo', // 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
  redirectUri: location.href.split('#')[0], // 微信回调地址
  getCodeCallback (next, code) {
    let params = {'code': code, 'type': '2'}
    axios({
      method: 'post',
      baseURL: this.HOST,
      url: '/apikt/wxa/v1/login/mpCode',
      data: params,
      timeout: 5000,
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=UTF-8'
      }}).then((res) => {
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token)
        next('', code)
      } else {
        next('/error')
      }
    }).catch(() => {
      next('/error')
    })
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
