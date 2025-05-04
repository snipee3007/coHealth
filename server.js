import serverless from 'serverless-http';
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const port = process.env.PORT || 8000;

const server = require('./socketio.js');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// console.log(DB); //MUST CHANGE THE CONFIG, ADD cohealth before ?
mongoose.connect(DB).then(() => console.log('Connect to database successful'));

export const handler = serverless(server);

// server.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
