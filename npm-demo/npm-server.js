
let  dateUtil =require("silly-datetime");
let http = require('http');

http.createServer(function (request, response) {


    response.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});

    let  dateStr=dateUtil.format(new Date(),'YYYY-MM-DD HH:mm:ss');


    response.end('<h1>当前系统时间为:'+dateStr+'</h1>');


}).listen(8888);

// 终端打印如下信息
console.log('Server running at http:/node/127.0.0.1:8888/');
