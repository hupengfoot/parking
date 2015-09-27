var eventDefine = {};

var enumType = {
    ARTICLE_UPDATE : 10000,  //文章表更新事件
    PUBLISH_PENDING : 10001,
    BOOK_SUCCESS : 10002,
    PAY_OVER_TIME : 10003,
    PAY_SUCCESS : 10004,
    ORDER_FINISH : 10005,
    PENDING_OVER_TIME : 10006,
    MSG_SEND : 10007,
};

var define = [
{
  iType:enumType.ARTICLE_UPDATE,
  szName:'ARTI_UPDATE'
},
{
    iType : enumType.PUBLISH_PENDING,
    szName : 'PUBLISH_PENDING'
},
{
    iType : enumType.BOOK_SUCCESS,
    szName : 'BOOK_SUCCESS'
},
{
    iType : enumType.PAY_OVER_TIME,
    szName : 'PAY_OVER_TIME'
},
{
    iType : enumType.ORDER_FINISH,
    szName : 'ORDER_FINISH'
},
{
    iType : enumType.PAY_SUCCESS,
    szName : 'PAY_SUCCESS'
},
{
    iType : enumType.PENDING_OVER_TIME,
    szName : 'PENDING_OVER_TIME'
},
{
    iType : enumType.MSG_SEND,
    szName : 'MSG_SEND'
}
];

eventDefine.enumType = enumType;
eventDefine.define = define;

module.exports = eventDefine;
