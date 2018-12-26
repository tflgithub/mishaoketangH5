// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'amfe-flexible'
import http from './utils/http'
import router from './router'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import './assets/scss/my-mint.scss'
import vuescroll from 'vuescroll'
import 'vuescroll/dist/vuescroll.css'
Vue.use(vuescroll, {
  ops: {
    bar: {
      background: '#000',
      opacity: 0.6,
      size: '3px'
    },
    scrollPanel: {
      initialScrollY: false,
      initialScrollX: false,
      scrollingX: false,
      scrollingY: true,
      speed: 300,
      easing: undefined,
      verticalNativeBarPos: 'right'
    }
  }
})

Vue.use(MintUI)
Vue.config.productionTip = false

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(recode => recode.meta.wechatAuth)) {
    if (localStorage.getItem('token')) {
      next()
      return
    }
    let code = getQueryString('code')
    if (code != null) {
      let params = {'code': code, 'type': '2'}
      let res = await http.post('/apikt/wxa/v1/login/mpCode', params)
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token)
        next()
      } else {
        next('/error')
      }
      return
    }
    let redirectUrl = window.location.href
    redirectUrl = encodeURIComponent(redirectUrl)
    console.log(redirectUrl)
    const appid = 'wx02432c565d387e80'
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
  } else { next() }
})

function getQueryString (name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let r = window.location.search.substr(1).match(reg)// search,查询？后面的参数，并匹配正则
  if (r != null) return unescape(r[2]); return null
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
