var fs = require("fs");
var fsEx = require('fs-extra');
var sqlAction = require('./updateSql.js');

console.log(sqlAction);

var xx = fs.readdirSync('E:/workplace/about_job/importExcel/undone');
for (var key in xx) 
{
	var file_name = 'E:/workplace/about_job/importExcel/undone/' + xx[key];
	sqlAction(file_name);
}

