/**
 * Created by wuyang on 2016/1/19.
 */
//在首页初始化完毕后进行js的签名
$.ajax({
    url: "/getSignature",
    data:{url:location.href.split('#')[0]},
    success: function (data) {
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data.appId, // 必填，公众号的唯一标识
            timestamp:data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature,// 必填，签名，见附录1
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'openProductSpecificView'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        wx.ready(function(){
            wx.hideOptionMenu();

        });

        wx.error(function(res){
            alert("微信js签名错误,请重新进入！");
            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        });

    }
});
//初始化首页
$(document).on("pageInit", "#page1", function(e, pageId, $page) {
    wx.hideOptionMenu();
});
//填写邀请信息页面
$(document).on("pageInit", "#page2", function(e, pageId, $page) {
    wx.hideOptionMenu();
});

//选择地址待定时触发
function changeAddress(){
    $("#address").val("地点待定");
    $("#address").attr("data-id","");
    return true;
}

//选择时间段时触发，开始时间
function time1Change(param){
    var datetime=new Date().Format("yyyy/MM/dd")+" "+param;
    $("#time2").val( new Date(new Date(datetime).getTime()+3600000*2).Format("hh:mm"));
}

//选择时间段时触发，结束时间
function time2Change(param){
    var datetime=new Date().Format("yyyy/MM/dd")+" "+param;
    $("#time1").val( new Date(new Date(datetime).getTime()-3600000*2).Format("hh:mm"));
}

//日期格式化函数
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//表单校验，校验邀请信息是否填写完整
function checkForm(){
    var info="";
    if( $("#day").val().trim()==""|| $("#time1").val().trim()==""||$("#time2").val().trim()==""||$("#address").val().trim()==""){
        info="请将表单填写完整！";
        $.alert(info, function(){
        })
    }
    else{
        //设置地图页面的id
        var id=$("#address").attr("data-id");
        $("#container").attr("data",id);
        $.router.load('#page5', true);
    }
}

//餐厅选择操作,点击餐厅时触发
$(document).on('click','.create-actions', function (e) {
    var id=$(e.currentTarget).attr("data");
    var title=$(e.currentTarget).find(".card-header").text();
    var buttons1 = [
        {
            text: '选中',
            bold: true,
            color: 'success',
            onClick: function() {
                $("#address").val(title);
                $("#address").attr("data-id",id);
                //设置地图页面的id
                $("#container").attr("data",id);
                $.router.load('#page2', true);
            }
        },
        {
            text: '查看地址信息',
            onClick: function() {
                //传入加密参数
                var url='#page4';
                //设置地图页面的id
                $("#container").attr("data",id);
                $.router.load(url, false);
            }
        }
    ];
    var buttons2 = [
        {
            text: '取消',
            bg: 'danger'
        }
    ];
    var groups = [buttons1, buttons2];
    $.actions(groups);
});

//背景操作，滑动列表时触发，去掉遮罩
$(document).on('touchend','.modal-overlay-visible', function (e) {
    $(".actions-modal").remove();
    $(".modal-overlay").removeClass("modal-overlay-visible");
})

//添加餐厅列表
function addItems(id,title,src,content) {
    // 生成新条目的HTML
   var html = '<li class="item-content">' +
                    '<div class="card" style="width:90%">' +
                         '<a href="#" class="create-actions" data="'+id+'">'+
                            '<div class="card-header">'+title+'</div>' +
                            '<div class="card-content">' +
                                '<div class="list-block media-list">' +
                                    '<ul style="padding-left: 0rem;">' +
                                        '<li class="item-content">' +
                                            '<div class="item-media">' +
                                                '<img src="'+src+'" width="60">' +
                                            '</div>' +
                                            '<div class="item-inner">' +
                                                '<div class="item-content">' +
                                                    content +
                                                '</div>' +
                                            '</div>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>' +
                            '</div>' +
                          '</a>'+
                    '</div>' +
            '</li>';
    // 添加新条目
    $('.infinite-scroll-bottom .list-container').append(html);
}

//餐厅列表页面初始化
$(document).on("pageInit", "#page3", function(e, pageId, $page) {
    wx.hideOptionMenu();
    // 加载flag
    var loading = false;
    // 最多可加载的条目
    var maxItems = 100;
    // 每次加载添加多少条目
    var itemsPerLoad = 10;
    var url="http://yuntuapi.amap.com/datasearch/local?tableid=55656259e4b0ccb608f13383&city=武汉市&keywords=&limit="+itemsPerLoad+"&page=1&key=861347745e27c5cc79e4aa86befb961a";
    $.ajax({
        dataType : "jsonp",
        url:url,
        success: function (result) {
            //如果没有显示则进行初始化
            if($('.list-container .card').length==0){
                $(result.datas).each(function(i,val){
                    addItems(val._id,val._name,val._image.length>0?val._image[0]._preurl:'',val._address);
                });
            }
            // 注册'infinite'事件处理函数
            $(document).on('infinite', '.infinite-scroll-bottom',function() {
                // 如果正在加载，则退出
                if (loading) return;
                // 设置flag
                loading = true;
                var lastIndex = $('.list-container .card').length;
                //判断是否全部加载,查看lastIndex是否能整除itemsPerLoad，如果true可能没有全部加载，如果fals全部加载
                if(zhengchu(lastIndex,itemsPerLoad)){
                    // 模拟1s的加载过程
                    setTimeout(function() {
                        var url="http://yuntuapi.amap.com/datasearch/local?tableid=55656259e4b0ccb608f13383&city=武汉市&keywords=&limit="+itemsPerLoad+"&page="+(lastIndex/itemsPerLoad+1)+"&key=861347745e27c5cc79e4aa86befb961a";
                        $.ajax({
                            dataType : "jsonp",
                            url:url,
                            success: function (result) {
                                $(result.datas).each(function(i,val){
                                    addItems(val._id,val._name,val._image.length>0?val._image[0]._preurl:'',val._address);
                                });
                                // 重置加载flag
                                loading = false;
                                //如果获得的结果数量小于默认数量则判断加载完毕
                                if (result.datas.length<itemsPerLoad) {
                                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                                    $.detachInfiniteScroll($('.infinite-scroll'));
                                    // 删除加载提示符
                                    $('.infinite-scroll-preloader').remove();
                                    return;
                                }
                                //容器发生改变,如果是js滚动，需要刷新滚动
                                $.refreshScroller();
                            }
                        })

                    }, 500);
                }
                else{
                    $.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('.infinite-scroll-preloader').remove();
                    return;
                }
            });
        }
    });
});

//判断是否能整除
function zhengchu(x,y){
    var z=Math.floor(x/y);
    if(z*y==x){
        return true;
    }
    else{
        return false;
    }
}

//escape函数
function escape(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

//64位加密
function encode(str) {
    return escape(window.btoa(str));
};

//地图页面初始化
$(document).on("pageInit", "#page4", function(e, pageId, $page) {
    var map=null;
    //构造云数据检索类
    var search = new AMap.CloudDataSearch('55656259e4b0ccb608f13383');
    //根据id查询
    search.searchById($("#container").attr("data"), cloudSearch_CallBack);
    function cloudSearch_CallBack(status, data) {
        var clouddata = data.datas[0];
        //添加marker
        var location = clouddata._location;
        var map = new AMap.Map("container", {
            resizeEnable: true,
            zoom: 12, //地图显示的缩放级别
            center:location
        });
        map.plugin(["AMap.ToolBar"], function() {
            map.addControl(new AMap.ToolBar());
        });
        map.plugin(["AMap.AdvancedInfoWindow"], function() {
            map.addControl(new AMap.AdvancedInfoWindow());
        });
        var marker = new AMap.Marker({
            map: map,
            position: location
        });
        //添加infowindow
        var photo = [];
       // if (clouddata._image[0]) {//如果有上传的图片
       //     photo = ['<img width=240 height=100 src="' + clouddata._image[0]._preurl + '"><br>'];
       // }
        var infoWindow = new AMap.AdvancedInfoWindow({
            content: "<font face=\"微软雅黑\"color=\"#3366FF\">" + clouddata._name + "</font><hr />" + "地址：" + clouddata._address + "<br />",
            autoMove: true,
            offset: {x: 0, y: -30}
        });
        infoWindow.open(map, marker.getPosition());
        marker.on('click', function(e) {
            infoWindow.open(map, marker.getPosition());
        });
    }
});
//加载前
$(document).on("pageAnimationStart", "#page4", function(e, pageId, $page) {

    $("#container").html("");
});

//分享页面的初始化
$(document).on("pageInit", "#page5", function(e, pageId, $page) {
        var day=$("#day").val();
        var time1=$("#time1").val();
        var time2=$("#time2").val();
        var address=$("#address").attr("data-id");
        if(address.trim()!=""){
            //显示用户选择的餐厅
            var url="http://yuntuapi.amap.com/datasearch/id?tableid=55656259e4b0ccb608f13383&_id="+address+"&key=861347745e27c5cc79e4aa86befb961a";
            $.ajax({
                dataType : "jsonp",
                url:url,
                success: function (result) {
                    $(result.datas).each(function(i,val){
                        var html ='<div style="color:red;font-size:25px;padding-top:10px;text-align:center;">邀请单信息</div>'+
                            '<div class="card" style="width:95%">' +
                            '<a href="#page4" data="'+val._id+'">'+
                            '<div class="card-header">'+val._name+'</div>' +
                            '<div class="card-content">' +
                            '<div class="list-block media-list">' +
                            '<ul style="padding-left: 0rem;">' +
                            '<li class="item-content">' +
                            '<div class="item-media">' +
                            '<img src="'+(val._image.length>0?val._image[0]._preurl:'')+'" width="60">' +
                            '</div>' +
                            '<div class="item-inner">' +
                            '<div class="item-content">' +
                                 val._address +
                            '</div>' +
                            '</div>' +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>' +
                            '<div class="card-footer">'+
                                '<span>邀请日期： '+day+'</span><br>'+
                                '<span style="padding-top: 5px;">到店时间： '+time1+' 到 '+time2+' 之间</span>'+
                            '</div>'+
                            '</a>'+
                            '</div>';
                        // 添加新条目
                        $('#info').html(html);
                    });
                }
            });
        }
        else{
            //如果是地址待定的情况,给出推荐餐厅信息，待补充。
            $("#info").html("");
        }
});
//加载前
$(document).on("pageAnimationStart", "#page5", function(e, pageId, $page) {
    wx.showOptionMenu();
    $("#info").html("");
    $("#mask").removeClass("modal-overlay-visible");
});

//分享按钮操作
function share(){
    //弹出遮罩层让指导用户操作
    $("#mask").addClass("modal-overlay-visible");
}
/*
var title='一伙锅';
var desc='您发起的一伙锅邀请！';
var link='http://awuyangc.xicp.net&inviteId='+inviteId; // 分享链接
var imgUrl='http://awuyangc.xicp.net/origin/img/c/qrcode_for_gh_be461b35d165_258.jpg'; // 分享图标
wx.onMenuShareAppMessage({
    title: title, // 分享标题
    desc: desc, // 分享描述
    link: link, // 分享链接
    imgUrl: imgUrl, // 分享图标
    type: '', // 分享类型,music、video或link，不填默认为link
    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
    success: function () {
        // 用户确认分享后执行的回调函数
    },
    cancel: function () {
        // 用户取消分享后执行的回调函数
    }
});
*/