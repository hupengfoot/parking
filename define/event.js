var eventDefine = {};

var enumType = {
    ARTICLE_UPDATE : 10000,  //文章表更新事件
};

var define = [
{
  iType:enumType.ARTICLE_UPDATE,
  szName:'ARTI_UPDATE'
}
];

eventDefine.enumType = enumType;
eventDefine.define = define;

module.exports = eventDefine;
