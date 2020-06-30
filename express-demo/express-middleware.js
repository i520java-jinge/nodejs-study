

//定义错误中间件
const errorMiddleware = (req, res, next) => {
    console.log('errorMiddleware【错误中间件1】 start')
    res.status(404).send('<h3>404-没有找到对应的路由</h3>');
}


//1.引入express
let express = require('express');
let app = express();

//引入异常中间件
app.use(errorMiddleware)


//2.配置路由
app.get("/",function(req,res,next){
    console.log("------>路由1");
    next();
});

app.get("/",function(req,res){
    console.log("------路由2");
    res.send()
});



//3.监听端口
app.listen(8888,'127.0.0.1');

