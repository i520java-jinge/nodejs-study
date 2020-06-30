let url = require('url');

console.log("*****************[parse url]*****************************************");
let rs=url.parse('http://www.baidu.com/s?wd=nodejs');
console.log(rs);

console.log("*****************[format 后]*****************************************");

let rs1=url.format(rs)
console.log(rs1);
