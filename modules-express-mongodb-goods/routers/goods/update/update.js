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


//编辑
router.get("/edit.html",function (req,res) {

    let  param=req.query;
    if(param._id){
        param._id=mongojs.ObjectID(param._id);
        mongojs.find("goods",param,function (data) {
            if(data!=null){
                //渲染编辑页面
                res.render("goods/edit",{tag:'edit',goods:data[0]})
            }else{
                res.alertAndBack("查询不到相关数据！");
            }
        })
    }else{
        res.alertAndBack("参数传递错误！");
    }

})

//修改处理
router.post("/update",function (req,res) {

    form().parse(req, function(err, fields, files) {
        if(err==null){
            //查看fields的数据结构
            //console.log(fields);
            let goods={}; //商品对象

            //修改的对象主键
            let query={_id:mongojs.ObjectID(fields['_id'][0])}

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
                //调用删除缓存成功图片
                if(files!=null)  coverImgUtil.deleteCoverImg(files.coverImg[0].path,multipartyOptions.uploadDir,false);
            }
            //先查询原来的数据（主要获得原来图片的路径方便删除）

            mongojs.find("goods",query,function (data) {

                if(data!=null){  //有原数据

                    //修改数据
                    mongojs.updateOne("goods",query,goods,function (count) {
                        if(count>0){
                            let oldCover=data[0].coverImg;
                            if(goods.coverImg){ //有传递新图片 才删除就图片
                                //调用删除原来的图片
                                coverImgUtil.deleteCoverImg(files.coverImg[0].path,multipartyOptions.uploadDir,false);
                            }


                            res.alertAndRedirectUrl("修改成功!","/goods/index.html?keyword="+goods.name);
                        }else{
                            //调用删除上传成功图片
                            coverImgUtil.deleteCoverImg(goods.coverImg,multipartyOptions.uploadDir);
                            res.alertAndBack("修改商品失败");
                        }
                    })

                }else{
                    //调用删除上传成功图片
                    coverImgUtil.deleteCoverImg(goods.coverImg,multipartyOptions.uploadDir);
                    res.alertAndBack("修改商品失败，商品信息不存在！");
                }

            })

        }else{
            //调用删除缓存成功图片
            if(files!=null) coverImgUtil.deleteCoverImg(files.coverImg[0].path,multipartyOptions.uploadDir,false);
            res.alertAndBack("修改商品失败");
        }

    });
    return;
})



//暴露这个 router模块
module.exports = router;