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
 * post	    true post请求，false get请求
 */

/*
 * 返回值格式定义
 * {"errCode":0,"msg":"success","result":{}}
 * errCode返回码
 * msg 返回提示
 * result 返回内容Json格式编码
 */

module.exports.global_query_define = [
{
    router : '/user/user/register',
    query : ['iPhoneNum', 'szPasswd', 'szCode'],
    queryType : ['num', 'string', 'string'],
    access : 0,
    limit : 500,
    comment : '用户注册接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, '服务器内部错误，请联系客服'}
},
{
    router : '/user/user/updateinfo',
    query : ['iPhoneNum', 'szUserName', 'szRealName', 'szMail', 'szLiensePlate', 'szAddress', 'szModels', 'szBankCard'],
    queryType :['num', 'string', 'string', 'string', 'string', 'string', 'string', 'string'], 
    access : 0,
    limit : 500,
    comment : '用户完善资料接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/user/updateliense',
    query : ['iUserID', 'szLiensePlate'],
    queryType : ['num', 'string'],
    access : 1,
    limit : 500,
    comment : '更新用户车牌号接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/user/modifypsw',
    query : ['iUserID', 'szPasswd'],
    queryType : ['num', 'string'],
    access : 1,
    limit ： 500,
    comment : '修改密码接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/common/sms/register',
    query : ['iPhoneNum'],
    queryType : ['num'],
    access : 0,
    limit : 500,
    comment : '用户注册时用于获取手机验证码'	    
    //成功 {'errCode':0, 'msg':'success', 'result':{szCode:xxx}}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router  : '/login',
    query   : ['iUserID'],
    queryType : ['num'],
    access  : 0,
    limit   : 500,
    comment : '通用登录接口'
    //成功 {'errCode':0, 'msg':'success', 'result':{key:xxxxxxxxx}}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/logout',
    query : ['iUserID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '登出接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/space/addspace',
    query : ['iUserID', 'szParkingNum', 'iParkingType', 'iParkingNature'],
    queryType : ['num', 'string', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '添加用户车位'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/space/deletespace',
    query : ['iSpaceID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '删除用户车位' 
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/space/updatespace',
    query : ['iSpaceID', 'szParkingNum', 'iParkingType', 'iParkingNature'],
    queryType : ['num', 'string', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '更新车位信息'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/space/queryspace',
    query : ['iUserID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '查询用户车位信息'
    //成功 {'errCode':0, 'msg':'success', 'result':[{szParkingNum:'xxxxx', iParkingType:'xxx', iParkingNature:'xxx', iHasApprove:'xxx', iDelete:'xxx', tTime:'xxx'}]
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/user/approve',
    query : ['iSpaceID'],
    queryType : ['num'],
    access : 3,
    limit : 500,
    comment : '认证车位信息'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/order/check',
    query : ['iOrderID', 'szCode', 'iPassStatus'],
    //iPassStatus 0 进入车库，1 离开车库
    queryType : ['num', 'string', 'num'],
    access : 2,
    limit : 500,
    comment : '入库扫描接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
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
    //成功 {'errCode':0, 'msg':'success', 'result':[{iType:'xx', szContent:'xx', szTitle:'xxx', dtPublishTime:'xxxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/msg/publish',
    query : ['iType', 'szContent', 'szTitle'],
    queryType : ['num', 'string', 'string'],
    access : 3,
    limit : 500,
    comment : '站内信发送接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/announce/query',
    query : ['iAnnounceID', 'iNum'],
    queryType : ['num', 'num'],
    access : 1,
    limit : 500,
    comment : '查询公告接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{szDetailUrl:'xxxx', tPublishTime:'xxx'}, {szDetailUrl:'xxx', tPublishTime:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/announce/publish',
    query : ['szDetailUrl'],
    queryType : ['string'],
    access : 3,
    limit : 500,
    comment : '发布公告接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/pending/querymine',
    query : ['iUserID', 'iPendingID', 'iNum'],
    queryType : ['num', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '查询我的挂单接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iPendingID:'xxx', iCommunityID:'xx', iUserID:'xxx', iSpaceID:'xxx', tStart:'xxx', tEnd:'xxxx', iMiniRental:'xxx', iChargesType:'xxxx', tPublishTime:'xxx', iStatus:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/pending/publish',
    query : ['iCommunityID', 'iUserID', 'iSpaceID', 'tStart', 'tEnd', 'iMiniRental', 'iChargesType'],
    queryType : ['num', 'num', 'num', 'date', 'date', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '发布我的挂单接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/order/book',
    query : ['iPendingID', 'iUserID', 'tStart', 'tEnd', 'szLiensePlate'],
    queryType : ['num', 'num', 'date', 'date', 'string'],
    access : 1,
    limit : 500,
    comment : '抢单接口'
    //成功 {'errCode':0, 'msg':'success', 'result':{iOrderID:'xxxx'}}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
    //失败 {'errCode':-4, 'msg':'该挂单已被抢走'}
},
{
    router : '/user/order/querymine',
    query : ['iUserID', 'tStart', 'tEnd'],
    queryType : ['num', 'date', 'date'],
    access : 1,
    limit : 500,
    comment : '查询我的订单接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iOrderID:'xxx', iCommunityID:'xxx', iPendingID:'xxx', iUserID:'xxx', tGrobTime:'xxxx', tStart:'xxx', tEnd:'xxx', iPrice:'xxx', iPay:'xxx', iStatus:'xxxx', szLiensePlate:'xxxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/pending/search',
    query : ['iCommunityID', 'tStart', 'tEnd'],
    queryType : ['num', 'date', 'date'],
    access : 1,
    limit : 500,
    comment : '查询挂单接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iPendingID:'xxx', iCommunityID:'xxxx', iUserID:'xxx', iSpaceID:'xxxx', tStart:'xxxx', tEnd:'xxxx', iMiniRental:'xxx', iChargesType:'xxx', tPublishTime:'xxx', iStatus:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/order/pay',
    query : ['iOrderID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '支付订单接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/community/get',
    query : ['iCommunityID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '获取小区详情接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iCommunityID:'xxx', iX:'xxx', iY:'xxx', szComminityName:'xxx', szPicUrl:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/exchange/exchange',
    query : ['iGoodsID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '兑换接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/exchange/query',
    query : ['iUserID', 'iExchangeID', 'iNum'],
    queryType : ['num', 'num', 'num'],
    access : 1,
    limit: 500,
    comment : '查询兑换记录接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iExchangeID:'xxx', iUserID:'xxx', iGoodsID:'xxx', tTime:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/goods/query',
    query : ['iGoodsID', 'iNum'],
    queryType : ['num', 'num'],
    access : 1,
    limit : 500,
    comment : '查询商品列表'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iGoodsID:'xxx', szDesc:'xxx', tPublishTime:'xxx', iPrice:'xxx', iNum:'xxx', iSendNum:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/user/goods/getdetail',
    query : ['iGoodsID'],
    queryType : ['num'],
    access : 1,
    limit : 500,
    comment : '查询商品详情'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iGoodsID:'xxx', szDesc:'xxx', tPublishTime:'xxx', iPrice:'xxx', iNum:'xxx', iSendNum:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/pending/list',
    query : ['iCommunityID', 'iPendingID', 'iNum'],
    queryType : ['num', 'num', 'num'],
    access : 1,
    limit : 500,
    comment : '管理员查询挂单接口'
    //成功 {'errCode':0, 'msg':'success', 'result':[{iPendingID:'xxx', iCommunityID:'xxx', iUserID:'xxx', iSpaceID:'xxx', tStart:'xxx', tEnd:'xxx', iMiniRental:'xxx', iChargesType:'xxx', tPublishTime:'xxx', iStatus:'xxx'}]}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/pending/opt',
    query : ['iPendingID', 'iStatus'],
    //iStatus 0 打开订单，3关闭订单
    queryType : ['num', 'num'],
    access : 1,
    limit : 500,
    comment : '管理员打开关闭订单接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/upload/uploadpic',
    query : [],
    queryType : [],
    post : true,
    access : 1,
    limit : 500,
    comment : '上传图片接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
},
{
    router : '/master/goods/publish',
    query : ['szDesc'],
    queryType : ['string'],
    post : true,
    access : 1,
    limit : 500,
    comment : '发布商品接口'
    //成功 {'errCode':0, 'msg':'success'}
    //失败 {'errCode':-1, 'msg':'服务器内部错误，请联系客服'}
}
]; 
