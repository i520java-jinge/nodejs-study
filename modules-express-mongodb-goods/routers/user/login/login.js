
//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();

//引入path处理路径
let path=require("path");
//获得根路径
let rootPath=path.join(__dirname,"../../../")


// 引入 自定义封装mongodbjs
const mongojs = require(rootPath+'/my_modules/my-mongojs.js');
//引入MD5
let md5=require("md5-node")



//登录页面
router.get("/login.html",function (req,res) {
    res.render("user/login")
})


//登录请求处理
router.post("/login",function (req,res) {

    //获得登录数据(接收到的就是json格式)
    let param=req.body;
    //给密码加密
    param.password=md5(param.password);

    mongojs.find("user",param,function (data) {
        if(data!=null){
            //取第一条数据
            let user=data[0];
            //存储到session中
            req.session.loginUser=user;
            //存储到全局变量
            res.locals["loginUser"]=user;
            //重定向到首页
            res.redirect("/goods/index.html");
        }else{
            //查询不到数据
            res.alertAndRedirectUrl("用户名或密码错误!","/user/login.html");
        }
    })

})

//退出
router.get("/logout",function (req,res) {
    req.session.loginUser=null;
    res.locals["loginUser"]=null;
    res.redirect("/welcome.html")
})


//暴露这个 router模块
module.exports = router;