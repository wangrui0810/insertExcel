
var sqlAction = require('./updateSql.js');



readline = require('readline');

var SecuCode = [];
var rd = readline.createInterface({
    input: fs.createReadStream('./SecuCode.txt'),
    terminal: false
});

var i = 1;
rd.on('line', function(line) {
    SecuCode.push(line);
    i++;
});
rd.on('close', function(){
	SecuCode[SecuCode.length - 1] = SecuCode[SecuCode.length - 1].substring(0, SecuCode[SecuCode.length - 1].length -1);
	insertSql();
})

function insertSql()
{
	var fs = require("fs");
	var fsEx = require('fs-extra');
	var xx = fs.readdirSync('E:/workplace/about_job/importExcel/file');
	for (var key in xx) 
	{
		var file_name = 'E:/workplace/about_job/importExcel/file/' + xx[key];
		sqlAction(file_name);
	}

}