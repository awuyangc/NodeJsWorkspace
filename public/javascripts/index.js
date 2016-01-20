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
//添加列表
function addItems(number, lastIndex) {
    // 生成新条目的HTML
    var html = '';
    for (var i = lastIndex + 1; i <= lastIndex + number; i++) {
       /* html += '<li class="item-content">' +
                    '<div class="card" style="width:80%">' +
                        '<div class="card-header">新的公布:</div>' +
                        '<div class="card-content">' +
                        '<div class="list-block media-list">' +
                            '<ul style="padding-left: 0rem;">' +
                                '<li class="item-content">' +
                                    '<div class="item-media">' +
                                        '<img src="http://gqianniu.alicdn.com/bao/uploaded/i4//tfscom/i3/TB10LfcHFXXXXXKXpXXXXXXXXXX_!!0-item_pic.jpg_250x250q60.jpg" width="44">' +
                                    '</div>' +
                                    '<div class="item-inner">' +
                                        '<div class="item-title-row">' +
                                            '<div class="item-title">标题</div>' +
                                        '</div>' +
                                        '<div class="item-subtitle">子标题</div>' +
                                    '</div>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
                */
        html += '<li class="item-content"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></li>';
    }

    // 添加新条目
    $('.infinite-scroll-bottom .list-container').append(html);

}

//
$(document).on("pageInit", "#page3", function(e, pageId, $page) {
    var url="http://yuntuapi.amap.com/datasearch/local?tableid=55656259e4b0ccb608f13383&city=武汉市&keywords=&limit=10&page=1&key=861347745e27c5cc79e4aa86befb961a";
    $.ajax({
        dataType : "jsonp",
        url:url,
        success: function (result) {
            $(result.datas).each(function(i,val){

            });
            // 加载flag
            var loading = false;
            // 最多可加载的条目
            var maxItems = 100;
            // 每次加载添加多少条目
            var itemsPerLoad = 10;
            var lastIndex = $('.list-container li').length;
            //如果没有数据则预先加载20条
            if(lastIndex==0){
                addItems(itemsPerLoad, 0);
                //上次加载的序号
                lastIndex = itemsPerLoad;
            }
            // 注册'infinite'事件处理函数
            $(document).on('infinite', '.infinite-scroll-bottom',function() {
                // 如果正在加载，则退出
                if (loading) return;
                // 设置flag
                loading = true;
                // 模拟1s的加载过程
                setTimeout(function() {
                    // 重置加载flag
                    loading = false;
                    if (lastIndex >= maxItems) {
                        // 加载完毕，则注销无限加载事件，以防不必要的加载
                        $.detachInfiniteScroll($('.infinite-scroll'));
                        // 删除加载提示符
                        $('.infinite-scroll-preloader').remove();
                        return;
                    }
                    // 添加新条目
                    addItems(itemsPerLoad, lastIndex);
                    // 更新最后加载的序号
                    lastIndex = $('.list-container li').length;
                    //容器发生改变,如果是js滚动，需要刷新滚动
                    $.refreshScroller();
                }, 500);
            });
        }
    });
});