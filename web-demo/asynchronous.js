

let  fs=require("fs");

// 引入 events 模块
var events = require('events');

var Even tEmitter =new events .EventEmitter() ; /*实例化事件对象*/


//异步演示
function  testA(){



    //使用异步读去
    fs.readFile("./web-demo/my_modules/json/mime.json","UTF-8",(err,data)=>{

        return data;

    })


}

//调用函数
console.log(testA());;
