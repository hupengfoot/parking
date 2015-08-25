/*
 *
 * 鉴权字段(access)说明
 * 0 无需鉴权，所有人可以访问
 * 1 需要鉴权，登录后可以访问
 * 2 车库管理员可以访问 
 * 3 后台管理员可以访问
 * -1 这种权限比较特殊，是集合了0和1的类型，如果cookie里面没有skey，就是0,这个时候，query里面的iQQ必须是0
 */

/*
 * router   接口url
 * query    接口参数
 * queryType	参数类型，用作传入参数check
 * access   访问权限
 * limit    每秒访问限速
 * comment  接口说明
 */

module.exports.global_query_define = [
{
    router : '/user/register',
    query : ['iPhoneNum', 'szPasswd', 'szCode'],
    queryType : ['num', 'string', 'string'],
    access : 0,
    limit : 500,
    comment : '用户注册接口'
},
{
    router : '/user/updateinfo',
    query : ['iPhoneNum', 'szUserName', 'szRealName', 'szMail', 'szLiensePlate', 'szAddress', 'szModels', 'szBackCard'],
    queryType :['num', 'string', 'string', 'string', 'string', 'string', 'string', 'string'], 
    access : 0,
    limit : 500,
    comment : '用户完善资料接口'
},
{
    router : '/common/sms/register',
    query : ['iPhoneNum'],
    queryType : ['num'],
    access : 0,
    limit : 500,
    comment : '用户注册时用于获取手机验证码'	    
},
{
    router  : '/login',
    query   : ['iQQ'],
    queryType : ['num'],
    access  : 0,
    limit   : 500,
    comment : '通用登录接口'
},
{
    router : '/user/addspace',
    query : ['iUserID', 'szParkingNum', 'iParkingType', 'iParkingNature'],
    queryType : ['num', 'string', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '添加用户车位'
},
{
    router : '/user/deletespace',
    query : ['iSpaceID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '删除用户车位' 
},
{
    router : '/user/updatespace',
    query : ['iSpaceID', 'szParkingNum', 'iParkingType', 'iParkingNature'],
    queryType : ['num', 'string', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '更新车位信息'
},
{
    router : '/user/queryspace',
    query : ['iUserID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '查询用户车位信息'
},
{
    router : '/master/user/approve',
    query : ['iSpaceID'],
    queryType : ['num'],
    access : 3,
    limit : 500,
    comment : '认证车位信息'
},
{
    router : '/master/order/check',
    query : ['iOrderID', 'szCode', 'iPassStatus'],
    //iPassStatus 0 进入车库，1 离开车库
    queryType : ['num', 'string', 'num'],
    access : 2,
    limit : 500,
    comment : '入库扫描接口'
},
{
    router : '/msg/querymsg',
    query : ['iMessageID', 'iNum', 'iType'],
    //iMessageID  上一次拉去的最后一个iMessageID
    //iNum 拉取个数
    //iType 消息类型
    queryType : ['num', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '查看站内信'
}
]; 
