
const fs = require("fs");
const file = 'package.json';

// 检查文件是否存在于当前目录中。
fs.access(file, fs.constants.F_OK, (err) => {
    console.log(`${file} ${err ? '不存在' : '存在'}`);
});

// 检查文件是否可读。
fs.access(file, fs.constants.R_OK, (err) => {
    console.log(`${file} ${err ? '不可读' : '可读'}`);
});

// 检查文件是否可写。
fs.access(file, fs.constants.W_OK, (err) => {
    console.log(`${file} ${err ? '不可写' : '可写'}`);
});

// 检查文件是否存在于当前目录中、以及是否可写。
fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
    if (err) {
        console.error(
            `${file} ${err.code === 'ENOENT' ? '不存在' : '只可读'}`);
    } else {
        console.log(`${file} 存在，且可写`);
    }
});