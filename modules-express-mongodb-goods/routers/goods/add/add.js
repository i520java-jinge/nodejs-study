//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();
//引入path处理路径
let path=require("path");
//获得根路径
let rootPath=path.join(__dirname,"../../../")
// 引入 multiparty
let multiparty = require('multiparty');
let multipartyOptions={
    maxFieldsSize: 1024*1024*20,   //设置20M 单位字节 默认大小为2MB
    uploadDir:rootPath + '/static/images' //上传文件存放的路径
}
//创建multiparty的for没对象
let form =function () {
    return new multiparty.Form(multipartyOptions);
}

// 引入 自定义工具
const coverImgUtil = require(rootPath+'/my_modules/my-coverImgUtil');
const mongojs = require(rootPath+'/my_modules/my-mongojs');

//增加页面
router.get("/add.html",function (req,res) {

    res.render("goods/add",{tag:'add'})
})

//增加处理
router.post("/add",function (req,res) {

    form().parse(req, function(err, fields, files) {
        if(err==null){
            //查看fields的数据结构
            //console.log(fields);
            let goods={}; //商品对象
            goods.name=fields.name[0];
            goods.price=fields.price[0];
            goods.free=fields.free[0];
            goods.description=fields.description[0];
            console.log(goods);

            //获得文件数据
            let imgJson =files.coverImg[0];
            if(imgJson.size>0){ //有图片处理

                //重名图片获得http访问路径
                goods.coverImg=coverImgUtil.renameGetHttpPath(imgJson,req);

            }else{
                goods.coverImg="";
                //调用删除缓存成功图片
                if(files!=null)  coverImgUtil.deleteCoverImg(files.coverImg[0].path,multipartyOptions.uploadDir,false);
            }

            mongojs.insertMany("goods",[goods],function (count) {
                if(count>0){
                    res.alertAndRedirectUrl("增加成功!","/goods/index.html?keyword="+goods.name);
                }else{
                    //调用删除上传成功图片
                    coverImgUtil.deleteCoverImg(goods.coverImg,multipartyOptions.uploadDir);
                    res.alertAndBack("增加商品失败");

                }
            })

        }else{
            console.log(err);
            //调用删除缓存成功图片
            if(files!=null)   coverImgUtil.deleteCoverImg(files.coverImg[0].path,multipartyOptions.uploadDir,false);
            res.alertAndBack("增加商品失败");

        }

    });
    return;
})



//暴露这个 router模块
module.exports = router;