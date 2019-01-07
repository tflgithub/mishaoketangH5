import wx from 'weixin-js-sdk'
import http from './http'
function wxRegister (callback) {
  let reqUrl = location.href.split('#')[0]
  http.post('/apikt/wxa/v1/tools/jsSDKWX',{url: reqUrl}).then((res) => {
    wx.config({
      debug: false, // 开启调试模式
      appId: res.data.data.appId, // 必填，公众号的唯一标识
      timestamp: res.data.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: res.data.data.nonceStr, // 必填，生成签名的随机串
      signature: res.data.data.signature, // 必填，签名，见附录1
      jsApiList: res.data.data.jsApiList
    })
  })
  wx.ready((res) => {
    // 如果需要定制ready回调方法
    if (callback) {
      callback()
    }
  })
}

function ShareAppMessage (option) {
  wx.onMenuShareAppMessage({
    title: option.title, // 分享标题
    desc: option.desc, // 分享描述
    link: option.link, // 分享链接
    imgUrl: option.imgUrl, // 分享图标
    success () {
      // 用户成功分享后执行的回调函数
      option.success()
    },
    cancel () {
      // 用户取消分享后执行的回调函数
      option.error()
    }
  })
}
/**
 * [ShareAppMessage 微信分享给朋友]
 * @param {[type]} option [分享信息]
 * @param {[type]} success [成功回调]
 * @param {[type]} error   [失败回调]
 */
export default {
  wxRegister,
  ShareAppMessage
}
