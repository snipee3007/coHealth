// Trong một file như memoryRoutes.js hoặc thêm vào app.js/server.js
const express = require('express');
const router = express.Router();
const memoryMonitor = require('./../../controllers/memoryMonitor.js');
const modelLoader = require('./../../controllers/modelLoader.js');

/**
 * Endpoint để kiểm tra memory usage
 * GET /api/memory
 */
router.get('/', (req, res) => {
  // Lấy thông tin bộ nhớ hệ thống hiện tại
  const currentMemory = memoryMonitor.getMemoryInfo();

  // Lấy thông tin bộ nhớ của model (nếu đã tải)
  const modelMemory = modelLoader.getModelMemoryUsage();

  res.status(200).json({
    timestamp: new Date(),
    current: currentMemory,
    modelLoadMemory: modelMemory,
    renderLimit: {
      totalMB: 512,
      usedPercentage: (currentMemory.process.rss / 512) * 100,
      status:
        currentMemory.process.rss > 450
          ? 'CRITICAL'
          : currentMemory.process.rss > 350
          ? 'WARNING'
          : 'OK',
    },
  });
});

/**
 * Endpoint để chủ động làm sạch bộ nhớ (garbage collection)
 * POST /api/memory/gc
 */
router.post('/gc', (req, res) => {
  const beforeMemory = memoryMonitor.getMemoryInfo();

  // Yêu cầu Node.js thực hiện garbage collection nếu có thể
  if (global.gc) {
    global.gc();
    console.log('Garbage collection requested');
  } else {
    console.log('Garbage collection không khả dụng. Khởi động với --expose-gc');
  }

  // Đợi một khoảng thời gian ngắn để đảm bảo GC hoàn thành
  setTimeout(() => {
    const afterMemory = memoryMonitor.getMemoryInfo();

    res.status(200).json({
      success: true,
      before: beforeMemory,
      after: afterMemory,
      saved: {
        systemMB: beforeMemory.system.used - afterMemory.system.used,
        processMB: beforeMemory.process.rss - afterMemory.process.rss,
        heapMB: beforeMemory.process.heapUsed - afterMemory.process.heapUsed,
      },
    });
  }, 500);
});

module.exports = router;

// Để sử dụng router này, thêm vào server.js hoặc app.js:
// const memoryRoutes = require('./memoryRoutes');
// app.use('/api/memory', memoryRoutes);
