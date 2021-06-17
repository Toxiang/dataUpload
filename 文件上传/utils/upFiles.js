
/* 使用小程序端上传sdk*/
const VodUploader = require("../lib/vod-wx-sdk-v2.js");

// 选择图片
var chooseImage = (t, count) =>{
    wx.chooseImage({
        count: count,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            var imgArr = t.data.upImgArr || [];
            let arr = res.tempFiles;
            // console.log(res)
            arr.map(function(v,i){
                v['progress'] = 0;
                imgArr.push(v)
            })
            t.setData({
                upImgArr: imgArr
            })
            let upFilesArr = getPathArr(t);
            if (upFilesArr.length > count-1) {
                let imgArr = t.data.upImgArr;
                let newimgArr = imgArr.slice(0, count)
                t.setData({
                    upFilesBtn: false,
                    upImgArr: newimgArr
                })
            }
        },
    });
}

// 选择视频
var chooseVideo = (t,count) => {
    wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        compressed:true,
        camera: 'back',
        success: function (res) {
            let videoArr = t.data.upVideoArr || [];
            let videoInfo = {};
            // 设置视频属性
            videoInfo['tempFilePath'] = res.tempFilePath;
            videoInfo['size'] = res.size;
            videoInfo['duration'] = res.duration;
            videoInfo['height'] = res.height;
            videoInfo['width'] = res.width;
            videoInfo['thumbTempFilePath'] = res.thumbTempFilePath;
            videoInfo['progress'] = 0;
            videoArr.push(videoInfo)
            t.setData({
                upVideoArr: videoArr
            })
            let upFilesArr = getPathArr(t);
            if (upFilesArr.length > count - 1) {
                t.setData({
                    upFilesBtn: false,
                })
            }
        }
    })
}

// 获取 图片和视频合并数组 判断是否大于0
var getPathArr = t => {
    let imgarr = t.data.upImgArr || [];
    let upVideoArr = t.data.upVideoArr || [];
    let imgPathArr = [];
    let videoPathArr = [];
    imgarr.map(function (v, i) {
        imgPathArr.push(v.path)
    })
    upVideoArr.map(function (v, i) {
        videoPathArr.push(v.tempFilePath)
    })
    let filesPathsArr = imgPathArr.concat(videoPathArr);
    return filesPathsArr;
}

// 上传图片到云数据库
var upLoadImg = (t)=>{
    let filesArr = t.data.upImgArr
    for(var i =0 ;i<filesArr.length;i++){
        let file = filesArr[i]
        console.log(file['path'])
        let filePath = file['path']
        wx.cloud.uploadFile({
            cloudPath:'images/'+Date.now()+'.jpg',
            filePath:filePath,
            success:function success(res){
                console.log(res.fileID);
                wx.cloud.callFunction({
                    name:'addImage',
                    data:{
                        ID:res.fileID
                    },
                    success: function success(res) {
                        wx.showToast({
                            title: "上传完成",
                        });

                    },
                    fail: function fail(err) {
                        console.log(err);
                    },
                });
            },
            fail: function fail(err) {
                console.log(err);
            }
        })
    }
    
    // t.setData({
    //     upImgArr:[]
    // })
}

// 获取签名 url：通过T云函数，实现签名的服务端获取
var getSignature = (callback)=>{
    wx.request({
        url: 'signature派发url',
        
        success: function (res) {
        console.log("res:",res)
        if (res.data) {
            // console.log("sig",res)
            callback(res.data.signature);
        } else {
            return '获取签名失败';
        }
        }
    });
  }

//   上传完成后清空
var reset = ()=>{
    console.log("清空上传列表")
}

// 上传视频到腾讯云
var upLoadVideo = (t)=>{
    console.log("上传视频到腾讯云")
    let filesArr = t.data.upVideoArr;
    for(var i=0;i<filesArr.length;i++){
        let file = filesArr[i];
        // console.log(file);
        wx.showLoading({
            title: '处理中',
            mask: true,
          })
        const uploader = VodUploader.start({
            mediaFile:file,
            getSignature: getSignature,
            mediaName:"test",
            coverFile:null,
            error: function(result) {
                console.log("error");
                console.log(result);
                wx.hideLoading();
                wx.showModal({
                  title: "上传失败",
                  content: JSON.stringify(result),
                  showCancel: false
                });
              },
              progress: function(res) {
                console.log("progress");
                console.log(res);
                wx.hideLoading();
                // filesArr[i].setData({
                //     progress:res.percent * 100
                // })
                
                console.log("***********************")
                console.log(t.data.progress)
              },
              finish: function(result) {
                console.log("finish");
                console.log(result);
                wx.hideLoading();
                wx.showModal({
                  title: "上传成功",
                  content:
                    "fileId:" + result.fileId + "\nvideoName:" + result.videoName,
                  showCancel: false
                });
                reset();
              }
        })
    }
}

var upFilesFun = (t, data, progress, success) =>{
    let _this = t;
    let url = data.url;
    let filesPath = data.filesPathsArr ? data.filesPathsArr : getPathArr(t);
    let imgarr = t.data.upImgArr || [];
    let upVideoArr = t.data.upVideoArr || [];
    let name = data.name || 'file';
    let formData = data.formData || {};
    let startIndex = data.startIndex ? data.startIndex : 0;
    let successNumber = data.successNumber ? data.successNumber : 0;
    let failNumber = data.failNumber ? data.failNumber : 0;
    if (filesPath.length == 0) {
    //   success([]);
      wx.showToast({
        title: "请选择文件",
        icon: 'none' 
    });
      return;
    }
    if(imgarr.length>0){
        upLoadImg(t) 
    }
    if(upVideoArr.length>0){
        upLoadVideo(t)
    }


    // uploadTask.onProgressUpdate((res) => {
    //     res['index'] = startIndex;
    //     // console.log(typeof (progress));
    //     if (typeof (progress) == 'function') {
    //         progress(res);
    //     }
    //     // console.log('上传进度', res.progress)
    //     // console.log('已经上传的数据长度', res.totalBytesSent)
    //     // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    // })

}


module.exports = { chooseImage, chooseVideo, upFilesFun, getPathArr}
