//app.js
const c_gClient = require('./utils/c_gClient');

App({
  onShow: function(){
    console.debug('[APP_onShow]');
    this.gClient.onShow();
  },
  onHide: function(){
    console.debug('[APP_onHide]');
    this.gClient.onHide();
  },
  globalData: {
    userInfo: null
  },
  gClient: new c_gClient({
    host:'http://localhost:3001',
    path:'/gHub/'
  })
})