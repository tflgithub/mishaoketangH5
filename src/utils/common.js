// 是否微信打开
function isWeChatOpen () {
  let ua = navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true
  }
  return false
}

// 获取链接上的参数
function getUrlParam (name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let r = window.location.search.substr(1).match(reg)// search,查询？后面的参数，并匹配正则
  if (r != null) return unescape(r[2]); return null
}

//删除链接上的已有参数
function urlDelParam (name) {
  let loca = window.location
  let baseUrl = loca.origin + loca.pathname + '?'
  let query = loca.search.substr(1)
  if (query.indexOf(name) > -1) {
    let obj = {}
    let arr = query.split('&')
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].split('=')
      obj[arr[i][0]] = arr[i][1]
    };
    delete obj[name]
    let url = baseUrl + JSON.stringify(obj).replace(/[\"\{\}]/g, '').replace(/\:/g, '=').replace(/\,/g, '&')
    return url
  }
  return baseUrl
}

export default
{
  isWeChatOpen,
  getUrlParam,
  urlDelParam
}
