const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: 'medidekdb.cxajit2uhdcv.us-east-1.rds.amazonaws.com',
//   user: 'root',
//   password: 'jivtodeRitu',
//   database: 'medidek_schema'
// });

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Mysql Connected!');
});

module.exports = connection