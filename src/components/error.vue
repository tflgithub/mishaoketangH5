<template>
    <div>登录失败
      <div @click="relogin">重新登录</div>
    </div>

</template>

<script>
export default {
  name: 'Error',
  methods: {
    relogin () {
      localStorage.removeItem('token')
      let redirectUrl = 'http://api.miskitchen.com/h5'
      redirectUrl = encodeURIComponent(redirectUrl)
      console.log(redirectUrl)
      const appid = 'wx02432c565d387e80'
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect`
    }
  }
}
</script>

<style scoped>

</style>
