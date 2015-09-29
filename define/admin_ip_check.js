/*
 * 这个文件定义各种错误的含义
 */

var admin_ip_check = {};
admin_ip_check.IPs =
[
"10.198.14.47",//WARNING::腾讯视频审核的机器IP，请勿删除
"10.150.169.154", 
"10.1.163.59", 
"10.6.221.114", 
];

admin_ip_check.check = function(IP){
    for(var i=0; i<admin_ip_check.IPs.length; i++){
        if(IP == admin_ip_check.IPs[i]){
            return true;
        }
    }
    return false;
};

module.exports = admin_ip_check;
