<template>
  <div class='page' id="page">
    <div class="share-tip" v-if="showShare" @click="share">
      <img src="../assets/images/share_tip.png"/>
    </div>
    <div class="poster" v-if="showPoster">
      <img :src='courseInfo.phoUrl' style="width:100%;height:100%;"/>
      <div style='position: absolute;top: 0;background:#000;opacity:0.2;width:100%;height:100%;'/>
      <span class='play-ad' @click="playAd">{{buttonText}}</span>
    </div>
    <video v-else
           id="video"
           class="video"
           x5-video-player-type="h5"
           controls
           style="object-fit:fill"
           preload="auto"
           :src="videoUrl"
    ></video>
    <div class="name">{{courseInfo.title}}</div>
    <div class="learn">
      <img src="../assets/images/ic_xuexi.png">
      <span>{{courseInfo.learnNum}}人学习</span>
    </div>

    <p @click="wxgz" class="wxgz" v-html="courseInfo.wxgzInfo"/>

    <div id="navbar" class="navbar_half">
      <ul :class="navBarFixed == true ? 'isFixed' :''">
        <li v-for="(tab,index) in tabs" :class="{tab_tit_cur:selected==index}" @click="toggleTab(index)"
            v-html="tab.title"></li>
      </ul>
    </div>

    <div style="background-color: #FFFFFF" id="start">
      <div class="teacher">
        <img :src='teacherInfo.avatarUrl'/>
        <div class="zhiwei">讲师</div>
        <div class="info">
          <span class="nickName">{{teacherInfo.name}}</span>
          <span class="title">{{teacherInfo.title}}</span>
        </div>
      </div>
      <div class="tab_title">
        <img src="../assets/images/ic_kecheng.png">
        <span>课程介绍</span>
      </div>
      <p class="summary" v-html="summaryInfo"></p>
      <div id="courseEnd" class="course_end"></div>
    </div>

    <!--<div class="tab_title" id="offLineCourse">-->
    <!--<img src="../assets/images/ic_kecheng.png">-->
    <!--<span>线下课程</span>-->
    <!--</div>-->
    <!--<p class="summary" v-html="courseInfo.aboutInfo"></p>-->
    <div id="ppt" style="background-color: #FFFFFF;height: 100%">

      <div class="tab_title">
        <img src="../assets/images/ic_kecheng.png">
        <span v-if="hadFee==true">已买课程</span>
        <span v-else>目录</span>
      </div>
      <div v-for="(item,index) in catalogInfo" class="catalogInfo">
        <div class="catalog">
          <div style="display: flex;flex-direction: row;align-items: center">
            <span class="catalog_span" v-if='item.type=="1"'>视频</span>
            <span class="catalog_span" v-else>课件</span>
            <div style="display:flex;flex-direction:column;justify-items: left">
            <span class="catalog_title">{{item.title}}</span>
            <span v-if="item.startTime" class="catalog_time">开播时间：{{item.startTime}}</span>
            </div>
          </div>
          <img class="catalog_play" src="../assets/images/play.png" v-if="item.type=='1' && item.isStartTime==true"
               @click="goIndex(index)"/>
        </div>

        <viewer :images="item.data" v-if="hadFee==true">
          <img v-if="item.type=='2'" v-for="imageUrl in item.data" class="catalog_img" :src="imageUrl"/>
        </viewer>
        <div v-else>
          <img v-if="item.type=='2'" v-for="imageUrl in item.data" class="catalog_img" :src="imageUrl"/>
        </div>
      </div>
    </div>


    <footer>
      <div class="share" @click="share">
        <img src='../assets/images/ic_fenxiang.png'/>
        <span>分享</span>
      </div>
      <div v-if="!hadFee">
        <div v-if="canPay" @click='buy' class="pay">
          <span>我要学习 ¥{{courseInfo.price}}</span>
        </div>
        <div v-else class="disabled-pay">
          <span>我要学习 ¥{{courseInfo.price}}</span>
        </div>
      </div>
      <div v-else @click='startStudy' class="pay">
        <span>我要学习</span>
      </div>
    </footer>
  </div>
</template>

<script>
  import http from '../utils/http'
  import api from '../utils/api'
  import wxApi from '../utils/wxapi'
  import common from '../utils/common'

  /** 百度统计***/
  (function () {
    let hm = document.createElement('script')
    hm.src = 'https://hm.baidu.com/hm.js?fe9d2f6b679ccab2309da8a72a5a21fe'
    let s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore(hm, s)
  })()
  /** 百度统计***/
  export default {
    name: 'IosPay',
    inject: ['reload'],
    data: function () {
      return {
        tabs: [{id: 0, title: '课程介绍'}, {id: 1, title: '目录'}],
        selected: 0,
        showPoster: true,
        courseInfo: {},
        teacherInfo: {},
        catalogInfo: [],
        pptInfo: '',
        summaryInfo: '',
        hadFee: false,
        videoUrl: '',
        adUrl: '',
        qrCodeUrl: '',
        buttonText: '播放宣传片',
        canPay: true,
        navBarFixed: false,
        showShare: false,
        idx: -1
      }
    },
    mounted: function () {
      document.getElementById('page').addEventListener('scroll', this.handleScroll)
      // 微信分享授权
      wxApi.wxRegister(this.wxRegCallback)
      // 获取服务课程数据
      this.fetchData()
    },
    methods: {
      wxgz () {
        if (common.isWeChatOpen()) {
          // 在微信中打开
          window.open('https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzU2ODc2MDAxNQ==#wechat_redirect')
        }
      },
      toggleTab (index) {
        if(this.selected==index)
        {
          return
        }
        this.selected = index
        if (index == '0') {
          document.querySelector('#start').scrollIntoView()
        } else if (index == '1') {
          document.querySelector('#courseEnd').scrollIntoView()
        }
      },
      goIndex (index) {
        if (this.hadFee == false) {
          alert('请先购买')
          return
        }
        this.idx = index
        let item = this.catalogInfo[index]
        if (item.type == '1') {
          this.videoUrl = item.data[0]
          this.playVideo()
        }
      },
      share () {
        if (!common.isWeChatOpen()) {
          alert('请使用微信打开')
          return
        }
        let isShow = this.showShare
        this.showShare = !isShow
      },
      startStudy () {
        document.getElementById('ppt').scrollIntoView()
      },
      wxRegCallback () {
        // 用于微信JS-SDK回调
        this.wxShareAppMessage()
      },
      wxShareAppMessage () {
        let option = {
          title: this.courseInfo.title, // 分享标题, 请自行替换
          desc: this.courseInfo.learnNum + '人学习', // 分享描述, 请自行替换
          link: window.location.href.split('#')[0], // 分享链接，根据自身项目决定是否需要split
          imgUrl: this.courseInfo.phoUrl, // 分享图标, 请自行替换，需要绝对路径
          success: () => {
            alert('分享成功')
          },
          error: () => {
            alert('已取消分享')
          }
        }
        // 将配置注入通用方法
        wxApi.ShareAppMessage(option)
      },
      handleScroll () {
        let scrollTop = document.querySelector('#page').scrollTop
        let offsetNavBar = document.querySelector('#navbar').offsetTop
        let courseDesc = document.querySelector('#courseEnd').offsetTop
        if (scrollTop > offsetNavBar) {
          this.navBarFixed = true
        } else {
          this.navBarFixed = false
        }
        if (scrollTop > courseDesc-500) {
          this.selected = '1'
        }
        else{
          this.selected='0'
        }
      },
      fetchData: async function () {
        let params = {
          'courseId': this.$route.query.id
        }
        const res = await http.post(api.getDataUrl, params)
        if (res.data) {
          //console.log(JSON.stringify(res.data))
          this.courseInfo = res.data.data.courseInfo
          this.teacherInfo = res.data.data.teacherInfo
          this.catalogInfo = res.data.data.catalogInfo
          this.summaryInfo = res.data.data.summaryInfo
          this.pptInfo = res.data.data.pptInfo
          this.hadFee = res.data.data.courseInfo.hadFee
          this.adUrl = res.data.data.courseInfo.adUrl
          if (this.hadFee) {
            this.tabs[1].title = '已买课程'
          }
        }
      },
      playAd () {
        this.videoUrl = this.adUrl
        this.playVideo()
      },
      playVideo () {
        this.showPoster = false
        let video = document.querySelector('video')
        document.addEventListener('WeixinJSBridgeReady', function () {
          video.play()
        }, false)
        setTimeout(function () {
          let video = document.querySelector('video')
          video && video.play()
        }, 0)
      },
      buy: async function () {
        if (!common.isWeChatOpen()) {
          alert('请使用微信打开')
          return
        }
        this.canPay = false
        let params = {'courseId': this.courseInfo.courseId}
        const res = await http.post(api.payUrl, params)
        if (res.data.code === 0) {
          let clock = window.setInterval(() => {
            this.canPay = true
            window.clearInterval(clock)
          }, 30000)
          if (typeof WeixinJSBridge === 'undefined') {
            if (document.addEventListener) {
              document.addEventListener('WeixinJSBridgeReady', this.onBridgeReady, false)
            } else if (document.attachEvent) {
              document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady)
              document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady)
            }
          } else {
            this.onBridgeReady(res.data)
          }
        } else {
          alert(res.data.msg)
          this.canPay = true
        }
      },
      onBridgeReady (res) {
        WeixinJSBridge.invoke(
          'getBrandWCPayRequest', {
            'appId': res.data.appId,
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': res.data.signType,
            'paySign': res.data.sign
          },
          function (res) {
            if (res.err_msg == 'get_brand_wcpay_request:ok') {
              alert('支付成功')
              let clock = window.setInterval(() => {
                this.reload()
                window.clearInterval(clock)
              }, 1000)
            } else {
              alert('支付失败')
            }
          })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import '../assets/scss/common.scss';

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    background-color: #EFEFEF;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .share-tip {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    background: rgba(0, 0, 0, 0.6);
    bottom: 0;
    z-index: 9999;
  }

  .qr_code {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.6);
    bottom: 0;
    z-index: 9999;
    align-items: center;
    justify-items: center;

    img {
      width: 80%;
      margin-top: px2rem(200px);
      margin-left: px2rem(75px);
    }
  }

  .share-tip img {
    position: absolute;
    right: 0;
    width: px2rem(560px);
    height: px2rem(338px);
    margin: px2rem(20px);
  }

  .navbar_half {
    ul {
      overflow: hidden;
      border-bottom: px2rem(1px) solid #e7e7e7;
      background-color: #FFFFFF;
      justify-items: center;
      padding-left: px2rem(42px);
      padding-right: px2rem(42px);
      li {
        float: left;
        font-size: px2rem(28px);
        padding-top: px2rem(10px);
        padding-bottom: px2rem(10px);
        text-align: center;
        width: 50%;
      }
    }
    .tab_tit_cur {
      border-bottom: px2rem(2px) solid #785B01;
      color: #785B01;
    }
    .isFixed {
      position: fixed;
      top: 0;
      z-index: 999;
      width: 100%;
      padding-left: px2rem(42px);
      padding-right: px2rem(42px);
      box-sizing: border-box;
      -moz-box-sizing: border-box; /* Firefox */
      -webkit-box-sizing: border-box; /* Safari */
    }
  }

  .course_end{
    height: px2rem(78px);
  }
  .poster {
    width: 100%;
    height: px2rem(453px);
    position: relative;
    display: flex
  }

  .poster span {
    position: absolute;
    left: 50%;
    top: 50%;
    border: solid px2rem(2px) #fff;
    border-radius: px2rem(8px);
    color: #FFFFFF;
    font-size: px2rem(32px);
    line-height: px2rem(20px);
    padding: px2rem(22px);
    margin: px2rem(-40px) 0 0 px2rem(-90px);
  }

  .video {
    width: 100%;
    height: px2rem(453px);
  }

  .name {
    padding-left: px2rem(41px);
    padding-right: px2rem(41px);
    padding-top: px2rem(42px);
    font-size: px2rem(38px);
    color: #131313;
    background-color: #ffffff;
  }

  .learn {
    background-color: #ffffff;
    /*display: -webkit-flex;*/
    /*display: flex;*/
    /*-webkit-box-pack: center;*/
    /*-webkit-box-align: center;*/
    /*-webkit-align-items: center;*/
    padding-left: px2rem(41px);
    padding-top: px2rem(20px);
  }

  .learn img {
    height: px2rem(28px);
    width: px2rem(34px);
  }

  .learn span {
    font-size: px2rem(32px);
    margin-left: px2rem(10px);
    color: #785B01;
  }

  .teacher {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: px2rem(750px);
    margin-right: px2rem(42px);
    margin-top: px2rem(20px);
    height: px2rem(166px);
    background-color: #FFF8E2;
    .zhiwei {
      position: absolute;
      top: px2rem(115px);
      left: px2rem(75px);
      line-height: px2rem(25px);
      background: rgba(255, 192, 7, 1);
      border-radius: px2rem(4px);
      padding: px2rem(2px);
      font-size: px2rem(20px);
    }
  }

  .teacher img {
    height: px2rem(108px);
    width: px2rem(108px);
    margin-left: px2rem(41px);
    border-radius: 50%;
  }

  .teacher .info {
    display: flex;
    margin: px2rem(40px);
    flex-direction: column;
  }

  .teacher .info .nickName {
    font-size: px2rem(40px);
    line-height: px2rem(40px);
    color: #785B01;
  }

  .teacher .info .title {
    margin-top: px2rem(10px);
    line-height: px2rem(40px);
    font-size: px2rem(29px);
    color: #1D1D1D;
  }

  .wxgz {
    padding: px2rem(42px);
    background-color: #ffffff;
  }

  .tab_title {
    height: px2rem(100px);
    line-height: px2rem(100px);
    background-color: #ffffff;
    margin-top: px2rem(20px);
    padding-top: px2rem(20px);
    display: -webkit-flex;
    display: flex;
    -moz-align-items: center;
    -webkit-align-items: center;
    align-items: center;
    padding-left: px2rem(41px);

    img {
      width: px2rem(30px);
      height: px2rem(30px);
    }

    span {
      font-size: px2rem(32px);
      margin-left: px2rem(10px);
    }
  }

  .summary {
    padding-left: px2rem(42px);
    padding-right: px2rem(42px);
    background-color: #ffffff;
  }

  .catalog {
    margin-left: px2rem(42px);
    margin-right: px2rem(42px);
    padding-top: px2rem(30px);
    padding-bottom: px2rem(30px);
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #efefef;
    justify-content: space-between;
  }

  .catalog_span {
    font-size: px2rem(28px);
    background-color: #FFBD2D;
    border-radius: px2rem(5px);
    width: px2rem(60px);
    padding: px2rem(5px);
    text-align: center;
    margin-right: px2rem(20px);
  }

  .catalog_play {
    width: px2rem(50px);
    height: px2rem(50px);
    margin-left: px2rem(20px);
  }

  .catalog_title {
    word-wrap : break-word;
    font-size: px2rem(34px);
  }


  .catalog_time{
    color: #666666;
    font-size: px2rem(26px);
  }

  .catalog_img {
    width: 100%;
    height: px2rem(400px);
  }

  footer {
    width: px2rem(750px);
    height: px2rem(100px);
    line-height: px2rem(100px);
    text-align: center;
    background-color: #FFFFFF;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
    color: #000000;
    display: flex;
    align-items: center;
  }

  footer .share {
    background-color: #FFE28E;
    width: px2rem(200px);
    height: px2rem(80px);
    line-height: px2rem(80px);
    margin-left: px2rem(20px);
    border-radius: px2rem(6px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  footer .share img {
    vertical-align: middle;
    width: px2rem(32px);
    height: px2rem(31px);
    margin-right: px2rem(10px)
  }

  footer .share span {
    font-size: px2rem(28px);
    line-height: px2rem(90px);
  }

  footer .pay {
    width: px2rem(465px);
    height: px2rem(80px);
    background-color: #FFBD2D;
    font-size: px2rem(28px);
    line-height: px2rem(80px);
    text-align: center;
    margin-left: px2rem(40px);
    border-radius: px2rem(6px)
  }

  footer .pay span {
    font-size: px2rem(28px);
    line-height: px2rem(90px);
  }

  footer .disabled-pay {
    width: px2rem(465px);
    height: px2rem(80px);
    background-color: #b0b0b0;
    font-size: px2rem(28px);
    line-height: px2rem(80px);
    text-align: center;
    margin-left: px2rem(40px);
    border-radius: px2rem(6px)
  }

  footer .disabled-pay span {
    font-size: px2rem(28px);
    line-height: px2rem(90px);
  }

</style>
