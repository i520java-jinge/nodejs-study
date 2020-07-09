
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

//引入MD5
let md5=require("md5-node")

// 引入 mongodb
const MongoClient = require('mongodb').MongoClient;
// 连接字符串(由于我的单机版做了安全认证所以参数必不可少)
//如果你没有安全认证可以使用 const url = 'mongodb://localhost:27017';
const url = 'mongodb://user_demo:123456@localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=mongo_demo&authMechanism=SCRAM-SHA-256';
//数据库名称
const dbName = 'mongo_demo';

//创建express实例
let app = express();



//配置body-parser中间件
//parse application/x-www-form-urlencoded
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
    cookie: {maxAge: 60000*30} //设置返回到前端 key 的属性  即30分钟后session和相应的cookie失效过期
}))



//使用静态资源映射中间件
app.use('/static', express.static('./express-mongodb-goods/static'));

//指定模板位置
app.set('views', __dirname + '/template');

//注册 html 模板引擎代码如下:
app.engine('html',ejs.__express);
//设置使用html渲染
app.set('view engine', 'html');

//定义全局变量存储用户信息
app.locals["loginUser"]=null;

//自定义中间件实现session控制
app.use(function (req,res,next) {
    //排除不验证的请求
    let excludes=["/login.html","/login"];
    if(excludes.includes(req.url.toString())){ //包含就不验证
        next();
    }else{
        let user=req.session.loginUser;
        if(user!=null&&user.username!=""){
            //设置全局变量值
            app.locals["loginUser"]=user;
            next(); //已经登录继续
        }else{
            //没登录重定向到登录页
            res.redirect("/login.html")
        }
    }
})


//监听端口
app.listen(8888,'127.0.0.1');


//登录页面
app.get("/login.html",function (req,res) {

    res.render("login")
})

//登录请求处理
app.post("/login",function (req,res) {

    //获得登录数据(接收到的就是json格式)
    let param=req.body;
    //给密码加密
    param.password=md5(param.password);


    MongoClient.connect(url, function(err, client) {
        if(err==null){
            console.log("------------>数据库连接成功！");
            let result = client.db(dbName).collection("user").find(param);

            result.toArray(function (err,data) {
                if(data!=null&&data.length>0){ //能够查询到数据
                    //去取第一条数据
                    let user=data[0];
                    //存储到session中
                    req.session.loginUser=user;
                    //重定向到首页
                    res.redirect("/index.html");
                }else{
                    //查询不到数据
                    res.alertAndRedirectUrl("用户名或密码错误!","/login.html");
                }
            })
            client.close();
        }else{
            console.error("------------>数据库连接失败！");
        }
    });
})

//退出
app.get("/logout",function (req,res) {
    req.session.loginUser=null;
    app.locals["loginUser"]=null;
    res.redirect("/login.html")
})




//首页
app.get("/index.html",  function (req, res) {


    //定义一个分页对象方便后面传递数据渲染
    let pageObj = {
        page: 1, //当前页码 默认第一页
        limit: 4, //每页显示的数据量,
        totalPage: 0,//总页数
        count: 0,//总共的数据量,
        keyword: "",//搜索的关键词也就是商品名称name
        data: null //当前页的数据
    }


    //接收参数数据 假设如:{name:'鼠标',page:1}
    let param = req.query;
    let query = {}; //MongoDB查询参数
    //有二个参数（商品名称、当前页数） 参数有可能不传递
    //判断是否有name参数或者keyword参数(都是按照商品名称):
    if (param.hasOwnProperty('name') || param.hasOwnProperty('keyword')) {
        //记录搜的关键词
        pageObj.keyword = param.name || param.keyword;
        if(pageObj.keyword!="")
        query = {name: {$regex: eval("/" + pageObj.keyword + "/i")}}
    }



    //链接数据库
    MongoClient.connect(url,function (err, client) {
        if (err == null) {
            console.log("------------>数据库连接成功！");
            console.log(query);
            //条件查询获取总共的数据量
            client.db(dbName).collection("goods").find(query).count(function (err, count) {
                pageObj.count = count;


                //计算总页数:
                let nump=parseInt(pageObj.count / pageObj.limit)
                pageObj.totalPage = pageObj.count % pageObj.limit == 0 ? nump :nump + 1;


                //判断是否有页码page参数
                if (param.hasOwnProperty("page")) {
                    //覆盖默认值
                    pageObj.page = parseInt(param.page);
                }
                //判断页码的合理性
                if (pageObj.page < 1) pageObj.page = 1;
                if (pageObj.page > pageObj.totalPage) pageObj.page = pageObj.totalPage;


                //查询当前页数据
                //正则表达式中使用变量。一定要使用eval将组合的字符串进行转换，不能直接将字符串拼接后传入给表达式。否则没有报错信息，只是结果为空！
                //limit(数据量).skip(跳过的数据量)  skip取值个mysql的分页中的一样(skip=(当前的页码-1)*每页显示数据量)
                console.log(query);
                let result = client.db(dbName).collection("goods").find(query).limit(pageObj.limit).skip((pageObj.page - 1) * pageObj.limit);

                result.toArray(function (err, data) {
                    if (data != null && data.length > 0) { //能够查询到数据
                        //取数据
                        pageObj.data =data;
                        console.log( pageObj.data[0].name);
                    }
                    console.log(err);
                    //不管是否有数据都要渲染首页
                    res.render("index", {tag: 'index', page: pageObj})

                })
                client.close();
            });

        } else {
            console.error("------------>数据库连接失败！");
            //查询不到数据
            res.render("error", {status: "500", msg: "服务器异常,请稍后再试试！<a href='/index.html'>返回主页</a>"});
        }
    });


})



//编辑
app.get("/edit.html",function (req,res) {

    res.render("edit",{tag:'edit'})
})

//增加
app.get("/add.html",function (req,res) {

    res.render("edit",{tag:'add'})
})



