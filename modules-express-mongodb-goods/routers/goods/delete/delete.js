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


//删除
router.get("/delete",function (req,res) {

    let  param=req.query;
    if(param._id){
        param._id=mongojs.ObjectID(param._id);

        mongojs.find("goods",param,function (data) {

            if(data!=null) {  //有原数据
                mongojs.deleteOne("goods",param,function (count) {
                    if(count>0){
                        let oldCover=data[0].coverImg;
                        //调用删除图片
                        coverImgUtil. deleteCoverImg(oldCover,multipartyOptions.uploadDir);
                        res.alertAndRedirectUrl("删除成功",req.headers.referer)
                    }else{
                        res.alertAndBack("查询不到相关数据！");
                    }
                })
            }else{
                res.alertAndBack("删除商品失败，商品信息不存在！");
            }

        })
    }else{
        res.alertAndBack("参数传递错误！");
    }
})



//暴露这个 router模块
module.exports = router;