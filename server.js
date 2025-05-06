const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const port = process.env.PORT || 8000;

const server = require('./socketio.js');
const modelLoader = require('./modelLoader');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// console.log(DB); //MUST CHANGE THE CONFIG, ADD cohealth before ?
mongoose.connect(DB).then(() => console.log('Connect to database successful'));

// Initialize model loading
console.log('Initializing disease prediction model...');
modelLoader
  .initializeModel()
  .then(() => {
    console.log('Disease prediction model loaded successfully');
  })
  .catch((err) => {
    console.error('Error loading disease prediction model:', err);
    // Continue server startup even if model fails to load
    console.log(
      'Server will start, but disease prediction may not work properly'
    );
  });

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
