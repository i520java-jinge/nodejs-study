//1.引入
let express = require('express');
let app = express();

//2.配置路由
app.get('/', function (req, res) {
    res.send('Hello World!');
});

//静态资源映射
app.use('/public', express.static('./express-demo/public'));

//3.监听端口
//app.listen(8888,'127.0.0.1');
let server = app.listen(8888, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
