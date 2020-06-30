//中间件1
const middleware1 = (req, res, next) => {
    console.log('middleware【中间件1】 start')
    next()
}
//中间件2
const middleware2 = (req, res, next) => {
    console.log('middleware【中间件2】 start')
    //next()
}
//中间件3
const middleware3 = (req, res, next) => {
    console.log('middleware【中间件3】 start')
    next()
}

//1.引入express
let express = require('express');
let app = express();

//引入中间件
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);


//2.配置路由
app.get('/', function (req, res) {
    console.log('------>业务代码 Hello World!')
    res.send('-------->Hello World!');
});

//3.监听端口
app.listen(8888,'127.0.0.1');

