var redis_define = {};
redis_define.pendingID = 'PENDING_ID';
redis_define.orderID = 'ORDER_ID';
redis_define.exchangeID = 'EXCHANGE_ID';
redis_define.msgID = 'MSG_ID';

var redis_type_enum = {};
redis_type_enum.LOGIN   = 1; //存放个人登录信息
redis_type_enum.TIMER = 2; //用来存放TIMER的辅助数据
redis_type_enum.PHONE = 3; //存放短信验证码
redis_type_enum.INCREMENT = 4;//存放自增键
redis_type_enum.ORDER = 5;//存放订单验证码

var redis_type = [
    {
        iType : redis_type_enum.LOGIN,//用户登陆后，存储tbUserInfo数据
        szPre : "LOGIN",
        TIMEOUT:1800
    },{
	iType : redis_type_enum.TIMER,//用来存储Timer的辅助数据
	szPre : "__TIMER_",
    },{
	iType : redis_type_enum.PHONE,//存放短信验证码
	szPre : "PHONE",
	TIMEOUT:600
    },{
	iType : redis_type_enum.INCREMENT,//存放自增键
	szPre : "INCREMENT",
    },{
	iType : redis_type_enum.ORDER,//存放订单验证码
	szPre : "ORDER",
	TIMEOUT : 864000
    }
];

var redis_timer_enum = Object.freeze({
    'EXAMPLE':0,
    'PAY_OVER_TIME':1,
    'BOOK_SUCCESS':2,
    'PENDING_OVER_TIME':3,
});

var redis_channel_enum = Object.freeze({
    'CHANNEL_NAME':0,
});

//表示这个channel对应的接收端有几个,名字必须与上面的相等
//个数表示接收者有几个
//接收的进程，第一个参数需要传一个ID，例如3个接受者为0 1 2
//如果配置为-1，就是说接收者不再是负载均衡的角色，这个时候channel的定义是广播
var redis_channel_num_define = Object.freeze({
});

redis_define.enum = redis_type_enum;
redis_define.type = redis_type;
redis_define.timer = redis_timer_enum;
redis_define.channel_num_define = redis_channel_num_define;

module.exports.redis_define = redis_define;
