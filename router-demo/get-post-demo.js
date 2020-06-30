
let  http=require("http");
let  url=require("url");
let querystring=require("querystring")


http.createServer(function (request,response) {

    //暂不处理网页图标
    if(request.url.indexOf("favicon.ico")!=-1) return;

    //请求的类型
    let method=request.method;
    console.log("----->请求的类型："+method);

    //获得参数
    let paramStr=url.parse(request.url).query;
    console.log("---->url.query参数:"+paramStr);

    //转换成JSON参数
    let paramJson=querystring.parse(paramStr);
    console.log(JSON.stringify(paramJson));


    //监视获取post的值
    //创建空字符叠加数据片段
    let postStr = '';

    //注册data事件接收数据（每当收到一段表单提交的数据，该方法会执行一次）
    request.on('data', function (chunk) {
        // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
        postStr += chunk;
    });
    //当接收表单提交的数据完毕之后，就可以进一步处理了
    //注册end事件，所有数据接收完成会执行一次该方法
    request.on('end',function() {
        request.body = postStr;  /*表示拿到post的值*/
        console.log(postStr);
    })


    response.end()

}).listen(8888);