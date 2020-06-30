
//引入events 模块
const events = require('events');
const fs = require('fs');

//实例化监听器
let myEventEmitter=new events.EventEmitter();

//设置监听
myEventEmitter.on("test",data=>{
    console.log("获取到data:" + data);
})

//
// setTimeout(()=>{
//     console.log("----->触发事件 test");
//     myEventEmitter.emit("test","你好：test!");
// },2000)





//使用异步读去
fs.readFile("./web-demo/my_modules/json/mime.json","UTF-8",(err,data)=>{
    console.log("----->触发事件 test");
    myEventEmitter.emit("test",data);
})







