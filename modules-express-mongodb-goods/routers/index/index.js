//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();


//首页欢迎页面
router.get("/",function (req,res) {
    res.render("index/index");
})

//首页欢迎页面
router.get("/index.html",function (req,res) {
    res.render("index/index");
})

//首页欢迎页面
router.get("/welcome.html",function (req,res) {
    res.render("index/index");
})


//暴露这个 router模块
module.exports = router;