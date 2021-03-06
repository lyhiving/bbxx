var app = getApp();
var util = require("./../../utils/util.js");
var toast = require('../../template/toast/index.js');

Page({
    name:'upload-index',
    data : {
        toast:{
            show: false,
            isMask: false,
            content: ''
        },
        thumbImgs : [],//编辑商品时候才有的
        imgs: [],
        title: '',
        maxImg : 15,//最大上传商品数量
    },

    showError : function(obj){
        app.showAlert({
            title: obj.title || "提示",
            content: obj.str
        });
    },

    save : function(){
        var _this = this,
            data = _this.data;
        var formVerify = require("./../../modules/lib/formVerify");

        if(!data.imgs.length){
            toast.show(this,'请选择美照哦');
            return;
        }

        if(!data.title){
            toast.show(this,'加点对美照的描述哦');
            return;
        }
        _this.setData({
            saveIng : true
        });

        util.request({
            url : app.globalData.domain.request+"/wx.php?m=weapp&act=AddPhoto",
            data : {
                token: app.globalData.userInfo.token || '',
                title : data.title,
                imgs : data.imgs.join('$!'),
            },
            complete : function(){
                _this.setData({
                    saveIng : false
                });
            },
            success : function(res){
                util.checkAjaxResult({
                    data : res.data,
                    success : function(rt){
                        toast.show(_this,'上传美照成功');
                        _this.setData({
                            thumbImgs : [],//编辑商品时候才有的
                            imgs: [],
                            title: ''
                        });
                    }
                });
            }
        });
    },

    delImg : function(e){
        var index = e.currentTarget.dataset.index;
        console.log("当前位置第"+ index +"个");
        //开始删除数组项
        var imgs = this.data.imgs;

        if(!imgs.length){
            return;
        }
        this.data.thumbImgs.splice(index,1);
        imgs.splice(index,1);

        this.setData({
            "imgs" : imgs,
            "thumbImgs" : this.data.thumbImgs
        });
    },

    addImg : function() {

        var _this = this;

        wx.chooseImage({
            count : _this.data.maxImg - _this.data.imgs.length,//当前最多可以选择的图片数量
            success : function(data){
                console.log(data);
                var upImgs = data.tempFilePaths,
                    upImgsLength = upImgs.length;

                console.log(upImgs);

                if(!upImgsLength){
                    console.log("图片路径错误");
                    return;
                }

                wx.showToast({
                    title: '加载中',
                    icon: 'loading',
                    duration: 10000
                });

                var errorNum = 0,
                    successNum = 0,
                    imgs = _this.data.imgs,
                    thumbImgs = _this.data.thumbImgs;

                //开始循环上传
                (function multiImgUpload(i){
                    console.log(i);

                    if(i === upImgsLength){
                        console.log("结束");
                        wx.hideToast();

                        if(errorNum){
                            _this.showError({
                                title : "上传完成",
                                str : "上传结果：成功"+ successNum +"个 失败"+ errorNum +"个"
                            });
                        }
                        _this.setData({
                            "imgs" : imgs,
                            thumbImgs : thumbImgs
                        });

                        return;
                    }

                    // var _arguments = arguments;

                    wx.uploadFile({
                        url : app.globalData.domain.request+"/wx.php?m=weapp&act=Upload",
                        filePath : upImgs[i],
                        name : "file",
                        /*
                        header : {
                            "param" : JSON.stringify({
                                userID : app.globalData.shopInfo.shopId,
                                result_format : "JSON",
                                response_type : "JSON"
                            }),
                            "file[]" : url[i]
                        },
                         formData : {
                         "file" : upImgs[i]
                         },
                        */
                        complete : function(){
                            //上传完毕 不论成与否 都继续下一个
                            console.log("--complete");
                            // _arguments.callee(++i);
                            multiImgUpload(++i);
                        },
                        success : function(rt){
                            console.log("--success");
                            console.log(rt);

                            util.checkAjaxResult({
                                data : JSON.parse(rt.data),
                                success : function(data){

                                    var imgUrl = data.result;

                                    imgs.push(imgUrl);
                                    thumbImgs.push(imgUrl);//url[i] 用本地图片当小图 需要解决压缩变形问题

                                    successNum++;
                                },
                                error : function(data){
                                    errorNum++;
                                }
                            });
                        },
                        fail : function(err){
                            console.log(err);
                            errorNum++;
                        }
                    });
                }(0));

            },
            fail : function(err){
                console.log("fail");
                console.log(err);
            }
        });
    },

    imageLoadErr: function(e){

        var url = e.currentTarget.dataset.url,
            index = e.currentTarget.dataset.index;
        this.data.thumbImgs[index] = ~url.indexOf('?')?'&':'?'+'e';
        this.setData({
            thumbImgs:this.data.thumbImgs
        });
    },

    previewImg : function(e){
        var index = e.currentTarget.dataset.index,
            arr = this.data.imgs;

        wx.previewImage({
            current : arr[index],
            urls : arr
        });
    },

    bindInputChange : function(e){
        var target = e.currentTarget.dataset.target,
            val = e.detail.value;

        if(target == "title"){
            this.setData({
                "title" : val
            });
        }

    },

    onLoad: function(e){

    }
});
