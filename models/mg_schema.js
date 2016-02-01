/**
 * Created by Administrator on 2016/1/9.
 */
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/ehuoguo');//；连接数据库
var Schema = mongoose.Schema;   //  创建模型
var userScheMa = new Schema({
    openid:String,
    nickname: String,
    sex:String,
    country:String,
    province:String,
    city:String,
    headimgurl:String,
    unionid:String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.user = db.model('c_wx_user', userScheMa); //  与users集合关联

var inviteScheMa = new Schema({
    openid:String,
    day: String,
    time_begin:String,
    time_end:String,
    address:String,
    create_time:String,
    status:String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.invite = db.model('c_invite_info', inviteScheMa); //  与users集合关联

var invitePersonScheMa = new Schema({
    inviteid: String,
    create_time:String,
    user:[{type: Schema.Types.ObjectId, ref: 'user'}],
    suggest:String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.invitePerson = db.model('c_invite_person', invitePersonScheMa); //  与users集合关联

/*
var invitePersonScheMa = new Schema({
    inviteid: String,
    openid:String,
    create_time:String,
    suggest:String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.invitePerson = db.model('c_invite_person', invitePersonScheMa); //  与users集合关联
*/