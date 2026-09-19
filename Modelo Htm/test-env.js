require('dotenv').config();
console.log('HOST:', JSON.stringify(process.env.DB_HOST));
console.log('USER:', JSON.stringify(process.env.DB_USER));
console.log('PASSWORD:', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_NAME:', JSON.stringify(process.env.DB_NAME));