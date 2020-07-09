

//暴露session权限控制中间件
exports.loginControl=function (req,res,next) {
    //排除不验证的请求
    let excludes=["/user/login.html","/user/login","/","/index.html","/welcome.html"];

    if(excludes.includes(req.url.toString())){ //包含就不验证
        next();
    }else{
        let user=req.session.loginUser;
        if(user!=null&&user.username!=""){
            //设置全局变量值
            res.locals["loginUser"]=user;
            next(); //已经登录继续
        }else{
            //没登录重定向到登录页
            res.redirect("/user/login.html")
        }
    }
}