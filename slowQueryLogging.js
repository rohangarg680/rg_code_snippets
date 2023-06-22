const exec = require('child_process').exec;

// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: '35.167.1.235',
//   user: 'rohangarg',
//   password: '-HrDfKMS3o5Lz3Ml',
//   database: 'db_sloth',
// });
var source = process.argv[1]  || `HIPPO`;
var dbType = process.argv[2]  || `MASTER`;
var taskCounter = 0;

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 150,
  host: process.argv[3] || '172.31.10.103',
  user: process.argv[4] || 'rohangarg',
  password: process.argv[5]  || '-HrDfKMS3o5Lz3Ml',
  database: 'db_sloth',
});

var time = new Date(new Date().getTime() - 60 * 1000)
  .toISOString()
  .substring(0, 16);

pool.getConnection((err, connection) => {
  if (err) throw err;
  exec(`tail -n 1000 mysql-slow.log `, { maxBuffer: 1024 * 1000 }, function (error, stdout, stderr) {
    if (error) {
      console.log('error>>>>>>>>: ',error,stderr,':::::::::',stdout);
      statusCode = error.code;
    } else {
      for (var query of stdout.split('Time:')) {
        console.log('#######################', time, query);
        if (!query.includes(time)) { console.log("query rejected>>>>>>"); continue; }

        var rawQuery = query.match(/;([^;]*);/);
        if (rawQuery && rawQuery[0]) {
          var queryTime = query.match(/Query_time: (\d+\.\d+)\s+/)[1];
          var lockTime = query.match(/Lock_time: (\d+\.\d+)\s+/)[1];
          var rowSent = query.match(/Rows_sent: (\d+)\s+/)[1];
          var rowExamined = query.match(/Rows_examined: (\d+)\s+/)[1];
          rawQuery = rawQuery[0].replace(';\n', '');
          taskCounter++;
		
          console.log({
            queryTime,
            lockTime,
            rowSent,
            rowExamined,
            rawQuery,
          });

          connection.query(
            `INSERT INTO 
	    	slow_queries 
      		(source, db_type, query_id, query, query_time, row_examined, row_sent, lock_time) 
	 	VALUES 
   		(?,?,?,?,?,?,?,?) `,
            [source, dbType, '1', rawQuery, queryTime, rowExamined, rowSent, lockTime],
            (error, results) => {
	      taskCounter--;
              if (error) throw error;
              console.log(results);
		if (taskCounter == 0) {
                  connection.release();
                  process.exit();
        	}
            }
          );

        }
      }
    }
  });
});


