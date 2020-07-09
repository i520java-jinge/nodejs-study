//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();
//引入path处理路径
let path=require("path");
//获得根路径
let rootPath=path.join(__dirname,"../../../")

// 引入 自定义工具
const mongojs = require(rootPath+'/my_modules/my-mongojs');


//首页
router.get("/index.html",  function (req, res) {


    //定义一个分页对象方便后面传递数据渲染
    let pageObj = {
        page: 1, //当前页码 默认第一页
        limit: 4, //每页显示的数据量,
        totalPage: 0,//总页数
        count: 0,//总共的数据量,
        keyword: "",//搜索的关键词也就是商品名称name
        data: null //当前页的数据
    }


    //接收参数数据 假设如:{name:'鼠标',page:1}
    let param = req.query;
    let query = {}; //MongoDB查询参数
    //有二个参数（商品名称、当前页数） 参数有可能不传递
    //判断是否有name参数或者keyword参数(都是按照商品名称):
    if (param.hasOwnProperty('name') || param.hasOwnProperty('keyword')) {
        //记录搜的关键词
        pageObj.keyword = param.name || param.keyword;
        if(pageObj.keyword!="")
            query = {name: {$regex: eval("/" + pageObj.keyword + "/i")}}
    }

    mongojs.count("goods",query,function (count) {
        if(count>0){
            pageObj.count = count;

            //计算总页数:
            let nump=parseInt(pageObj.count / pageObj.limit)
            pageObj.totalPage = pageObj.count % pageObj.limit == 0 ? nump :nump + 1;


            //判断是否有页码page参数
            if (param.hasOwnProperty("page")) {
                //覆盖默认值
                pageObj.page = parseInt(param.page);
            }
            //判断页码的合理性
            if (pageObj.page < 1) pageObj.page = 1;
            if (pageObj.page > pageObj.totalPage) pageObj.page = pageObj.totalPage;

            //查询当前页数据
            //正则表达式中使用变量。一定要使用eval将组合的字符串进行转换，不能直接将字符串拼接后传入给表达式。否则没有报错信息，只是结果为空！
            //limit(数据量).skip(跳过的数据量)  skip取值个mysql的分页中的一样(skip=(当前的页码-1)*每页显示数据量)
            mongojs.find("goods",query,function (data) {
                if(data!=null){
                    //取数据
                    pageObj.data =data;
                }
                //不管是否有数据都要渲染首页
                res.render("goods/index", {tag: 'index', page: pageObj})
            },pageObj.limit,(pageObj.page - 1) * pageObj.limit)

        }else{
            //查询不到数据
            res.render("error", {status: "500", msg: "服务器异常,请稍后再试试！<a href='/index.html'>返回主页</a>"});
        }
    })

})


//暴露这个 router模块
module.exports = router;