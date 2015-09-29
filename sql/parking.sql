#create database parking

create table IF NOT EXISTS tbUserInfo(
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    szUserName varchar(1024) default '' comment '注册用户名',
    szRealName varchar(128) default '' comment '用户真实姓名',
    szMail varchar(512) default '' comment '用户邮箱',
    szLiensePlate varchar(1024) default '' comment '用户车牌号，可填写多个，最多5个，用|分隔',
    szAddress varchar(1024) default '' comment '用户住址',
    szModels varchar(1024) default '' comment '用户车型',
    tRegisterTime datetime not null default '1970-01-01 08:00:00' comment '用户注册时间',
    tLastLoginTime datetime not null default '1970-01-01 08:00:00' comment '用户最后登录时间',
    iScore bigint unsigned not null default 0 comment '用户积分',
    iCredit bigint unsigned not null default 0 comment '信用积分',
    iMoney int unsigned not null default 0 comment '用户累计赚取的钱',
    iRoleType int unsigned not null default 0 comment '0 普通用户，1 小区管理员，2 后台管理员',
    szBankCard varchar(128)  not null default '' comment '出租用户绑定银行卡信息',
    szBankAddress varchar(512)  not null default '' comment '开户行信息',
    szAlipay varchar(512)  not null default '' comment '支付宝账号',
    szAlipayNickname varchar(128)  not null default '' comment '支付宝账号昵称',
    iHasComplete int unsigned not null default 0 comment '是否已完善资料',
    iRentTime int unsigned not null default 0 comment '出租时数',
    iOrderTime int unsigned not null default 0 comment '租用时数',
    iForbidden int unsigned not null default 0 comment '0 正常用户，1 被封用户',
    primary key (`iPhoneNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户信息表';

create table IF NOT EXISTS tbUserPasswd(
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    szPasswd char(128) default '' comment '用户密码',
    primary key (`iPhoneNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户密码表';

create table IF NOT EXISTS tbParkingSpaceInfo(
    iSpaceID bigint unsigned not null auto_increment comment '车位系统编号',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    iCommunityID bigint unsigned not null comment '小区ID',
    szParkingNum varchar(1024) default '' comment '用户车位号',
    szParkingPic varchar(8192) default '' comment '用户车位照片',
    iParkingType int unsigned not null default 0 comment '车位类型 0地面，1车架',
    iParkingNature int unsigned not null default 0 comment '0自有，1自用',
    iHasApprove int unsigned not null default 0 comment '0未认证，1已认证',
    iDelete int unsigned not null default 0 comment '0 未删除，1 已删除',
    iStatus int unsigned not null default 0 comment '0 未挂单，1 已挂单',
    tTime datetime not null default '1970-01-01 08:00:00' comment '认证时间',
    primary key (`iSpaceID`),
    index(`iPhoneNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='车位认证表';

create table IF NOT EXISTS tbAnnounceInfo(
    iAnnounceID bigint unsigned not null auto_increment comment '公告ID',
    szDetailUrl varchar(1024) default '' comment '公告详情地址',
    szImgUrl varchar(1024) default '' comment '公告摘要图',
    tPublishTime datetime not null default '1970-01-01 08:00:00' comment '公告发布时间',
    primary key (`iAnnounceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='公告表';

create table IF NOT EXISTS tbCommunityInfo(
    iCommunityID bigint unsigned not null auto_increment comment '小区ID',
    iChargesType int unsigned not null default 0 comment '收费标准类型，具体类型在配置文件中定义',
    iPer int unsigned not null default 0 comment '每单位时间',
    iPerPrice int unsigned not null default 0 comment '每单位时间收费值',
    iMaxPrice int unsigned not null default 0 comment '最大收费值',
    szX varchar(512) default '' comment '小区纬度坐标',
    szY varchar(512) default '' comment '小区经度坐标',
    iProvince int unsigned not null default 0 comment '省编号',
    iCity int unsigned not null default 0 comment '城市编号',
    szCommunityName varchar(1024) default '' comment '小区名',
    szAddressName varchar(1024) default '' comment '街道地址信息',
    szPicUrl varchar(4096) default '' comment '小区车库照片地址，用|分隔',
    tTime datetime not null default '1970-01-01 08:00:00' comment '发布时间',
    primary key (`iCommunityID`),
    index(`iProvince`, `iCity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='小区表';

create table IF NOT EXISTS tbPendingInfo(
    iPendingID bigint unsigned not null comment '挂单号',
    iCommunityID bigint unsigned not null comment '小区ID',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    iSpaceID bigint unsigned not null default 0 comment '车位系统编号',
    tStart datetime not null default '1970-01-01 08:00:00' comment '起租时间',
    tEnd datetime not null default '1970-01-01 08:00:00' comment '结束时间',
    iMiniRental int unsigned not null comment '最少租用时间',
    tPublishTime datetime not null default '1970-01-01 08:00:00' comment '挂单发布时间',
    iStatus int unsigned not null default 0 comment '0 未出租，1 已被抢单未支付，2 已支付, 3 关闭订单',
    primary key (`iPendingID`),
    index(iCommunityID),
    index(`tStart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='小区挂单表';

create table IF NOT EXISTS tbUserPendingInfo(
    iPendingID bigint unsigned not null comment '挂单号',
    iCommunityID bigint unsigned not null comment '小区ID',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    iSpaceID bigint unsigned not null default 0 comment '车位系统编号',
    tStart datetime not null default '1970-01-01 08:00:00' comment '起租时间',
    tEnd datetime not null default '1970-01-01 08:00:00' comment '结束时间',
    iMiniRental int unsigned not null comment '最少租用时间',
    tPublishTime datetime not null default '1970-01-01 08:00:00' comment '挂单发布时间',
    iStatus int unsigned not null default 0 comment '0 未出租，1 已被抢单未支付，2 已支付 3 关闭订单',
    primary key (`iPendingID`),
    index(`iPhoneNum`),
    index(`tStart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户挂单表';

create table IF NOT EXISTS tbOrderInfo(
    iOrderID bigint unsigned not null comment '抢单号',
    iCommunityID bigint unsigned not null comment '小区ID',
    iSpaceID bigint unsigned not null comment '车位ID',
    iPendingID bigint unsigned not null comment '挂单号',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    tGrobTime datetime not null default '1970-01-01 08:00:00' comment '抢单时间',
    tStart datetime not null default '1970-01-01 08:00:00' comment '起租时间',
    tEnd datetime not null default '1970-01-01 08:00:00' comment '结束时间',
    iPrice int unsigned not null default 0 comment '本单价格',
    iPay int unsigned not null default 0 comment '0 未付款，1 已付款, 2付款超时',
    iStatus int unsigned not null default 0 comment '0 未停车，1 已停车，2 好评，3 中评，4 差评',
    szLiensePlate varchar(1024) default '' comment '用户车牌号',
    primary key (`iOrderID`),
    index(`iCommunityID`),
    index(`tStart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户抢单表';

create table IF NOT EXISTS tbUserOrderInfo(
    iOrderID bigint unsigned not null comment '抢单号',
    iCommunityID bigint unsigned not null comment '小区ID',
    iSpaceID bigint unsigned not null comment '车位ID',
    iPendingID bigint unsigned not null comment '挂单号',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    tGrobTime datetime not null default '1970-01-01 08:00:00' comment '抢单时间',
    tStart datetime not null default '1970-01-01 08:00:00' comment '起租时间',
    tEnd datetime not null default '1970-01-01 08:00:00' comment '结束时间',
    iPrice int unsigned not null default 0 comment '本单价格',
    iPay int unsigned not null default 0 comment '0 未付款，1 已付款',
    iStatus int unsigned not null default 0 comment '0 未停车，1 已停车，2 好评，3 中评，4 差评',
    szLiensePlate varchar(1024) default '' comment '用户车牌号',
    primary key (`iOrderID`),
    index(`iPhoneNum`),
    index(`tStart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户抢单表';

create table IF NOT EXISTS tbGoodsInfo(
    iGoodsID bigint unsigned not null auto_increment comment '商品ID',
    szDesc varchar(1024) default '' comment '商品描述',
    szPicUrl varchar(1024) default '' comment '商品图片可传多个用|分隔',
    tPublishTime datetime not null default '1970-01-01 08:00:00' comment '挂单发布时间',
    iPrice int unsigned not null default 0 comment '需要的积分',
    iNum int unsigned not null default 0 comment '数量',
    iSendNum int unsigned not null default 0 comment '已发送的数量',
    iDelete int unsigned not null default 0 comment '0商品在线， 1商品下架',
    primary key (`iGoodsID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='商品表';

create table IF NOT EXISTS tbUserExchangeInfo(
    iExchangeID bigint unsigned not null comment '兑换ID',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    iGoodsID bigint unsigned not null comment '商品ID',
    tTime datetime not null default '1970-01-01 08:00:00' comment '兑换时间',
    primary key (`iExchangeID`),
    index(`iPhoneNum`),
    index(tTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户兑换商品表';

create table IF NOT EXISTS tbMessageInfo(
    iMessageID bigint unsigned not null comment '消息ID',
    iType int unsigned not null default 0 comment '消息类型',
    szContent varchar(4096) not null default '' comment '消息内容',
    szTitle varchar(1024) not null default '' comment '消息标题',
    dtPublishTime datetime not null default '1970-01-01 08:00:00' comment '消息发布时间',
    primary key (`iMessageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='消息表';

create table IF NOT EXISTS tbMessageBox(
    iMessageID bigint unsigned not null comment '消息ID',
    iPhoneNum bigint unsigned not null comment '用户手机号码',
    iType int unsigned not null default 0 comment '消息类型',
    dtPublishTime datetime not null default '1970-01-01 08:00:00' comment '消息发布时间',
    primary key (`iMessageID`, `iPhoneNum`),
    index(`iPhoneNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment='用户消息盒子表';

