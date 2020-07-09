
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

//定义中间件给response 添加功能
const alertAndBack = (request,response, next) => {

    //弹出提示重定向到新的地址
    response.alertAndBack=function (msg) {
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.write('<script>alert(\''+msg+'\');history.back();</script>');
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
// 引入 multiparty
let multiparty = require('multiparty');
let multipartyOptions={
    maxFieldsSize: 1024*1024*20,   //设置20M 单位字节 默认大小为2MB
    uploadDir:__dirname + '/static/images' //上传文件存放的路径
}
//创建multiparty的for没对象
let form =function () {
    return new multiparty.Form(multipartyOptions);
}
let util = require('util');
//引入fs
let fs = require('fs');

// 引入 自定义封装mongodbjs
const mongojs = require('./my_modules/my-mongojs');


//创建express实例
let app = express();



//配置body-parser中间件
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//使用自定义中间件给response 添加功能
app.use(alertAndRedirectUrl);
app.use(alertAndBack);

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

    mongojs.find("user",param,function (data) {
        if(data!=null){
            //取第一条数据
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

    mongojs.count("goods",query,function (count) {
        if(count>0){
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
            mongojs.find("goods",query,function (data) {
                if(data!=null){
                    //取数据
                    pageObj.data =data;
                }
                //不管是否有数据都要渲染首页
                res.render("index", {tag: 'index', page: pageObj})
            },pageObj.limit,(pageObj.page - 1) * pageObj.limit)

        }else{
            //查询不到数据
            res.render("error", {status: "500", msg: "服务器异常,请稍后再试试！<a href='/index.html'>返回主页</a>"});
        }
    })

})






//增加页面
app.get("/add.html",function (req,res) {

    res.render("add",{tag:'add'})
})

//增加处理
app.post("/add",function (req,res) {

    form().parse(req, function(err, fields, files) {
        if(err==null){
            //查看fields的数据结构
            //console.log(fields);
            let goods={}; //商品对象
            goods.name=fields.name[0];
            goods.price=fields.price[0];
            goods.free=fields.free[0];
            goods.description=fields.description[0];
            console.log(goods);

            //获得文件数据
            let imgJson =files.coverImg[0];
            if(imgJson.size>0){ //有图片处理

                //重名图片获得http访问路径
                goods.coverImg=renameGetHttpPath(imgJson,req);

            }else{
                goods.coverImg="";
                //调用删除缓存成功图片
                if(files!=null)  deleteCoverImg(files.coverImg[0].path,false);
            }

            mongojs.insertMany("goods",[goods],function (count) {
                if(count>0){
                    res.alertAndRedirectUrl("增加成功!","/index.html?keyword="+goods.name);
                }else{
                    //调用删除上传成功图片
                    deleteCoverImg(goods.coverImg);
                    res.alertAndBack("增加商品失败");

                }
            })

        }else{
            //调用删除缓存成功图片
            if(files!=null)  deleteCoverImg(files.coverImg[0].path,false);
            res.alertAndBack("增加商品失败");

        }

    });
    return;
})



//编辑
app.get("/edit.html",function (req,res) {

    let  param=req.query;
    if(param._id){
        param._id=mongojs.ObjectID(param._id);
        mongojs.find("goods",param,function (data) {
            if(data!=null){
                //渲染编辑页面
                res.render("edit",{tag:'edit',goods:data[0]})
            }else{
                res.alertAndBack("查询不到相关数据！");
            }
        })
    }else{
        res.alertAndBack("参数传递错误！");
    }

})

//修改处理
app.post("/update",function (req,res) {

    form().parse(req, function(err, fields, files) {
        if(err==null){
            //查看fields的数据结构
            //console.log(fields);
            let goods={}; //商品对象

            //修改的对象主键
            let query={_id:mongojs.ObjectID(fields['_id'][0])}

            goods.name=fields.name[0];
            goods.price=fields.price[0];
            goods.free=fields.free[0];
            goods.description=fields.description[0];
            console.log(goods);

            //获得文件数据
            let imgJson =files.coverImg[0];
            if(imgJson.size>0){ //有图片处理

                //重名图片获得http访问路径
                goods.coverImg=renameGetHttpPath(imgJson,req);

            }else{
                //调用删除缓存成功图片
                if(files!=null)  deleteCoverImg(files.coverImg[0].path,false);
            }
            //先查询原来的数据（主要获得原来图片的路径方便删除）

            mongojs.find("goods",query,function (data) {

                if(data!=null){  //有原数据

                    //修改数据
                    mongojs.updateOne("goods",query,goods,function (count) {
                        if(count>0){
                            let oldCover=data[0].coverImg;
                            if(goods.coverImg){ //有传递新图片 才删除就图片
                                //调用删除原来的图片
                                deleteCoverImg(oldCover);
                            }


                            res.alertAndRedirectUrl("修改成功!","/index.html?keyword="+goods.name);
                        }else{
                            //调用删除上传成功图片
                            deleteCoverImg(goods.coverImg);
                            res.alertAndBack("修改商品失败");
                        }
                    })

                }else{
                    //调用删除上传成功图片
                    deleteCoverImg(goods.coverImg);
                    res.alertAndBack("修改商品失败，商品信息不存在！");
                }

            })

        }else{
            //调用删除缓存成功图片
           if(files!=null) deleteCoverImg(files.coverImg[0].path,false);
            res.alertAndBack("修改商品失败");
        }

    });
    return;
})



//删除
app.get("/delete",function (req,res) {


    let  param=req.query;
    if(param._id){
        param._id=mongojs.ObjectID(param._id);

        mongojs.find("goods",param,function (data) {

            if(data!=null) {  //有原数据
                mongojs.deleteOne("goods",param,function (count) {
                    if(count>0){
                        let oldCover=data[0].coverImg;
                        //调用删除图片
                        deleteCoverImg(oldCover);
                        res.alertAndRedirectUrl("删除成功",req.headers.referer)
                    }else{
                        res.alertAndBack("查询不到相关数据！");
                    }
                })
            }else{
                res.alertAndBack("删除商品失败，商品信息不存在！");
            }

        })
    }else{
        res.alertAndBack("参数传递错误！");
    }
})


/**
 * 删除封面图片
 * @param coverPath 删除的图片路径
 * @param isDbPath(可选 默认值true)  是否是数据库存储http路径(http://localhost:8888/static/images.xxxx.png)
 *        false 表示就是直接是文件路径
 */
function deleteCoverImg(path,isDbPath) {
    if(path!=""){ //有原图 异步删除不影响修改
        if(isDbPath==null||isDbPath) {//数据库http路径
            //获得图片名称
            path=path.substring(path.lastIndexOf("/"));
            //拼接真实路劲
            path=multipartyOptions.uploadDir+path;
        }
        // 检查文件是否存在于当前目录中。
        fs.access(path, fs.constants.F_OK, (err) => {
            if(err==null){
                console.log("---------->文件存在--执行删除！");
                fs.unlink(path,function (err){
                    if(err!=null){
                        console.log("图片删除错误，路径:"+path);
                    }
                })
            }

        });
    }
}


/**
 * 重命名图片 返回http访问地址
 * @param imgJson
 * @param req
 * @returns {string}
 */
function renameGetHttpPath(imgJson,req) {

    //获得文件后缀名
    let  endName=imgJson.originalFilename.substring(imgJson.originalFilename.lastIndexOf("."));
    //新名字
    let  newName="i520java-"+new Date().getTime()+endName;
    let newPath=imgJson.path.substring(0,imgJson.path.lastIndexOf("/")+1)+newName;

    //拼接http图片路径
    let httpPath=req.headers.origin+"/static/images/"+newName;

    // 检查文件是否存在于当前目录中。
    fs.access(imgJson.path, fs.constants.F_OK, (err) => {
        if(err==null) {
            //异步重命名文件名
            fs.rename(imgJson.path, newPath, function (err) {
                if (err != null) {
                    console.log("-----重名图片错误！");
                }
            })
        }
    })
    return  httpPath;
}
