const exec = require('child_process').exec;

// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: '35.167.1.235',
//   user: 'rohangarg',
//   password: '-HrDfKMS3o5Lz3Ml',
//   database: 'db_sloth',
// });

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 150,
  host: '35.167.1.235',
  user: 'rohangarg',
  password: '-HrDfKMS3o5Lz3Ml',
  database: 'db_sloth',
});

let time = new Date(new Date().getTime() - 60 * 1000)
  .toISOString()
  .substring(0, 16);

exec(`tail -n 1000 sloth.txt `, function (error, stdout, stderr) {
  if (error) {
    console.log(
      'error>>>>>>>>>>>>>>>>>>>>>>>: ',
      error,
      stderr,
      ':::::::::',
      stdout
    );
    statusCode = error.code;
  } else {
    for (let query of stdout.split('Time:')) {
      console.log('#######################',time, query);
	    if(!query.includes(time)){console.log("query rejected>>>>>>"); continue;}

	    let rawQuery = query.match(/;([^;]*);/);
      if (rawQuery && rawQuery[0]) {
        let queryTime = query.match(/Query_time: (\d+\.\d+)\s+/)[1];
        let lockTime = query.match(/Lock_time: (\d+\.\d+)\s+/)[1];
        let rowSent = query.match(/Rows_sent: (\d+)\s+/)[1];
        let rowExamined = query.match(/Rows_examined: (\d+)\s+/)[1];
        rawQuery = rawQuery[0].replace(';\n', '');
        console.log({
          queryTime,
          lockTime,
          rowSent,
          rowExamined,
          rawQuery,
        });

        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            `INSERT INTO slow_queries (source, query_id, query, query_time, row_examined, row_sent) VALUES (
              ?,?,?,?,?,?
              )`,
            ['hippo-dev', '1', rawQuery, queryTime, rowExamined, rowSent],
            (error, results) => {
              connection.release();
              if (error) throw error;
              console.log(results);
            }
          );
        });
      }
    }
  }
});
