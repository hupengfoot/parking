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

msg.define[msg.code.ERR_SUCCESS] = 'success';
msg.define[msg.code.ERR_DB_ERR] = '服务器内部错误，请联系客服';
msg.define[msg.code.ERR_VALID_SMS] = '短信验证码不正确';
msg.define[msg.code.ERR_VALID_QUERY] = '非法的请求参数';
msg.define[msg.code.ERR_BOOK_FAIL] = '该挂单已被抢走';
msg.define[msg.code.ERR_HAS_REGISTER] = '该用户已注册';
msg.define[msg.code.ERR_NOT_EXIST_USER] = '没有注册的用户';
msg.define[msg.code.ERR_PASSWD_INCORRECT] = '密码不正确';
msg.define[msg.code.ERR_VALID_SMS_TIME] = "短信验证码间隔时间不足一分钟";

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
