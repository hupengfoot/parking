var msg = {};
msg.define = {};
msg.code = {};

msg.code.ERR_SUCCESS = 0;
msg.code.ERR_DB_ERR = -1;
msg.code.ERR_VALID_SMS = -2;
msg.code.ERR_VALID_QUERY = -3;
msg.code.ERR_BOOK_FAIL = -4;
msg.code.ERR_HAS_REGISTER = -5;
msg.code.ERR_NOT_EXIST_USER = -6;
msg.code.ERR_PASSWD_INCORRECT = -7;
msg.code.ERR_VALID_SMS_TIME = -8;
msg.code.ERR_ACCESS_FAIL = -9;
msg.code.ERR_ACCESS = -10;
msg.code.ERR_NOT_YOUR_SPACE = -11;
msg.code.ERR_UPLOAD_ARGS = -12;
msg.code.ERR_BOOK_FAIL = -13;
msg.code.ERR_INVALID_SZCODE = -14;
msg.code.ERR_NOT_PAY = -15;
msg.code.ERR_INVALID_ORDER = -16;
msg.code.ERR_PAY_FAIL = -17;
msg.code.ERR_HAS_PENDING = -18;
msg.code.ERR_PAY_OVER_TIME = -19;
msg.code.ERR_NOT_REGISTER_COMMUNITY = -20;
msg.code.ERR_HAS_NOT_APPROVE = -21;
msg.code.ERR_NOT_SATISFY_TIME = -22;
msg.code.ERR_CAN_NOT_CANCEL_PENDING = -23;
msg.code.ERR_INVALID_PENDING = -24;
msg.code.ERR_INVALID_SPACE = -25;
msg.code.ERR_INVALID_GOODS = -26;
msg.code.ERR_NOT_ENOUGH_GOODS = -27;
msg.code.ERR_NOT_ENOUGH_SCORE = -28;
msg.code.ERR_NOT_ENOUGH_ACCESS_RIGHT = -29;
msg.code.ERR_FORBIDDEN_USER = -30;
msg.code.ERR_NOT_ALLOW_TIME = -31;
msg.code.ERR_NOT_ALLOW_GROB_OWN_PENDING = -32;
msg.code.ERR_NOT_EXIST_COMMUNITY = -33;
msg.code.ERR_NOT_ALLOW_START_TIME = -34;
msg.code.ERR_FRESH_QUERY = -35;

msg.define[msg.code.ERR_SUCCESS] = 'success';
msg.define[msg.code.ERR_DB_ERR] = '服务器内部错误，请联系客服';
msg.define[msg.code.ERR_VALID_SMS] = '短信验证码不正确';
msg.define[msg.code.ERR_VALID_QUERY] = '非法的请求参数';
msg.define[msg.code.ERR_BOOK_FAIL] = '该挂单已被抢走';
msg.define[msg.code.ERR_HAS_REGISTER] = '该用户已注册';
msg.define[msg.code.ERR_NOT_EXIST_USER] = '没有注册的用户';
msg.define[msg.code.ERR_PASSWD_INCORRECT] = '密码不正确';
msg.define[msg.code.ERR_VALID_SMS_TIME] = "短信验证码间隔时间不足一分钟";
msg.define[msg.code.ERR_ACCESS_FAIL] = "未登录或者登录态失效";
msg.define[msg.code.ERR_ACCESS] = "非法请求";
msg.define[msg.code.ERR_NOT_YOUR_SPACE] = "不是你的车位";
msg.define[msg.code.ERR_UPLOAD_ARGS] = "上传文件参数错误";
msg.define[msg.code.ERR_BOOK_FAIL] = "该车位已被预订";
msg.define[msg.code.ERR_INVALID_SZCODE] = "验证码不正确";
msg.define[msg.code.ERR_NOT_PAY] = "您未付款";
msg.define[msg.code.ERR_INVALID_ORDER] = "不存在的订单";
msg.define[msg.code.ERR_PAY_FAIL] = "支付失败";
msg.define[msg.code.ERR_HAS_PENDING] = "该车位已挂单";
msg.define[msg.code.ERR_PAY_OVER_TIME] = "付款超时";
msg.define[msg.code.ERR_NOT_REGISTER_COMMUNITY] = "未接入的小区";
msg.define[msg.code.ERR_HAS_NOT_APPROVE] = "未认证的车位";
msg.define[msg.code.ERR_NOT_SATISFY_TIME] = "不满足抢单条件";
msg.define[msg.code.ERR_CAN_NOT_CANCEL_PENDING] = "无法取消订单";
msg.define[msg.code.ERR_INVALID_PENDING] = "不存在的挂单";
msg.define[msg.code.ERR_INVALID_SPACE] = "不存在的车位";
msg.define[msg.code.ERR_INVALID_GOODS] = "不存在的商品";
msg.define[msg.code.ERR_NOT_ENOUGH_GOODS] = "没有足够数量的商品";
msg.define[msg.code.ERR_NOT_ENOUGH_SCORE] = "没有足够的积分";
msg.define[msg.code.ERR_NOT_ENOUGH_ACCESS_RIGHT] = "没有访问权限";
msg.define[msg.code.ERR_FORBIDDEN_USER] = "被封的用户，解封请联系客服";
msg.define[msg.code.ERR_NOT_ALLOW_TIME] = "抢挂单开始时间不得晚于22点，结束时间不得早于8点";
msg.define[msg.code.ERR_NOT_ALLOW_GROB_OWN_PENDING] = "不允许抢自己的挂单";
msg.define[msg.code.ERR_NOT_EXIST_COMMUNITY] = "不存在的小区";
msg.define[msg.code.ERR_NOT_ALLOW_START_TIME] = "挂单开始时间小于当前时间";
msg.define[msg.code.ERR_FRESH_QUERY] = "访问过频，请稍后再试";

msg.wrapper = function(err,result,res){
    if(err){
        if(msg.define[err]){
            res.jsonp(msg.getMsg(err));
        }else{
            res.jsonp(msg.getMsg(msg.code.ERR_DB_ERR));
        }
    }else{
        res.jsonp(msg.getMsg(msg.code.ERR_SUCCESS,result));
    }
};

msg.getMsg = function(code, result){
    var obj = {};
    obj.errCode = code;
    obj.msg = msg.define[code];
    if(typeof result != 'undefined'){
        obj.result = result;
    }
    return obj;
};

module.exports.global_msg_define = msg;
