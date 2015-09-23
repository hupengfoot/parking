/* jshint node:true*/
"use strict";

var user_msg_define = {};  //用户消息定义

user_msg_define.enum = {
    ORDER_PAY                : 10000, 
};

user_msg_define.event = [
{
    iType:10000,
    szComment:"挂单被支付消息",
    func:'ossEventMsg.pendingHasPay'
}
];

module.exports = user_msg_define;

