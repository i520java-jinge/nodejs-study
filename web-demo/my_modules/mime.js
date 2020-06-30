
let  fs=require("fs");
//导出模块(参考:https://www.w3school.com.cn/media/media_mimeref.asp)
exports.mimeType=function (suffixName) { //根据后缀获得mime的文件类型

    //这里是同步读取文件
    try {
        let mimeJson = fs.readFileSync("./web-demo/my_modules/json/mime.json", {encoding: "UTF-8"});
        if(mimeJson!=""){
            mimeJson=JSON.parse(mimeJson);
            return  mimeJson[suffixName].toString();
        }
    } catch (e) {
        console.log(suffixName);
        console.log("------>无法获取mime.json文件:"+e);

    }
    return  null;
}