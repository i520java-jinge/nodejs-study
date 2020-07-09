//引入express
let express = require('express');
//挂载路由对象
let router = express.Router();


//引入登录模块
let login = require('./login/login.js');
//登录相关进入
router.use("/",login);


//你可以继续添加 例如注册模块、用户列表、修改、删除、等

//暴露这个 router模块
module.exports = router;