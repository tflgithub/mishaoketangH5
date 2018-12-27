// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'amfe-flexible'
import http from './utils/http'
import router from './router'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import common from './utils/common'
import './assets/scss/my-mint.scss'
Vue.use(MintUI)
Vue.config.productionTip = false

router.beforeEach(async (to, from, next) => {
  // 如果不是在微信中打开就不需要鉴权
  if (!common.isWeChatOpen()) {
    next();
    return
  }
  if (to.matched.some(recode => recode.meta.wechatAuth)) {
    if (localStorage.getItem('token')) {
      next()
      return
    }
    let code = common.getUrlParam('code')
    if (code != null) {
      let params = {'code': code, 'type': '2'}
      let res = await http.post('/apikt/wxa/v1/login/mpCode', params)
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token)
        next()
      } else {
        // 避免dead loop
        if(to.path=='/error'){
          next();
        } else {
          next('/error')
        }
      }
      return
    }
    let redirectUrl = window.location.href
    redirectUrl = encodeURIComponent(redirectUrl)
    console.log(redirectUrl)
    const appid = 'wx02432c565d387e80'
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
  } else {
    next();
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
