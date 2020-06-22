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
    this.socket = null;
  }

  /** === 小程序事件 === */
  // 显示时，建立连接
  onShow() {
    // 已有连接，不再继续
    if (this.socket) return;
    // 建立连接，附带生成的sessionId
    const socket = this.socket = io(this.host,{
      path:this.path,
      query:{
        weappSid:this.sessionId
      }
    });
    // 事件订阅
    socket.on('connect',()=>console.debug('[gClient socket] connect'));
    socket.on('sessionInfo',(...a)=>this.evt_sessionInfo(...a));
  }
  // 隐藏时，关闭连接
  onHide() {
    // 没有连接，不再继续
    if (!this.socket) return;

    // 关闭，标记未Null
    this.socket.close();
    this.socket = null;
  }

  /** === 后台交互事件 === */
  // 登录信息更新
  evt_sessionInfo(sessionInfo){
    console.debug('[evt_sessionInfo] 更新')
    console.debug(sessionInfo);
    // 如果没有小程序凭据，调用微信接口获取code
    if (!sessionInfo.ticketDict.weapp) {
      console.debug('[evt_sessionInfo] 缺少weapp凭据(openid)，尝试调用微信接口获取code')
      // 调用登录接口
      wx.login({
        success: res => {
          if(res.code){
            console.debug('[evt_sessionInfo] wx.login 成功，获取到code: ' + res.code);
            this.apiCall('setTicketWeapp',{code:res.code},(err,result)=>{
              debugger
            })
          }
          else {
            console.debug('[evt_sessionInfo] wx.login 失败，无res.code，errMsg: ' + res.errMsg);
          }
        },
        fail: res => {
          console.debug('[evt_sessionInfo] wx.login 失败');
        }
      })
    }
  }

  /** === 对外方法 === */
  /* ====== 对外方法 ====== */
    /**
     * API调用方法
     * @param {Object,String} apiInfo 请求接口
     * @param {Object} apiJson 
     * @param {*} callback
     */
    apiCall(apiInfo,apiJson,callback){
      /* 调用请求 */
      this.socket.emit('apiJson',apiInfo,apiJson,(err,json)=>callback(err,json));
      /* 若没有callback，反馈Promise，构建callback函数 */
      if(!callback) return new Promise(resolve=>callback=(...all)=>resolve(all))
  }
}

module.exports = c_gClient;