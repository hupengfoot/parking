var redis_define = {};

var redis_type_enum = {};
redis_type_enum.LOGIN   = 1;
redis_type_enum.TIMER = 2; //用来存放TIMER的辅助数据

var redis_type = [
    {
        iType : redis_type_enum.LOGIN,//用户登陆后，存储tbUserInfo数据
        szPre : "LOGIN",
        TIMEOUT:1800
    },{
	iType : redis_type_enum.TIMER,//用来存储Timer的辅助数据
	szPre : "__TIMER_",
    }
];

var redis_timer_enum = Object.freeze({
    'EXAMPLE':0,
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
