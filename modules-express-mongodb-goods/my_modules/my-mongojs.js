/**
    MongoDB的操作封装示例
    主要是用于学习封装原理，功能不是全，仅仅封装本项目需要的功能，
    有兴趣的可以封装完整功能
*/



// 引入 mongodb
const MongoClient = require('mongodb').MongoClient;
// 连接字符串(由于我的单机版做了安全认证所以参数必不可少)
//如果你没有安全认证可以使用 const url = 'mongodb://localhost:27017';
const url = 'mongodb://user_demo:123456@localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=mongo_demo&authMechanism=SCRAM-SHA-256';
//数据库名称
const dbName = 'mongo_demo';

var ObjectID = require('mongodb').ObjectID;

//连接数据库
function  connsectMongoDB(callback) {

    MongoClient.connect(url, function(err, client) {

        if(err!=null){
            console.log("---------->连接MongoDB异常:"+err);
            return;
        }

        console.log("---------->连接MongoDB成功！");

        //回调数据库操作函数
        callback(client);

    })

}

/**
 * 暴露查找方法
 * @param collectionName 查询的集合名称
 * @param queryJSON 查询的json对象
 * @param callback 查询后的回调函数
 * @param limit(可选)  限制返回的数据量
 * @param skip(可选)   跳过的数据量
 */
exports.find=function (collectionName,queryJSON,callback,limit,skip) {
    //调用连接数据库函数传入回调函数
    connsectMongoDB(function (client) {

        let result=client.db(dbName).collection(collectionName).find(queryJSON);
        if(limit !=null && ! isNaN(limit) ){
            result= result.limit(limit);
        }
        if(skip !=null && ! isNaN(skip) ){
            result=result.skip(skip);
        }
        //转换结果
        result.toArray(function (err, data) {
            if(err==null){
                console.log("---------->find查询成功");
                if (data != null && data.length > 0) { //能够查询到数据
                   //回掉返回结果
                    callback(data);
                }else{
                    //回掉返回结果
                    callback(null);
                }
                return;
            }
            console.log("---------->find查询失败!"+err);
        })
        //关闭连接
        client.close();
    })
}

/**
 * 暴露统计数据量
 * @param collectionName 查询的集合名称
 * @param queryJSON 查询的json对象
 * @param callback 查询后的回调函数(参数返回数据量)
 */
exports.count=function (collectionName,queryJSON,callback) {
    //调用连接数据库函数传入回调函数
    connsectMongoDB(function (client) {

        client.db(dbName).collection(collectionName).find(queryJSON).count(function (err,count) {
            if(err==null){
                console.log("---------->count查询成功");
                callback(count);
            }else{
                console.log("---------->count查询失败!"+err);
                callback(0);
            }
        });
        //关闭连接
        client.close();
    })
}


/**
 * 暴露插入多文档的方法
 * @param collectionName 集合的清除
 * @param dataJson  数据的json数组
 * @param callback  执行后的回调（返回受影响的文档时数量）
 */
exports.insertMany=function (collectionName,dataJson,callback) {
    //调用连接数据库函数传入回调函数
    connsectMongoDB(function (client) {
        client.db(dbName).collection(collectionName).insertMany(dataJson,function (err,result) {
            if(err==null){
                console.log("---------->insertMany插入成功:"+result);
                callback(result.result.n);
            }else{
                console.log("---------->insertMany插入失败!"+err);
                callback(0);
            }
        });
        //关闭连接
        client.close();
    })
}


/**
 * 暴露修改的方法
 * @param collectionName  集合名字
 * @param filterJson      过滤匹配数据的json
 * @param setJson         修改的josn值
 * @param callback        执行后的回调（返回受影响的文档时数量）
 */
exports.updateOne=function (collectionName,filterJson,setJson,callback) {
    //调用连接数据库函数传入回调函数
    connsectMongoDB(function (client) {
        client.db(dbName).collection(collectionName).updateOne(filterJson,{$set:setJson},function (err,result) {
            if(err==null){
                console.log("---------->updateOne修改成功:"+result);
                callback(result.result.n);
            }else{
                console.log("---------->updateOne修改失败!"+err);
                callback(0);
            }
        });
        //关闭连接
        client.close();
    })
}


/**
 * 暴露删除
 * @param collectionName 集合的名字
 * @param queryJson      过滤匹配数据的json
 * @param callback       行后的回调（返回受影响的文档时数量）
 */
exports.deleteOne=function (collectionName,queryJson,callback) {
    //调用连接数据库函数传入回调函数
    connsectMongoDB(function (client) {
        client.db(dbName).collection(collectionName).deleteOne(queryJson,function (err,result) {
            if(err==null){
                console.log("---------->deleteOne删除成功:"+result);
                callback(result.result.n);
            }else{
                console.log("---------->deleteOne删除失败!"+err);
                callback(0);
            }
        });
        //关闭连接
        client.close();
    })
}

//主键处理
exports.ObjectID=function (value) {
    return new ObjectID(value);
}




