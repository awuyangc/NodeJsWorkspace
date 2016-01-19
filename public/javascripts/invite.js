/**
 * Created by Administrator on 2016/1/19.
 */
function changeAddress(){
    $("#address").val("地点待定");
    return true;
}

function time1Change(param){
    var datetime=new Date().Format("yyyy/MM/dd")+" "+param;
    $("#time2").val( new Date(new Date(datetime).getTime()+3600000*2).Format("hh:mm"));
}

function time2Change(param){
    var datetime=new Date().Format("yyyy/MM/dd")+" "+param;
    $("#time1").val( new Date(new Date(datetime).getTime()-3600000*2).Format("hh:mm"));
}

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

function checkForm(){
    var info="";
    if( $("#day").val().trim()==""|| $("#time1").val().trim()==""||$("#time2").val().trim()==""||$("#address").val().trim()==""){
        info="请将表单填写完整！";
        $.alert(info, function(){
        })
    }
    else{
        window.location.href="/share";
    }

}