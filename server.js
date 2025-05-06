// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });

// const mongoose = require('mongoose');
// const port = process.env.PORT || 8000;

// const server = require('./socketio.js');
// const modelLoader = require('./modelLoader');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
// // console.log(DB); //MUST CHANGE THE CONFIG, ADD cohealth before ?
// mongoose.connect(DB).then(() => console.log('Connect to database successful'));

// // Initialize model loading
// console.log('Initializing disease prediction model...');
// modelLoader
//   .initializeModel()
//   .then(() => {
//     console.log('Disease prediction model loaded successfully');
//   })
//   .catch((err) => {
//     console.error('Error loading disease prediction model:', err);
//     // Continue server startup even if model fails to load
//     console.log(
//       'Server will start, but disease prediction may not work properly'
//     );
//   });

// server.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const port = process.env.PORT || 8000;

const server = require('./socketio.js');
const modelLoader = require('./backend/controllers/modelLoader.js');
const memoryMonitor = require('./backend/controllers/memoryMonitor.js');

// Log memory sử dụng ban đầu
console.log('====== INITIAL SERVER MEMORY USAGE ======');
memoryMonitor.logMemoryUsage('SERVER STARTUP');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Log memory trước khi kết nối MongoDB
memoryMonitor.logMemoryUsage('BEFORE MONGODB CONNECTION');

mongoose.connect(DB).then(() => {
  console.log('Connect to database successful');
  // Log memory sau khi kết nối MongoDB
  memoryMonitor.logMemoryUsage('AFTER MONGODB CONNECTION');
});

// Initialize model loading
console.log('Initializing disease prediction model...');
modelLoader
  .initializeModel()
  .then(() => {
    console.log('Disease prediction model loaded successfully');

    // Log tổng memory sử dụng sau khi tải model
    const memoryInfo = memoryMonitor.logMemoryUsage('TOTAL AFTER MODEL LOAD');

    // In ra thông báo nếu bộ nhớ gần vượt quá giới hạn 512MB của Render
    const usedMemory = memoryInfo.process.rss;
    const limit = 512;
    const percentUsed = (usedMemory / limit) * 100;

    console.log(`\n==== MEMORY USAGE SUMMARY ====`);
    console.log(
      `Total Process Memory: ${usedMemory}MB / ${limit}MB (${percentUsed.toFixed(
        2
      )}% of Render limit)`
    );

    if (percentUsed > 80) {
      console.warn(
        "⚠️ WARNING: Memory usage is above 80% of Render's 512MB limit"
      );
    } else if (percentUsed > 60) {
      console.warn(
        "⚠️ NOTICE: Memory usage is above 60% of Render's 512MB limit"
      );
    } else {
      console.log('✅ Memory usage is within safe limits for Render');
    }
    console.log('==============================\n');
  })
  .catch((err) => {
    console.error('Error loading disease prediction model:', err);
    console.log(
      'Server will start, but disease prediction may not work properly'
    );
  });

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
  memoryMonitor.logMemoryUsage('AFTER SERVER START');
});

// Thêm kiểm tra memory định kỳ để theo dõi sự rò rỉ bộ nhớ
setInterval(() => {
  memoryMonitor.logMemoryUsage('PERIODIC CHECK');
}, 3600000); // Kiểm tra mỗi giờ
