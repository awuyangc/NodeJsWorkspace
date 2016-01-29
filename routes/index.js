var express = require('express');
var signature = require('wx_jsapi_sign');
var API=require('wechat-api');
var OAuth=require('wechat-oauth');
var mongoose = require('mongoose');
var mgSchema=require('../models/mg_schema.js');
var config =require('../config')();
var base64url=require("base64-url");
var client=new OAuth(config.appId, config.appSecret);
var router = express.Router();

/* 默认首页 */
router.get('/', function(req, res, next) {
    //首先获取用户信息
    if(req.session.current_user!=null){
        console.log("用户session存在直接进入");
        res.render('index', { title:'重构中！！！' ,wx_user: req.session.current_user});
    }
    else {
        //进入授权流程
        console.log("用户session不存在进入授权流程");
        var url = client.getAuthorizeURL('http://' + config.domain + '/callback','','snsapi_userinfo');
        res.redirect(url)
    }
});
//首页跳转
router.get('/index', function(req, res, next) {
    res.render('index', { title:'重构中！！！' ,wx_user: req.session.current_user});
});
//邀请页面跳转
router.get('/invite', function(req, res) {
    res.render('invite', { title:'一伙锅' });
});

//分享页面跳转
router.get('/share', function(req, res) {
    var day=base64url.decode(base64url.unescape(req.query.day));
    var time1=base64url.decode(base64url.unescape(req.query.time1));
    var time2=base64url.decode(base64url.unescape(req.query.time2));
    var address=base64url.decode(base64url.unescape(req.query.address));
    res.render('share', { day:day,time1:time1,time2:time2,address:address});
});

//用于微信的接入
router.get('/checkSignature', function(req,res) {
    signature.checkSignature(config)(req,res,function() {
    console.log("接入不成功");
    });
});

//进行签名
router.get('/getSignature', function(req, res){
    var url=req.query.url;
  signature.getSignature(config)(url, function(error, result) {
    if (error) {
      res.json({
        'error': error
      });
    } else {
      res.json(result);
    }
  });
});

//添加菜单
router.get('/menu', function(req, res){
    var menu=
    {
        "button":[
        {
            "name":"火锅走起",
            "sub_button":[
                {
                    "type":"view",
                    "name":"立即邀约好友",
                    "url":"http://awuyangc.xicp.net/"
                },
                {
                    "type":"view",
                    "name":"查看我的邀约",
                    "url":"http://awuyangc.xicp.net/"
                }]
        }]
    };
    //wxAPI1(appid, appsecret, getToken, saveToken)createMenu(menu,function(){
    var api = new API(config.appId, config.appSecret);
    /*
    api.removeMenu(function(err, result){
        console.log(result);
    });
    */
    api.createMenu(menu, function(err, result){
        console.log(result);
    });
    //});
});

/**
 * 认证授权后回调函数
 *
 * 1、引导用户进入授权页面同意授权，获取code
 2、通过code换取网页授权access_token（与基础支持中的access_token不同）
 3、如果需要，开发者可以刷新网页授权access_token，避免过期
 4、通过网页授权access_token和openid获取用户基本信息（支持UnionID机制）
 */
router.get('/callback', function(req, res) {
    console.log('----微信开始回调-----')
    var code = req.query.code;
    var User = mgSchema.user;
    client.getAccessToken(code, function (err, result) {
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        console.log('token=' + accessToken);
        console.log('openid=' + openid);
        //查询本地数据库看是否存在此User
        User.findOne({openid:openid}, function(err, user){
            console.log('开始查询本地数据库是否有此用户')
            if(err || user == null|| user.length==0){
                console.log('本地数据库没有此用户,向微信发起获取用户详细信息的请求');
                client.getUser(openid, function (err, result) {
                    var oauth_user = result;
                    var _user = new User(oauth_user);
                    _user.save(function(err, user) {
                        if (err) {
                            console.log('保存用户失败 ....' + err);
                        } else {
                            console.log('保存用户成功 ....');
                            req.session.current_user = _user;
                            res.redirect('/index');
                        }
                    });

                });
            }else{
                console.log('根据openid查询，用户已经存在，转到首页');
                req.session.current_user = user;
                res.redirect('/index');
            }
        });
    });
});

//保存邀请单信息
router.get('/saveInviteInfo', function(req, res) {
    var InviteInfo = mgSchema.invite;
    var _inviteInfo=new InviteInfo();
    _inviteInfo.openid= req.session.current_user.openid;
    _inviteInfo.day=base64url.decode(base64url.unescape(req.query.day));
    _inviteInfo.time_begin=base64url.decode(base64url.unescape(req.query.time1));
    _inviteInfo.time_end=base64url.decode(base64url.unescape(req.query.time2));
    _inviteInfo.address=base64url.decode(base64url.unescape(req.query.address));
    _inviteInfo.save(function(err, invite) {
        if (err) {
            console.log('保存用户失败 ....' + err);
        } else {
            console.log('保存用户成功 ....');
            //返回id
            var resAjax={
                _id:invite._id.toString(),
                nickName: req.session.current_user.nickname
            };

            res.json(resAjax);
        }
    });

})


//进入报名页的处理
router.get('/check_sign', function(req, res) {
    var inviteId=base64url.decode(base64url.unescape(req.query.inviteId));
    //查找对应的邀请信息
    var InviteInfo = mgSchema.invite;
    //查询本地数据库看是否存在此邀请单
    //注意此方法是异步的
    InviteInfo.findOne({_id:mongoose.Types.ObjectId(inviteId)}, function(err, inviteInfo){
        console.log('开始查询本地数据库的邀请单信息')
        if(err || inviteInfo == null|| inviteInfo.length==0){
            console.log('本地数据库没有此邀请单');
            //跳转到error页面
            res.render('error', {info:"没有邀请单"});
        }else{
            console.log('根据_id查询，邀请单存在，将邀请单信息存入session');
            req.session.inviteInfo = inviteInfo;
            //首先获取用户信息
            if(req.session.current_user!=null){
                console.log("用户session存在直接进入");
                res.redirect("/sign");
            }
            else {
                //进入授权流程
                console.log("用户session不存在进入授权流程");
                var url = client.getAuthorizeURL('http://' + config.domain + '/sign_callback','','snsapi_userinfo');
                res.redirect(url)
            }
        }
    });
});

//报名页跳转
router.get('/sign', function(req, res) {
        //首先获取邀请单信息
        var  inviteInfo=req.session.inviteInfo;
        //通过邀请单获取邀请人的信息
         var User = mgSchema.user;
    User.findOne({openid:inviteInfo.openid}, function(err, user){
        console.log('开始查询本地数据库的邀请单信息')
        if(err || inviteInfo == null|| inviteInfo.length==0){
            console.log('本地数据库没有用户');
            //跳转到error页面
            res.render('error', {info:"没有找到邀请人信息"});
        }else{
            res.render('sign', { title:'重构中！！！' ,wx_user: req.session.current_user,inviteInfo:inviteInfo,inviteUser:user});
        }
    });

});
//报名页的用户授权
router.get('/sign_callback', function(req, res) {
    console.log('----微信开始回调-----')
    var code = req.query.code;
    var User = mgSchema.user;
    client.getAccessToken(code, function (err, result) {
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        console.log('token=' + accessToken);
        console.log('openid=' + openid);
        //查询本地数据库看是否存在此User
        User.findOne({openid:openid}, function(err, user){
            console.log('开始查询本地数据库是否有此用户')
            if(err || user == null|| user.length==0){
                console.log('本地数据库没有此用户,向微信发起获取用户详细信息的请求');
                client.getUser(openid, function (err, result) {
                    var oauth_user = result;
                    var _user = new User(oauth_user);
                    _user.save(function(err, user) {
                        if (err) {
                            console.log('保存用户失败 ....' + err);
                        } else {
                            console.log('保存用户成功 ....');
                            req.session.current_user = _user;
                            res.redirect('/sign');
                        }
                    });

                });
            }else{
                console.log('根据openid查询，用户已经存在，转到报名页');
                req.session.current_user = user;
                res.redirect('/sign');
            }
        });
    });
});


module.exports = router;
