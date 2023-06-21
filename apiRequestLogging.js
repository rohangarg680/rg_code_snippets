const exec = require('child_process').exec;

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 150,
  host: '35.167.1.235',
  user: 'rohangarg',
  password: '-HrDfKMS3o5Lz3Ml',
  database: 'db_sloth',
});

var source = process.argv[2] || 'HIPPO';
var server = process.argv[3] || 'BACKEND-DEV';
var threshold = process.argv[4] || 500; //ms

let taskCounter = 0;
exec("ls -lt  | awk 'NR==2{print $NF}'",function (error, stdout, stderr){
console.log("latest logfile>>>>>",stdout);
exec(`tail -n 10000 ${stdout} `,{maxBuffer: 1024 * 10000} , function (error, stdout, stderr) {
  if (error) {
    console.log('error>>> ', error, stderr, ':::::', stdout);
    statusCode = error.code;
  } else {
    for (let request of stdout.split('\n')) {
      try{
      taskCounter++;
      let requestParsed = JSON.parse(request);
      
      if(new Date(requestParsed.timestamp).getMinutes()  == new Date(new Date().getTime() - 60*1000).getMinutes()){
        taskCounter--;
        console.log("REQUEST REJECTED>>>>>>>",requestParsed.timestamp)
        continue;
      }
        
      console.log(
        requestParsed,
        requestParsed.url,
        parseInt(requestParsed.responseTime.split(' ')[0])
      );

      let url = requestParsed.url;
      let requestPayload = requestParsed.request;
      let responseTime = requestParsed.responseTime.split(' ')[0];

      if(responseTime < parseInt(threshold)){
        console.log("REQUEST REJECTED responseTime >>>>>>>",responseTime, parseInt(threshold))
        taskCounter--;
      }
        
      pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            `INSERT INTO api_logs (source, server, url, request, response_time) 
             VALUES (?,?,?,?,?)`,
            [source, server, url, requestPayload, responseTime],
            (error, results) => {
              connection.release();
              if (error) throw error;
              console.log(results);
              taskCounter--;
              if(taskCounter == 0){
                process.exit();
              }
            }
          );
        });
    }catch(err){
      console.error("err>>>",err, request)
      taskCounter--;
    }
  }
}
});
})



