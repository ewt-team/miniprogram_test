const io = require('weapp.socket.io');

function getSessionId() {
  // 尝试读取
  let sessionId = wx.getStorageSync('sessionId');
  // 没有，创建新的sessionId
  if (!sessionId) {
    // 需要用到的一个常数：36^7
    const a = 36 * 36 * 36 * 36 * 36 * 36 * 36;
    // 分三次，每次生成8位
    let s1 = (Math.floor(Math.random() * a * 35) + a).toString(36);
    let s2 = (Math.floor(Math.random() * a * 35) + a).toString(36);
    let s3 = (Math.floor(Math.random() * a * 35) + a).toString(36);
    sessionId = s1 + s2 + s3;
    // 写入微信存储
    wx.setStorageSync('sessionId', sessionId);
  }

  return sessionId;
}

class c_gClient {
  constructor({host,path}) {
    // 配置信息，记录到this对象
    this.sessionId = getSessionId();
    this.host = host;
    this.path = path;
    // 连接实例
    this.link = null;
    // 日志
    console.debug('[gClinet] init, urlFull: '+this.urlFull);
  }

  /** === 小程序事件 === */
  // 显示时，建立连接
  onShow() {
    // 已有连接，不再继续
    if (this.link) return;
    // 建立连接，附带生成的sessionId
    const link = this.link = io(this.host,{
      path:this.path,
      query:{
        weappSid:this.sessionId
      }
    });
    // 事件订阅
    link.on('connect',()=>{
      console.log('[gClient Link] connect');
    })
    link.on('sessionInfo',(...a)=>{
      console.log('sessionInfo')
      this.evt_sessionInfo(...a)
    });
  }

  // 隐藏时，关闭连接
  onHide() {
    // 没有连接，不再继续
    if (!this.link) return;

    // 关闭，标记未Null
    this.link.close();
    this.link = null;
  }

  /** === 后台交互事件 === */

  // 登录信息更新
  evt_sessionInfo(sessionInfo){
    debugger
        // 调用登录接口
        wx.login({
          success: res => {
            console.debug('[login_success] res.code: ' + res.code);
            this.linkBuild(res.code);
          }
        })
  }
}

module.exports = c_gClient;