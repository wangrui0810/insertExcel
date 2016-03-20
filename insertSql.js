var XLSX = require('xlsx');
var output = require('debug')('app:log');
var path = require('path');
var config = require('./config.json');
var pg = require('pg');


var transName = function (x) {
    return 'xingyun' + x + 'qi';
};

var pickdata = function (filename) {
    var baseName = path.basename(filename);
    return baseName.substr(22, 10);
};

var pickXingyun = function (filename) {
    var baseName = path.basename(filename);
    return baseName.substr(19, 1);
};

var readWorkbook_ = function (filename) {
    var workbook = XLSX.readFile(filename);
    return workbook;
};

var errorHandler = function (err, result, callback) {
    if (err) throw err;
    callback(result);
};

var sqlActionInner = function (workbook, filename, callback) {
    var seccode, date, cost_value, market_value, sectype;

    var first_sheet_name = workbook.SheetNames[0];
    var address_of_cell = 'A5';

    /* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];

    /* Find desired cell */
    var desired_cell = worksheet[address_of_cell];

    /* Get the value */
    var desired_value = desired_cell.v;
    /*处理每一项的仓位 看看他是否在数据库中 即select*的返回值result.rowCount的值是多少*/

    for (var i = 5; i < 100; i++) {
        var ai = worksheet['A' + i];//seccode
        var ci = worksheet['C' + i]; //size
        var gi = worksheet['G' + i]; //price
        var ei = worksheet['E' + i]; //cost
        var hi = worksheet['H' + i];//market
        var ki = worksheet['K' + i];
        var fi = worksheet['F' + i];//cost_asset
        var ii = worksheet['I' + i];//market_asset


        if (ai && ei && hi && ki && ki.v) {

            seccode = ai.v;
            seccode = seccode.substr(seccode.length - 6, 6);
            cost_value = ei.v;
            market_value = hi.v;
            cost_asset = fi.v / 100;
            market_asset = ii.v / 100;
            size = ci.v;
            price = gi.v;
            sectype = ""; //先初始化为空

            //看seccode acct date这三个数的查询是否有结果
            //有的话 不管 没有的话 insert into everyday_position

            callback(pickdata(filename), pickXingyun(filename), seccode, sectype, size, price, cost_asset, market_asset, market_value, cost_value);
        }
    }
};

var isIn = function(str, dataMap) {
    return dataMap[str] === 1;
};

var getType = function(str, fundMap, repoMap, stockMap)
{
    if (isIn(str, fundMap))
        return 'FUND';
    else if (isIn(str, repoMap))
        return 'REPO';
    else if (isIn(str, stockMap))
        return 'STOCK';
    else
        throw 'shit!';

};

var sqlAction = function (filename, fundMap, repoMap, stockMap) {
    var tmpFunction = function (a, b, c, d, e, f, g, h, i, j) {
        var selectString = "select * from everyday_position where pos_date = $1 and acct = $2\
		    and seccode = $3;";
        var connectFunction = function (err, client, done) {
            if (err) {
                throw err;
            }
//						console.log(c, d, a, b,transName(e), f, g);
            var selectFunction = function (err, result) {
                done();

                if (err) {
                    console.log(err);
                    throw err;
                }
                if (result.rowCount == 0) {
                    console.log(a + " " + b + " " + c + "不在数据库中");
                    d = getType(c, fundMap, repoMap, stockMap);
                    var insertString = "insert into everyday_position values ($1, $2, $3, $4, $5, \
										$6, $7, $8, $9, $10);";
                    var kkk2 = function (err, result) {
                        errorHandler(err, result, function (re) {
                            output(re);
                        });
                    };
                    client.query(insertString, [a, transName(b), c, d, e, f, g, h, i, j],
                        kkk2);
                }
            };
            client.query(selectString,
                [a, transName(b), c],
                selectFunction);
        };
        pg.connect(config.dbPath, connectFunction);
    };
    sqlActionInner(readWorkbook_(filename), filename, tmpFunction);
    console.log('sqlAction');
};

module.exports = sqlAction;
