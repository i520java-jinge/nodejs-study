
//定义中间件给response 添加功能
const alertAndRedirectUrl = (request,response, next) => {

    //弹出提示重定向到新的地址
    response.alertAndRedirectUrl=function (msg,url) {
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.write('<script>alert(\''+msg+'\');window.location=\''+url+'\';</script>');
        response.end(); /*结束响应*/
    }
    next()
}

let  userMap=new Map();//存储注册数据(数据库连接后面讲解)

//引入express
let express = require('express');
//引入ejs
let ejs = require('ejs');
//引入 cookie-parser
let cookieParser = require('cookie-parser');
//引入 express-session
let session = require("express-session");
// 引入 bodyParser
let bodyParser = require('body-parser');

//创建express实例
let app = express();


//配置body-parser中间件
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//使用自定义中间件给response 添加功能
app.use(alertAndRedirectUrl);
//设置中间件cookieParser 采用采用签名
app.use(cookieParser('123456'));
//设置session中间件
app.use(session({
    name:'i520java-sessionID',//在response中sessionID这个cookie的名称
    secret: '123456', //session 的签名
    resave: true, //强制session保存到session store中 即使没有发生变化
    saveUninitialized: true, //强制存储未初始化的session
    rolling:true, //在每次请求时强行设置cookie
    cookie: {maxAge: 60000} //设置返回到前端 key 的属性  即60s后session和相应的cookie失效过期
}))

//使用静态资源映射中间件
app.use('/static', express.static('./express-demo/static'));



//指定模板位置
app.set('views', __dirname + '/template');

//注册 html 模板引擎代码如下:
app.engine('html',ejs.__express);
//设置使用html渲染
app.set('view engine', 'html');


//3.监听端口
app.listen(8888,'127.0.0.1');




// 6：注册一个登录页面请求测试
app.get("/login.html",function (request,response) {

    let remindUser=request.signedCookies.remindUser;
    if(remindUser!=null){ //有cookie
        remindUser=JSON.parse(remindUser);
    }else{
        remindUser={username:'',password:''}
    }
    response.render("login",{msg:null,remindUser:remindUser});
});

// 注册一个注册页面请求测试
app.get("/register.html",function (request,response) {
    response.render("register");
});

// 注册一个首页页面请求测试
app.get("/index.html",function (request,response) {

     let  loginUser=request.session.loginUser;
    let  loginUserName=loginUser!=null?JSON.parse(loginUser).username:null;
    response.render("index",{loginUserName:loginUserName});
});



// 注册请求处理
app.post("/register",function (request,response) {

    //获得参数数据
    let  user=request.body;
    //我们还没有学如何使用数据库，这里就直接使用全局变量代替
    //判断用户名是否已经被注册
    let hasUser=false;
    for (let key of userMap.keys()) {
        if(key==user.username){
            hasUser=true;
            break;
        }
    }

    if(hasUser){
        //给出提示渲染跳转注册页 //当然也可以直接渲染注册页面给出提示
        response.alertAndRedirectUrl("用户名已经被注册","/register.html");
    }else{
        userMap.set(user.username,user);
        response.alertAndRedirectUrl("注册成功！你可以去登录了","/login.html");
    }
});


// 注册请求处理
app.post("/login",function (request,response) {

    //获得参数数据
    let  user=request.body;
    //我们还没有学如何使用数据库，这里就直接使用全局变量代替
    //判断用户名是否已经被注册
    let hasUser=false;
    for (let key of userMap.keys()) {
        if(key==user.username){
            hasUser=true;
            break;
        }
    }
    if(!hasUser){
        //直接渲染登录页面给出提示
        response.render("login",{msg:"此用户未注册"});
    }else if(userMap.get(user.username).password!=user.password){
        //直接渲染登录页面给出提示
        response.render("login",{msg:"用户名或密码错误！"});
    }else{
        //存储到session
        let jsonUser=JSON.stringify(userMap.get(user.username));
        request.session.loginUser=jsonUser;
        //成功去主页 这里的redirect方法是express扩展的 就和我们之前自定义理由扩展的一样

        if("remind"==user.remind){ //用户勾选的记住我
            //添加cookie有签名需要加signed :true 设置30秒后失效
            response.cookie("remindUser",jsonUser,{maxAge: 1000*30, httpOnly: true,signed :true});
        }

        response.redirect("/index.html");
    }
});

//退出
app.get("/logOut",function (request,response) {
    //销毁session
    request.session.destroy(function(err){
        if(!err){
            //这里的redirect方法是express扩展的 就和我们之前自定义理由扩展的一样
            response.redirect("/index.html");
        }else{
            console.log(err);
            response.alertAndRedirectUrl("系统错误，无法退出","/index.html");
        }

    })
})

