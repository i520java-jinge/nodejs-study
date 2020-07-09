
//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();
//引入path处理路径
let path=require("path");
//获得根路径
let rootPath=path.join(__dirname,"")
//引入ejs
let ejs = require('ejs');
//引入 cookie-parser
let cookieParser = require('cookie-parser');
//引入 express-session
let session = require("express-session");
// 引入 bodyParser
let bodyParser = require('body-parser');

//引入自定义对的adviceResponse
const adviceResponse = require('./my_modules/adviceResponse');
//引入自定义session权限控制
const sessionControl = require('./my_modules/sessionControl');

//创建express实例
let app = express();

//全局变量
app.locals["loginUser"]=null;

//定义中间件 添加获取全局变量功能
app.use(function (req,res,next) {
      res.locals=app.locals;
      next()
})


//配置body-parser中间件
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());

//使用自定义中间件给response添加功能
app.use(adviceResponse.adviceResponse);

//设置中间件cookieParser 采用采用签名
app.use(cookieParser('123456'));
//设置session中间件
app.use(session({
    name:'i520java-sessionID',//在response中sessionID这个cookie的名称
    secret: '123456', //session 的签名
    resave: true, //强制session保存到session store中 即使没有发生变化
    saveUninitialized: true, //强制存储未初始化的session
    rolling:true, //在每次请求时强行设置cookie
    cookie: {maxAge: 60000*30} //设置返回到前端 key 的属性  即30分钟后session和相应的cookie失效过期
}))



//使用静态资源映射中间件
app.use('/static', express.static(rootPath+'/static'));

//指定模板位置
app.set('views', __dirname + '/template');

//注册 html 模板引擎代码如下:
app.engine('html',ejs.__express);
//设置使用html渲染
app.set('view engine', 'html');

//定义全局变量存储用户信息
app.locals["loginUser"]=null;

//自定义中间件实现session控制
app.use(sessionControl.loginControl)


//挂载系统首页模块路由
const index = require('./routers/index/index.js');
app.use("/",index)


//挂载用户模块路由
const user = require('./routers/user/user.js');
app.use("/user",user)


//挂载商品模块路由
const goods = require('./routers/goods/goods.js');
app.use("/goods",goods)




//监听端口
app.listen(8888,'127.0.0.1');


