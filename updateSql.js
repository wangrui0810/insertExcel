var XLSX = require('xlsx');

var transName = function(x) {
	return 'xingyun' + x +'qi';
}
function f3(err, client, done) 
{
	if(err) {
	throw err;
	}
	client.query(insertString,[a, transName(b), c, d, e, f, g, h, i, j], 
			function(err, result) {
				done();

				if(err) {
				console.log(err);
				throw err;
				}
				console.log(result);
			});
}
function f2(err, result) 
{
	if(err) {
	console.log(err);
	throw err;
	}
	if(result.rowCount == 0){
		console.log(a + " "+ b + " " + c + "不在数据库中");
		
		for(var i in SecuCode)
		{
			if(c == SecuCode[i])
				d = "ETF";
			else
				d = "STOCK";
		}
		var conString = "postgres://postgres:ZZS2012@58.83.196.218/position_db";
		var insertString = "insert into everyday_position values ($1, $2, $3, $4, $5, \
		$6, $7, $8, $9, $10);";
		pg.connect(conString, f3);
	}

}

function f1(err, client, done) 
{
	if(err) {
	throw err;
	}
	//						console.log(c, d, a, b,transName(e), f, g);
	client.query(selectString,[a, transName(b), c], f2);
}

function sqlActionInner(filename, callback)
{

	var seccode, date, cost_value, market_value, sectype;

	date = filename.substr(64, 10);
	var xingYun = filename.substr(61, 1);
	var workbook = XLSX.readFile(filename);
	var first_sheet_name = workbook.SheetNames[0];
	var address_of_cell = 'A5';

	/* Get worksheet */
	var worksheet = workbook.Sheets[first_sheet_name];

	/* Find desired cell */
	var desired_cell = worksheet[address_of_cell];

	/* Get the value */
	var desired_value = desired_cell.v;
	/*处理每一项的仓位 看看他是否在数据库中 即select*的返回值result.rowCount的值是多少*/

	for(var i = 5; i < 100; i++ ) {
		var ai = worksheet['A' + i];//seccode
		var ci = worksheet['C' + i]; //size
		var gi = worksheet['G' + i]; //price
		var ei = worksheet['E' + i]; //cost
		var hi = worksheet['H' + i];//market
		var ki = worksheet['K' + i];
		var fi = worksheet['F' + i];//cost_asset
		var ii = worksheet['I' + i];//market_asset



		if(ai && ei && hi && ki && ki.v) {

			seccode = ai.v;
			seccode = seccode.substr(seccode.length-6, 6);
			cost_value = ei.v;
			market_value = hi.v;
			cost_asset = fi.v/100;
			market_asset = ii.v/100;
			size = ci.v;
			price = gi.v;
			sectype = ""; //先初始化为空

			//看seccode acct date这三个数的查询是否有结果
			//有的话 不管 没有的话 insert into everyday_position

			callback(date, xingYun, seccode, sectype, size, price, cost_value, market_value, market_asset, cost_asset);
		}
	}
}


function sqlAction(filename, SecuCode)
{
	sqlActionInner(filename, function(a, b, c, d, e, f, g, h, i, j) {

	 		var pg = require('pg');
			var conString = "postgres://postgres:ZZS2012@58.83.196.218/position_db";


		    var selectString = "select * from everyday_position where pos_date = $1 and acct = $2\
		    and seccode = $3;";

		
			pg.connect(conString, f1);
	});
	console.log('sqlAction');
};

module.exports = sqlAction;
