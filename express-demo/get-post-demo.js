//1.引入
let express = require('express');
let bodyParser = require('body-parser');

//express对象
let app = express();



//静态资源映射
app.use('/public', express.static('./express-demo/public'));
//配置body-parser中间件
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//2.配置路由
app.get('/', function (req, res) {
    res.send('Hello World!');
});



//3.监听端口
//app.listen(8888,'127.0.0.1');
let server = app.listen(8888, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})



//get请求参数
app.get('/process_get', function (req, res) {
    let getParam =req.query;
    console.log(getParam);
    res.end(JSON.stringify(getParam));
})


//post类型参数
app.post('/process_post', function (req, res) {
    let postParam =req.body;
    console.log(postParam);
    res.end(JSON.stringify(postParam));
})
