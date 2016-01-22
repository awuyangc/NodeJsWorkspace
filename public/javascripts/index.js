/**
 * Created by Administrator on 2016/1/19.
 */
//选择地址待定时触发
function changeAddress(){
    $("#address").val("地点待定");
    return true;
}
//选择时间段时触发
function time1Change(param){
    var datetime=new Date().Format("yyyy/MM/dd")+" "+param;
    $("#time2").val( new Date(new Date(datetime).getTime()+3600000*2).Format("hh:mm"));
}
//选择时间段时触发
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

//表单校验
function checkForm(){
    var info="";
    if( $("#day").val().trim()==""|| $("#time1").val().trim()==""||$("#time2").val().trim()==""||$("#address").val().trim()==""){
        info="请将表单填写完整！";
        $.alert(info, function(){
        })
    }
    else{
        //window.location.href="/share";
        $.router.load('/share', true);
    }
}

//餐厅选择操作
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
                $.router.load('#page2', true);
            }
        },
        {
            text: '查看地址信息',
            onClick: function() {
                //传入加密参数
                var param=encode(id);
                var url='/map?id='+param;
                $.router.load(url, true);
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

//背景操作

$(document).on('touchmove','.modal-overlay-visible', function (e) {
    $(".actions-modal").remove();
    $(".modal-overlay").removeClass("modal-overlay-visible");
})
//添加列表
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
            $(result.datas).each(function(i,val){
                //初始化
                addItems(val._id,val._name,val._image.length>0?val._image[0]._preurl:'',val._address);
            });
            // 注册'infinite'事件处理函数
            $(document).on('infinite', '.infinite-scroll-bottom',function() {
                // 如果正在加载，则退出
                if (loading) return;
                // 设置flag
                loading = true;
                var lastIndex = $('.list-container .card').length;
                // 模拟1s的加载过程
                setTimeout(function() {
                    var url="http://yuntuapi.amap.com/datasearch/local?tableid=55656259e4b0ccb608f13383&city=武汉市&keywords=&limit="+itemsPerLoad+"&page="+(lastIndex/itemsPerLoad+1)+"&key=861347745e27c5cc79e4aa86befb961a";
                    $.ajax({
                        dataType : "jsonp",
                        url:url,
                        success: function (result) {
                            $(result.datas).each(function(i,val){
                                //初始化
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
            });
        }
    });
});

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