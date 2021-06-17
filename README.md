# dataUpload
微信小程序 云函数 云存储 腾讯云  

# 本项目功能：上传图片到小程序云存储 视频文件上传到腾讯云
# 从https://github.com/bypanghu/wx_upload/tree/master/utils 改写过来 原文上传到阿里云 这里上传到腾讯云
主要问题在于 腾讯云上传问题  
在utils/uploadFile.js 中签名服务器  
使用小程序的云函数功能 为我们派发签名 这样省去服务器   
签名派发云函数示例  
其他按照官方api文档  
~~~
var querystring = require("querystring");
var crypto = require('crypto');
// 确定 app 的云 API 密钥
var secret_id = "AKIDGMBk24pJWS8XeU4NP9dqwmMhkW1GEuJS";
var secret_key = "tVquiFVUCdrnTs0rRkmX1FCtJTMyJNAg";
// 确定签名的当前时间和失效时间
var current = parseInt((new Date()).getTime() / 1000)
var expired = current + 86400;  // 签名有效期：1天
// 向参数列表填入参数
var arg_list = {
secretId : secret_id,
currentTimeStamp : current,
expireTime : expired,
random : Math.round(Math.random() * Math.pow(2, 32))
}
// 计算签名
var orignal = querystring.stringify(arg_list);
var orignal_buffer = new Buffer(orignal, "utf8");
var hmac = crypto.createHmac("sha1", secret_key);
var hmac_buffer = hmac.update(orignal_buffer).digest();
var signature = Buffer.concat([hmac_buffer, orignal_buffer]).toString("base64");
console.log(signature);
exports.main = async(event,context) =>{
    return {signature:signature}
    
}
~~~
