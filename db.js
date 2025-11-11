// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'srv1455.hstgr.io',
  user: 'u647025124_sayna',
  password: '&Ty9I:Y5e',
  database: 'u647025124_saynaApp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
