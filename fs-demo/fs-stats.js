
//引入fs模块
const fs = require("fs");

//**************【获得文件状态信息】*********************************
fs.stat("./fs-demo/files/hello.txt",function (error,stats) {

    if(error){
        console.log(error);
    }else{
        console.log(stats);
        console.log("是文件吗？："+stats.isFile());
        console.log("是目录吗？"+stats.isDirectory());
    }
})
