

let  tools={
    sayHi:function(name){
        return "您好:"+name+"，欢迎使用 tools module ！";
    },
    sum(x,y){  //这是一个缩写函数（和上面sayHi一样）
        return x+y;
    }
}
//导出这个对象
exports.toolsObj=tools; //导出tools对象 作为模块 等同于  module.exports.tools=tools;

//你也可以单独导出函数
exports.sayHi=tools.sayHi;
exports.sum=tools.sum;

