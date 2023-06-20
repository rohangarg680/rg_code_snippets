const exec = require('child_process').exec;

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 150,
  host: '35.167.1.235',
  user: 'rohangarg',
  password: '-HrDfKMS3o5Lz3Ml',
  database: 'db_sloth',
});

var source = 'HIPPO';
var server = 'BACKEND';

exec(`tail -n 10000 fugu-requests.log.20-06-2023 `, function (error, stdout, stderr) {
  if (error) {
    console.log('error>>> ', error, stderr, ':::::', stdout);
    statusCode = error.code;
  } else {
    for (let request of stdout.split('\n')) {
      let requestParsed = JSON.parse(request);
      console.log(
        requestParsed,
        requestParsed.url,
        parseInt(requestParsed.responseTime.split(' ')[0])
      );
      let url = requestParsed.url;
      let request = requestParsed.request;
      let responseTime = requestParsed.responseTime.split(' ')[0];

      if (raw_query && raw_query.length) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            `INSERT INTO api_logs (source, server, url, request,request_time) 
             VALUES (?,?,?,?,?)`,
            [source, server, url, request, responseTime],
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
