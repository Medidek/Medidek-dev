const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'medidekdb.cxajit2uhdcv.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: 'jivtodeRitu',
  database: 'medidek_schema'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Mysql Connected!');
});

module.exports = connection