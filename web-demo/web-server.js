//1.引入 http 模块
let http=require('http');
// 引入fs模块
let fs=require("fs");

//引入path模块
let path=require("path");

//引入url模块
let url=require("url");

//引入自定义的mime模块
let mime=require("./my_modules/mime")



//2.用 http 模块创建服务
http .createServer(function (req,res){


    // 第一我们先获取请求的名称， http://localhost:8888/index.html
    //注意请求有可能是带参数的 如 /index.html?name=abc
    //这里我们不需要参数 所以使用url.parse 转换一下
    let  pathName=url.parse(req.url).pathname;  //获得是 /index.html

    //不输入地址默认首页
    pathName=pathName==""||pathName=="/"?"index.html":pathName;

   // console.log(pathName);
    //获得后缀名
    let  suffixName=path.extname(pathName);

    //过滤掉favicon.ico 网页图标请求
    if(pathName=="/favicon.ico"){ return; }

    let filePath="./web-demo/html"; //html 文件存放路径
    if(pathName.startsWith("/res")) {
        //就是css、js、images
        filePath="./web-demo";
    }

    // 第二我们根据请求的名字 读取对应的静态资源
    fs.readFile(filePath+pathName,(error,data)=>{


        res.writeHead(200,{"Content-Type":mime.mimeType(suffixName)+";charset=utf-8"});
        if(error){
            console.log(error);
            res.write('<h1>404-您访问的资源不存在！</h1>');

        }else{
            // 第三 响应读取的内容回去就可以了。
            res.write(data);
        }
        res.end(); /*结束响应*/

    })



}).listen(8888);
