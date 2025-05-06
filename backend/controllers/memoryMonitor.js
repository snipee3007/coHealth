// memoryMonitor.js
const os = require('os');

/**
 * Lấy thông tin bộ nhớ của hệ thống và process
 * @returns {Object} Thông tin về bộ nhớ
 */
function getMemoryInfo() {
  const totalMemMB = Math.round(os.totalmem() / 1024 / 1024);
  const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
  const usedMemMB = totalMemMB - freeMemMB;

  // Lấy thông tin bộ nhớ của Node.js process
  const processMemory = process.memoryUsage();
  const heapUsedMB = Math.round(processMemory.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(processMemory.heapTotal / 1024 / 1024);
  const rssMemMB = Math.round(processMemory.rss / 1024 / 1024);
  const externalMemMB = Math.round((processMemory.external || 0) / 1024 / 1024);

  return {
    system: {
      total: totalMemMB,
      free: freeMemMB,
      used: usedMemMB,
      usedPercentage: Math.round((usedMemMB / totalMemMB) * 100),
    },
    process: {
      rss: rssMemMB, // Resident Set Size - tổng bộ nhớ được cấp phát cho process
      heapTotal: heapTotalMB, // Tổng kích thước heap được cấp phát
      heapUsed: heapUsedMB, // Heap đang sử dụng thực tế
      external: externalMemMB, // Bộ nhớ sử dụng bởi các đối tượng JS bên ngoài V8
      percentage: Math.round((rssMemMB / totalMemMB) * 100), // Phần trăm RAM hệ thống mà process sử dụng
    },
  };
}

/**
 * In thông tin bộ nhớ với nhãn
 * @param {string} label - Nhãn cho việc log bộ nhớ
 */
function logMemoryUsage(label) {
  const memInfo = getMemoryInfo();
  console.log(`\n----- MEMORY USAGE [${label}] -----`);
  console.log(
    `System: ${memInfo.system.used}MB / ${memInfo.system.total}MB (${memInfo.system.usedPercentage}%)`
  );
  console.log(
    `Process: RSS: ${memInfo.process.rss}MB (${memInfo.process.percentage}% of system memory)`
  );
  console.log(
    `         Heap: ${memInfo.process.heapUsed}MB / ${memInfo.process.heapTotal}MB`
  );
  console.log(`         External: ${memInfo.process.external}MB`);
  console.log(`-----------------------------------\n`);

  return memInfo;
}

module.exports = {
  getMemoryInfo,
  logMemoryUsage,
};
