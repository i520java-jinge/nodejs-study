//引入fs
let fs = require('fs');

/**
 * 删除封面图片
 * @param coverPath 删除的图片路径
 * @param uploadDir 上传图片路径
 * @param isDbPath(可选 默认值true)  是否是数据库存储http路径(http://localhost:8888/static/images.xxxx.png)
 *        false 表示就是直接是文件路径
 */
function deleteCoverImg(path,uploadDir,isDbPath) {
    if(path!=""){ //有原图 异步删除不影响修改
        if(isDbPath==null||isDbPath) {//数据库http路径
            //获得图片名称
            path=path.substring(path.lastIndexOf("/"));
            //拼接真实路劲
            path=uploadDir+path;
        }
        // 检查文件是否存在于当前目录中。
        fs.access(path, fs.constants.F_OK, (err) => {
            if(err==null){
                console.log("---------->文件存在--执行删除！");
                fs.unlink(path,function (err){
                    if(err!=null){
                        console.log("图片删除错误，路径:"+path);
                    }
                })
            }

        });
    }
}


/**
 * 重命名图片 返回http访问地址
 * @param imgJson
 * @param req
 * @returns {string}
 */
function renameGetHttpPath(imgJson,req) {

    //获得文件后缀名
    let  endName=imgJson.originalFilename.substring(imgJson.originalFilename.lastIndexOf("."));
    //新名字
    let  newName="i520java-"+new Date().getTime()+endName;
    let newPath=imgJson.path.substring(0,imgJson.path.lastIndexOf("/")+1)+newName;

    //拼接http图片路径
    let httpPath=req.headers.origin+"/static/images/"+newName;

    // 检查文件是否存在于当前目录中。
    fs.access(imgJson.path, fs.constants.F_OK, (err) => {
        if(err==null) {
            //异步重命名文件名
            fs.rename(imgJson.path, newPath, function (err) {
                if (err != null) {
                    console.log("-----重名图片错误！");
                }
            })
        }
    })
    return  httpPath;
}

//暴露模块
exports.renameGetHttpPath=renameGetHttpPath;
exports.deleteCoverImg=deleteCoverImg;