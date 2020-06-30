
/**
* *****【引入模块】******************************************/
//url模块
let url=require('url');
// 引入querystring模块
let querystring=require("querystring")
// 引入fs模块
let fs=require("fs");
//引入path模块
let path=require("path");
//引入ejs模块
const  ejs=require("ejs");
//引入自定义的mime模块
let mime=require("../my-module/mime")


 //定义server函数用于调用执行
 function server() {

     //定义全局变量记录注册的get和post请求
     let  globalData=this;
     this._get={};
     this._post={};
     this.ejsTemplatePath="/template"; //ejs模板的路径
     //静态资源路径 例如 js css image 等
     //例如 app.addStaticPaths("/static/**","./router-demo/static")
     this.staticPaths=new Map();
     
     

    //定义APP函数，这个函数主要用于替换http.createServer(function(request,response){}) 中的函数
    //这样只要有请求就执行我们的这个函数
    let  app=function (request,response) {

        //记录当前的请求对象和响应对象
        app.request=request;
        app.response=response;





        //暂不处理网页图标
        if(request.url.indexOf("favicon.ico")!=-1) return;

        //获得请求的名称 例如：/login、/login.html、/reister.html
        let  pathname= url.parse(request.url).pathname;

        //不输入地址默认首页
        pathname=pathname==""||pathname=="/"?"/index.html":pathname;



        //判断是否是静态资源请求
        let isStaticUrl=false;

        let  filePath=null;
        for(let key of globalData.staticPaths.keys()){

            //处理映射名称和实际文件路径
            //假设如下：
            //  /static/**  对应  ./router-demo/static
            //  /res        对应  ./router-demo/res
            // 访问请求是  /static/css/style.css(可以访问)
            // 访问请求是  /res/style.css(可以访问)   /res/css/style.css(拒绝访问 因为没有加/**)
            let  mappingUrl=null;
            if(key.endsWith("/**")){
                mappingUrl=key.substring(0,key.lastIndexOf("/"))
                filePath=globalData.staticPaths.get(key)+(pathname.substring(pathname.indexOf(mappingUrl)+mappingUrl.length));
            }else{
                mappingUrl=key.substring(key.lastIndexOf("/"))
                filePath=globalData.staticPaths.get(key)+(pathname.substring(pathname.lastIndexOf("/")));
            }
            if(request.url.indexOf(mappingUrl)!=-1){
                isStaticUrl=true;
                break;
            }
        }
        if(isStaticUrl){//是静态资源直接渲染
            //获得后缀名
            let  suffixName=path.extname(pathname);

            fs.readFile(filePath,(error,data)=>{

                response.writeHead(200,{"Content-Type":mime.mimeType(suffixName)+";charset=utf-8"});
                if(error){
                    console.log(error);
                    response.write('<h1>404-您访问的静态资源不存在！</h1>');
                    response.write('<h2>Error static file :'+pathname+'</h2>');
                }else{
                    // 第三 响应读取的内容回去就可以了。
                    response.write(data);
                }
                response.end(); /*结束响应*/

            })

        }else{


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
                request.body=postStr;  /*表示拿到post的值*/


                //请求的类型 get | post
                let method=request.method.toLowerCase();
                console.log("----->请求的类型："+method);
                //获得get参数
                let paramStr=''

                if(method.toLowerCase()=="get")   {
                    paramStr= url.parse(request.url).query;
                }else{
                    //post数据 对url进行解码（url会对中文进行编码）
                    paramStr=decodeURI(postStr);;
                }
                //
                console.log("---->url.query参数:"+paramStr);

                //转换成JSON参数
                let jsonParam=querystring.parse(paramStr);
                console.log(JSON.stringify(jsonParam));




                //给request对象补充一个属性 那么注册的使用者快速获取参数
                request.jsonParam=jsonParam;

                //给response 补充方法重定向新地址 用户也可以直接使用app.redirectUrl 调用
                response.redirectUrl=app.redirectUrl;
                //给response 补充方法直接渲染ejs模板数据 用户也可以直接使用app.renderEjsFile 调用
                response.renderEjsFile=app.renderEjsFile;
                //给response 补充方法直接渲染JSON数据
                response.responseJson=app.responseJson;
                //给response 补充方法直接渲染弹出提示 跳转
                response.alertAndRedirectUrl=app.alertAndRedirectUrl

                //判断是否注册了请求处理方式
                if(globalData['_'+method][pathname]){ //已经注册
                    //调用全局变量中注册的请求回调函数  这里额外传递一个jsonParam 方便获取数据 用户可以接收也可以不接收，也可以通过上面request的补充属性获取
                    globalData['_'+method][pathname](request,response,jsonParam);
                }else{ //没有注册请求
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.write('<h1>404-您访问的资源不存在！</h1>');
                    response.write('<h2>Error URL:'+pathname+'</h2>');
                    response.end(); /*结束响应*/
                }



            })
        }

    }


     /**
      * 用户只需要获得app对象即可以注册请求 例如:
      *   //注册一个登录请求处理 我们把这个名字和回调函数 都保存在全局变量中，这样只要有请求进入app函数，直接执行即可
      *   app.get("/login",function(request,response){
      *
      *   })
      *
      * */
     //注册get请求方法
     app.get=function (requestPath,callback) {
        //放入全局变量存储
         globalData._get[requestPath]=callback;
     }

     //注册post请求方法
     app.post=function (requestPath,callback) {
         //放入全局变量存储
         globalData._post[requestPath]=callback;
     }



     //设置els模板的路径
     app.setEjsTemplatePath=function (path) {
         //els模板的路径 如果是/结束的 去除/防止后面的拼接路径错误
         if(path.endsWith("/")) path=path.substring(1);
         globalData.ejsTemplatePath=path;
     }

     //添加静态资源路径
     app.addStaticPath=function(mappingUrl,staticPath){
         //如果是/结束的 去除/防止后面的拼接路径错误
         if(staticPath.endsWith("/")) staticPath=staticPath.substring(1);
         globalData.staticPaths.set(mappingUrl,staticPath);
     }

     //设置静态资源路径 多个路径用逗号间隔
     app.setStaticPath=function(jsonObj){
        if(typeof (jsonObj) =="object"){
            let map=new Map();
            for(let key in jsonObj){
                map.set(key,jsonObj[key]);
            }
            globalData.staticPaths=map;
        }
        throw  "--->设置多个静态资源映射路径错误，参数必须是JSON对象";
     }


     //渲染响应ejs模板
     app.renderEjsFile=function (ejsFileName,ejsData) {
         //判断文件名是否是/开头 不是的补充/ 不然下面的拼接文件路径就错误了
         if(!ejsFileName.startsWith("/")) ejsFileName="/"+ejsFileName;

         //判断是否添加ejs后缀名，没有则补充
         if(!ejsFileName.endsWith(".ejs")) ejsFileName+=".ejs";

         if(ejsData==null) ejsData={};
         // 第二我们根据请求的名字 读取对应的静态资源
         ejs.renderFile(globalData.ejsTemplatePath+ejsFileName,ejsData,(error,data)=>{

             app.response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
             if(error){
                 console.log(error);
                 app.response.write('<h1>404-您访问的ejs资源不存在,无法渲染页面！</h1>');
                 app.response.write('<h2>Error Ejs Template :'+ejsFileName+'</h2>');
             }else{
                 // 第三 响应读取的内容回去就可以了。
                 app.response.write(data);
             }
             app.response.end(); /*结束响应*/

         })
     }

     //重定向到新的地址
     app.redirectUrl=function (url) {
         app.response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
         app.response.write('<script>window.location=\''+url+'\'</script>');
         app.response.end(); /*结束响应*/
     }

     //弹出提示重定向到新的地址
     app.alertAndRedirectUrl=function (msg,url) {
         app.response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
         app.response.write('<script>alert(\''+msg+'\');window.location=\''+url+'\';</script>');
         app.response.end(); /*结束响应*/
     }

     //响应json数据
     app.responseJson=function (data) {
         //如果参数是对象就就转换成JSON字符串
         if(typeof (data)=="object") data=JSON.stringify(data);
         app.response.writeHead(200,{"Content-Type":"application/json;charset=utf-8"});
         app.response.write(data);
         app.response.end(); /*结束响应*/
     }




     return  app; //返回app

 }

 //导出模块app
exports.app=server();