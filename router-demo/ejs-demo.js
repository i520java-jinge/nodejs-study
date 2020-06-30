
const  http=require("http");
const  ejs=require("ejs");
const  url=require("url");

http.createServer(function (request,response) {


    //暂不处理网页图标
    if(request.url.indexOf("favicon.ico")!=-1) return;

    let pathname =url.parse(request.url).pathname;


    if(pathname=="/demo.html"){

        let citys=["广州市","合肥市","珠海市"];
        let users=[{name:"悟空",nickName:"弼马温",born:'1990-09-09'},{name:"李四",nickName:"天蓬元帅",born:'1990-09-09'}]

        let data={msg:"hello ejs!",citys:citys,users:users};


        //直接渲染输出html
        ejs.renderFile("./router-demo/template/demo.ejs",data,function (err,str) {

            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            if(err){
                console.log(err);
                response.write("<h1>404，访问不存在的模板！</h1>")
            }else{
                response.write(str);
            }
            response.end();
        });
    }





}).listen(8888);