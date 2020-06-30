
//1.引入express
let express = require('express');
let app = express();

//指定模板位置
app.set('views', __dirname + '/template');
//设置使用ejs渲染
app.set("view engine","ejs");


//3.监听端口
app.listen(8888,'127.0.0.1');



//路由处理请求
app.get("/",function(req,res){
    //渲染响应
    res.render("hello",{
        "msg" : "hello 这是Express 中渲染的ejs模板"

    })

})
