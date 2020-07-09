/**
 * 自定义增强response的中间件
 * 你可以继续增加其他功能
 */

//定义中间件给response 添加功能
const alertAndRedirectUrl = (request,response) => {
    //弹出提示重定向到新的地址
    response.alertAndRedirectUrl=function (msg,url) {
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.write('<script>alert(\''+msg+'\');window.location=\''+url+'\';</script>');
        response.end(); /*结束响应*/
    }
}

//定义中间件给response 添加功能
const alertAndBack = (request,response) => {
    //弹出提示重定向到新的地址
    response.alertAndBack=function (msg) {
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.write('<script>alert(\''+msg+'\');history.back();</script>');
        response.end(); /*结束响应*/
    }
}

//暴露出增强response的中间件
exports.adviceResponse=function(request,response, next) {
    alertAndBack(request,response);
    alertAndRedirectUrl(request,response);
    next()
}