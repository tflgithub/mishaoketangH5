<template>
    <div style="width: 100%;height: 100%;text-align:center;margin: auto">
      <div class="title">登录失败!</div>
      <mt-button class="button" plain @click="reLogin">重新登录</mt-button>
    </div>
</template>

<script>
export default {
  name: 'Error',
  methods: {
    reLogin () {
      localStorage.removeItem('token')
      let redirectUrl = location.href.split('/error')[0]
      redirectUrl = encodeURIComponent(redirectUrl)
      console.log(redirectUrl)
      const appid = 'wx02432c565d387e80'
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect`
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/common.scss';
  .title{
    margin-top: px2rem(300px);
    font-size: px2rem(65px);
    color: red;
  }

  .button{
    margin-top: px2rem(40px);
    padding: px2rem(10px);
    color: #1d1d1d;
  }
</style>
