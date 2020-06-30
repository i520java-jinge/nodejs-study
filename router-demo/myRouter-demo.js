
//1.引入 http 模块
let http=require('http');

//2.引入 myRouter 路由模块
let myRouter=require('./my-module/myRouter');


//3：获得路由中的app对象
let  app=myRouter.app;

let  userMap=new Map();//存储注册数据

let  loginUser=null//存储登录用户


//4:设置ejs 模板的路径
app.setEjsTemplatePath("./router-demo/template");
//设置静态资源映射
app.addStaticPath("/static/**","./router-demo/static")
//也可以这样设置静态资源映射
//app.setStaticPath({"/static/**":"./router-demo/static","/res/**":"./router-demo/res"})

//5:创建web服务 注意这里就使用定义的app函数代替了之前函数
http.createServer(app).listen(8888);



// 6：注册一个登录页面请求测试
app.get("/login.html",function (request,response) {
    //渲染login页面显示 后缀名.ejs可以写也可以不不写  也可以写成 response.renderEjsFile('login')
    app.renderEjsFile("login.ejs",{msg:null});
});

// 注册一个注册页面请求测试
app.get("/register.html",function (request,response) {
    app.renderEjsFile("register");
});

// 注册一个首页页面请求测试
app.get("/index.html",function (request,response) {
    let  loginUserName=loginUser!=null?loginUser.username:null;
    app.renderEjsFile("index",{loginUserName:loginUserName});
});



// 注册请求处理
app.post("/register",function (request,response) {

    //获得参数数据
    let  user=request.jsonParam;
    //我们还没有学如何使用数据库，这里就直接使用全局变量代替
    //判断用户名是否已经被注册
    let hasUser=false;
    for (let key of userMap.keys()) {
        if(key==user.username){
            hasUser=true;
            break;
        }
    }

    if(hasUser){
        //给出提示渲染跳转注册页 //当然也可以直接渲染注册页面给出提示
        app.alertAndRedirectUrl("用户名已经被注册","/register.html");
    }else{
        userMap.set(user.username,user);
        app.alertAndRedirectUrl("注册成功！你可以去登录了","/login.html");
    }
});


// 注册请求处理
app.post("/login",function (request,response) {

    //获得参数数据
    let  user=request.jsonParam;
    //我们还没有学如何使用数据库，这里就直接使用全局变量代替
    //判断用户名是否已经被注册
    let hasUser=false;
    for (let key of userMap.keys()) {
        if(key==user.username){
            hasUser=true;
            break;
        }
    }
    if(!hasUser){
        //直接渲染登录页面给出提示
        app.renderEjsFile("login",{msg:"此用户未注册"});
    }else if(userMap.get(user.username).password!=user.password){
        //直接渲染登录页面给出提示
        app.renderEjsFile("login",{msg:"用户名或密码错误！"});
    }else{
        //暂时还有讲解怎么存储到session(后面会讲解)  先用变量代替
        loginUser=userMap.get(user.username);
        //成功去主页
        app.redirectUrl("/index.html");
    }
});
//退出
app.get("/logOut",function (request,response) {
    loginUser=null;
    app.redirectUrl("/index.html");
})







