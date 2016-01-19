var express = require('express');
var router = express.Router();

/* GET users listing. 业务数据*/
router.get('/index', function(req, res, next) {

  res.render('index', { title: '12' });
});

module.exports = router;
