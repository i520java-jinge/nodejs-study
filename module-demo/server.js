
let http = require('http');
var tools=require("./myModule/tools.js")


//使用对象
console.log(tools.toolsObj.sayHi('张三'));
console.log(tools.toolsObj.sum(10,5))

//直接使用函数
console.log(tools.sayHi('张三'));
console.log(tools.sum(10,5))