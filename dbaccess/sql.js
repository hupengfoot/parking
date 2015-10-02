module.exports.sqls = {
    //下标为1-10000的用于select语句
    '1': ' * from tbUserInfo where iPhoneNum = ?',
    '2': ' * from tbUserPasswd where iPhoneNum = ?',
    '3': 'szLiensePlate from tbUserInfo where iPhoneNum = ?',
    '4': ' * from tbParkingSpaceInfo where iPhoneNum = ? and iDelete = 0',
    '5': ' * from tbParkingSpaceInfo where iPhoneNum = ? and iDelete = 0 and iSpaceID = ?',
    '6': ' * from tbCommunityInfo where iCommunityID = ?',
    '7': ' * from tbCommunityInfo where iProvince = ? and iCity = ? and (szCommunityName like "%!%" or szAddressName like "%!%")',
    '8': ' * from tbUserPendingInfo_! where iPendingID > ? and iPhoneNum = ? ! limit !',
    '9': ' *from tbPendingInfo_! where iStatus = 0 and iPendingID > ? and iCommunityID = ? ! limit !',
    '10':' *from tbPendingInfo_! where iPendingID = ?', 
    '11': ' * from tbCommunityInfo where iCommunityID = ?',
    '12':' * from tbOrderInfo_! where iOrderID = ?',
    '13':'* from tbUserOrderInfo_! where iPhoneNum = ? and iOrderID > ? ! limit !',
    '14':' * from tbParkingSpaceInfo where iSpaceID = ?',
    '15':' * from tbGoodsInfo where iGoodsID > ? and iDelete = 0 limit !',
    '16':' * from tbGoodsInfo where iGoodsID = ? and iDelete = 0',
    '17':' *from tbUserExchangeInfo_! where iPhoneNum = ? and iExchangeID > ? limit !',
    '18':' * from tbCommunityInfo where iCommunityID in(!)',
    '19':'* from tbParkingSpaceInfo where iSpaceID in(!)',
    '20':'* from tbMessageBox_! as b left join tbMessageInfo_! as m on b.iMessageID = m.iMessageID where b.iPhoneNum = ? and b.iMessageID > ? ! order by b.iMessageID desc limit !',
    '21': ' * from tbGoodsInfo where iGoodsID in(!)  and iDelete = 0',
    '22':' * from tbAnnounceInfo where iAnnounceID > ? ! limit !',
    '23':' * from tbCommunityInfo where iProvince = ? and iCity = ?',
    '24':'* from tbParkingSpaceInfo where iCommunityID = ? and iDelete = 0',
    '25':'* from tbPendingInfo_! where iCommunityID = ? and iPendingID > ? ! limit !',
    //下标10000-20000的用于update语句
    '10001': ' tbUserPasswd set szPasswd = ? where iPhoneNum = ?',
    '10002': ' tbUserInfo set szUserName = ?, szRealName = ?, szMail = ?, szLiensePlate = ?, szAddress = ?, szModels = ?, szBankCard = ?, szBankAddress = ?, iHasComplete = ?, szAlipay = ?, szAlipayNickname = ? where iPhoneNum = ?', 
    '10003': ' tbUserInfo set szLiensePlate = ? where iPhoneNum = ?',
    '10004': ' tbParkingSpaceInfo set iDelete = 1 where iPhoneNum = ? and iSpaceID = ?',
    '10005': ' tbParkingSpaceInfo set szParkingNum = ?, iParkingType = ?, iParkingNature = ?, tTime = now() where iPhoneNum = ? and iSpaceID = ?', 
    '10006': ' tbPendingInfo_! set iStatus = ? where iPendingID = ? and iStatus = 0',
    '10007': ' tbUserPendingInfo_! set iStatus = ? where iPendingID = ?',
    '10008': ' tbPendingInfo_! set iStatus = ? where iPendingID = ?',
    '10009': ' tbOrderInfo_! set iPay = ? where iOrderID = ?',
    '10010': ' tbUserOrderInfo_! set iPay = ? where iOrderID = ?',
    '10011': ' tbOrderInfo_! set iStatus = ? where iOrderID = ? and iStatus < ?',
    '10012': 'tbParkingSpaceInfo set iStatus = ? where iSpaceID = ?',
    '10013': ' tbOrderInfo_! set iPay = ? where iOrderID = ? and iPay = 0',
    '10014': ' tbUserOrderInfo_! set iStatus = ? where iOrderID = ? and iStatus < ?',
    '10015': ' tbParkingSpaceInfo set iHasApprove = 1 where iSpaceID = ?',
    '10016': ' tbGoodsInfo set iDelete = ? where iGoodsID = ?',
    '10017': ' tbUserInfo set iScore = iScore + (!) where iPhoneNum = ? and iScore > - (!)',
    '10018': ' tbGoodsInfo set iNum = iNum + (!) where iGoodsID = ? and iNum > -(!)',
    '10019': ' tbPendingInfo_! set iStatus = ? where iPendingID = ?',
    '10020': ' tbUserPendingInfo_! set iStatus = ? where iPendingID = ?',
    '10021': ' tbUserInfo set iRentTime = iRentTime + ? where iPhoneNum = ?',
    '10022': ' tbUserInfo set iOrderTime = iOrderTime + ? where iPhoneNum = ?',
    '10023':' tbParkingSpaceInfo set szParkingNum = ?, szParkingPic = ?, iParkingType = ?, iParkingNature = ? where iPhoneNum = ? and iSpaceID = ?',
    '10024': ' tbUserInfo set iScore = IF(iScore > - (!), iScore + (!), 0) where iPhoneNum = ?',
    '10025': 'tbUserInfo set iCredit = iCredit + ? where iPhoneNum = ?', 
    '10026': ' tbUserInfo set iForbidden = ? where iPhoneNum = ?',
	
    //下标20000-30000的用于insert语句
    '20001': 'into tbUserInfo (iPhoneNum, tRegisterTime, iRoleType) values(?, now(), 1)',
    '20002': 'into tbUserPasswd (iPhoneNum, szPasswd) values(?, ?)',
    '20003': 'into tbParkingSpaceInfo(iPhoneNum, iCommunityID, szParkingNum, szParkingPic, iParkingType, iParkingNature, tTime) values(?, ?, ?, ?, ?, ?, now())',
    '20004': 'into tbCommunityInfo(iChargesType, iPer, iPerPrice, iMaxPrice, szX, szY, iProvince, iCity, szCommunityName, szAddressName, szPicUrl, tTime) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())',
    '20005': ' into tbPendingInfo_!(iPendingID, iCommunityID, iPhoneNum, iSpaceID, tStart, tEnd, iMiniRental, tPublishTime) values(?, ?, ?, ?, ?, ?, ?, now())',
    '20006':' into tbUserPendingInfo_!(iPendingID, iCommunityID, iPhoneNum, iSpaceID, tStart, tEnd, iMiniRental, tPublishTime) values(?, ?, ?, ?, ?, ?, ?, now())', 
    '20007': ' into tbOrderInfo_!(iOrderID, iCommunityID, iSpaceID, iPendingID, iPhoneNum, tGrobTime, tStart, tEnd, iPrice, szLiensePlate) values(?, ?, ?, ?, ?, now(), ?, ?, ?, ?)',
    '20008': ' into tbUserOrderInfo_!(iOrderID, iCommunityID, iSpaceID, iPendingID, iPhoneNum, tGrobTime, tStart, tEnd, iPrice, szLiensePlate) values(?, ?, ?, ?, ?, now(), ?, ?, ?, ?)',
    '20009': ' into tbGoodsInfo(szDesc, szPicUrl, tPublishTime, iPrice, iNum) values(?, ?, now(), ?, ?)',
    '20010':' into tbUserExchangeInfo_! (iExchangeID, iPhoneNum, iGoodsID, tTime) values(?, ?, ?, now())',
    '20011':'into tbMessageInfo_! (iMessageID, iType, szContent, szTitle, dtPublishTime) values(?, ?, ?, ?, now())',
    '20012':'into tbMessageBox_! (iMessageID, iPhoneNum, iType, dtPublishTime) values(?, ?, ?, now())',
    '20013':' into tbAnnounceInfo(szDetailUrl, szImgUrl, tPublishTime) values(?, ?, now())',
    //下标30000-40000的用于delete语句
    //下标40000-50000的用于replace语句
};
