//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();


//引入增加模块
let add = require('./add/add.js');
//引入修改模块
let update = require('./update/update.js');
//引入删除模块
let delete1 = require('./delete/delete.js');
//引入首页查询模块
let index = require('./find/index.js');

//路由相关进入
router.use("/",add);
router.use("/",update);
router.use("/",delete1);
router.use("/",index);


//你可以继续添加 例如注册模块、用户列表、修改、删除、等

//暴露这个 router模块
module.exports = router;