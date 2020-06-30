
//引入fs模块
const fs = require("fs");

//**************【获得文件状态信息】*********************************
// fs.stat("./fs-demo/files/hello.txt",function (error,stats) {
//
//     if(error){
//         console.log(error);
//     }else{
//         console.log(stats);
//         console.log("是文件吗？："+stats.isFile());
//         console.log("是目录吗？"+stats.isDirectory());
//     }
// })


//**************【创建文件夹】*********************************
//(注意不能创建多级路径)
// fs.mkdir("./fs-demo/logs",function (error) {
// //     if(error){
// //         console.log(error);
// //     }else{
// //         console.log("创建文件夹成功！");
// //     }
// // })

//函数采用es6的写法
// fs.mkdir("./fs-demo/logs",error=>{
//     if(error){
//         console.log(error);
//     }else{
//         console.log("创建文件夹成功！");
//     }
// })


//**************【创建写入文件】*********************************
//
// fs.writeFile('./fs-demo/logs/log1.log','这是一个日志文件！',error=>{
//     if(error){
//         console.log(error);
//     }else{
//         console.log("创建写入文件成功");
//     }
// })


//**************【追加文件】*********************************
// fs.appendFile('./fs-demo/logs/log1.log', 'hello ~ \n', (error) => {
//     if(error) {
//         console .log(error)
//     } else {
//         console .log('追加成功文件' )
//     }
// })


//**************【读取文件】*********************************
// fs.readFile('./fs-demo/logs/log1.log', 'utf8', (error, data) =>{
//     if (error) {
//         console .log(error)
//     } else {
//         console .log(data)
//     }
// })

//**************【读取目录】*********************************
// fs.readdir('./fs-demo/logs', (error, files) => {
//     if (error) {
//         console .log(error)
//     } else {
//      console .log(files)
//     }
// })


// //**************【重命名文件】*********************************
// fs.rename('./fs-demo/logs/log1.log', './fs-demo/logs/log2.log', (error) =>{
//     if (error) {
//         console .log(error)
//     } else {
//         console .log(' 重命名成功' )
//     }
// })


// //**************【删除目录】*********************************
// fs.rmdir('./fs-demo/logs/', (error) =>{
//         if (error) {
//             console .log(error)
//         } else {
//             console.log('成功的删除了目录:logs')
//         }
// })


//**************【删除文件】*********************************
// fs.unlink(`./fs-demo/logs/log2.log`, (error) => {
//     if (error) {
//         console .log(error)
//     } else {
//         console.log(`成功的删除了文件`)
//     }
// })






//**************【从文件流中读取数据】*********************************
// var fileReadStream = fs.createReadStream('./fs-demo/logs/log2.log')
// let count=0;
// var str='';
// fileReadStream.on('data', (chunk) => {
//     console.log(`${ ++count } 接收到:${chunk.length}`);
//     str +=chunk
// })
//
// fileReadStream.on('end', () => {
//     console.log('--- 结束 ---');
//     console .log(count );
//     console .log(str );
// })
//
// fileReadStream.on('error', (error) => {
//     console .log(error)
// })


//**************【从文件输出流写入文件】*********************************
var data = '我是从数据库获取的数据，我要保存起来';
// 创建一个可以写入的流，写入到文件 output.txt 中
var writerStream = fs.createWriteStream('./fs-demo/files/output.txt');
// 使用 utf8 编码写入数据
writerStream .write(data ,'UTF8' );
// 标记文件末尾
writerStream .end();

// 处理流事件 --> finish 事件
writerStream.on('finish', function() {
    /*finish - 所有数据已被写入到底层系统时触发。*/
    console .log("写入完 成。" );
});

writerStream.on('error', function(err){
    console.log(err.stack);
});

console .log("程序执 行完毕" );