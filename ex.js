var fs = require("fs");
var fsEx = require('fs-extra');
var sqlAction = require('./insertSql.js');
readline = require('readline');
var output = require('debug')('app:log');

var readToMap_ = function (filename, callback) {
    var SecuCode = {};
    var rd = readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
    });
    rd.on('line', function (line) {
        SecuCode[line] = 1;
    });
    rd.on('close', function () {
        callback(SecuCode);
    });
};

var insertSql_ = function(fundMap, repoMap, stockMap) {
    var xx = fs.readdirSync('G:/codes_H/insertExcel/data');
    for (var key in xx) {
        var file_name = 'G:/codes_H/insertExcel/data/' + xx[key];
        sqlAction(file_name, fundMap, repoMap, stockMap);
    }
};

readToMap_("./FUND.txt", function(fundMap) {
    readToMap_("./REPO.txt", function(repoMap) {
        readToMap_("./STOCK.txt", function(stockMap) {
            insertSql_(fundMap, repoMap, stockMap);
        });
    });
});

