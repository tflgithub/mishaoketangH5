'use strict'

import axios from 'axios'
axios.interceptors.request.use(config => {
  // loading
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  return response
}, error => {
  return Promise.resolve(error.response)
})

function checkStatus (response) {
  // loading
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  // 异常状态下，把错误信息返回去
  return {
    status: -404,
    msg: '网络异常'
  }
}

function checkCode (res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -404) {
    alert(res.msg)
  }
  if (!res.data) {
    alert(res.data.msg)
  }
  if (res.data.code === 403) {
    localStorage.removeItem('token')
    let redirectUrl = funcUrlDel('code')
    redirectUrl = encodeURIComponent(redirectUrl)
    console.log(redirectUrl)
    const appid = 'wx02432c565d387e80'
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect`
    return
  }
  return res
}

function funcUrlDel (name) {
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

export default {
  post (url, data) {
    return axios({
      method: 'post',
      baseURL: this.HOST,
      url,
      data: data,
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=UTF-8',
        'ms-token': localStorage.getItem('token')
      }
    }).then(
      response => {
        return checkStatus(response)
      }
    ).then(
      res => {
        return checkCode(res)
      }
    )
  }
}
