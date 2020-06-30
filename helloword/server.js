let http = require('http');

http.createServer(function (request, response) {

    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/html
    response.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});

    // 发送响应数据 "Hello World"
    response.end('<h1>Hello World! 1111</h1>');
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http:/node/127.0.0.1:8888/');