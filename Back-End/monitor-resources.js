#!/usr/bin/env node

import os from 'os';

// Resource monitoring for cPanel optimization
const MONITOR_INTERVAL = 30000; // 30 seconds
const MEMORY_WARNING = 120 * 1024 * 1024; // 120MB
const MEMORY_CRITICAL = 150 * 1024 * 1024; // 150MB

const getCpuUsage = () => {
  return new Promise((resolve) => {
    const startTime = process.hrtime();
    process.cpuUsage((usage) => {
      const endTime = process.hrtime();
      const elapsed = (endTime[0] * 1000 + endTime[1] / 1000000) - (startTime[0] * 1000 + startTime[1] / 1000000);
      resolve({
        user: usage.user,
        system: usage.system,
        idle: usage.idle,
        irq: usage.irq,
        total: elapsed
      });
    });
  });
};

const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024)
  };
};

const getLoadAverage = () => {
  const load = os.loadavg();
  return {
    '1min': load[0],
    '5min': load[1],
    '15min': load[2]
  };
};

const getProcessCount = () => {
  try {
    // Try to get estimated process count from system load
    const loadAvg = os.loadavg();
    return Math.round(loadAvg[0] * 100); // Rough estimate
  } catch (error) {
    return 1;
  }
};

const logResourceUsage = () => {
  const timestamp = new Date().toISOString();
  const memory = getMemoryUsage();
  const loadAvg = getLoadAverage();
  const processCount = getProcessCount();
  
  console.log(`\n📊 Resource Monitor - ${timestamp}`);
  console.log('==========================================');
  console.log(`Memory Usage:`);
  console.log(`  RSS: ${memory.rss}MB`);
  console.log(`  Heap Used: ${memory.heapUsed}MB / ${memory.heapTotal}MB (${Math.round((memory.heapUsed/memory.heapTotal) * 100)}%)`);
  console.log(`  External: ${memory.external}MB`);
  
  console.log(`\nSystem Load:`);
  console.log(`  1min: ${loadAvg['1min'].toFixed(2)}`);
  console.log(`  5min: ${loadAvg['5min'].toFixed(2)}`);
  console.log(`  15min: ${loadAvg['15min'].toFixed(2)}`);
  
  console.log(`\nProcess Info:`);
  console.log(`  Estimated Processes: ${processCount}`);
  console.log(`  Platform: ${os.platform()}`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Uptime: ${Math.floor(process.uptime())}s`);
  
  // Warnings
  if (memory.rss > MEMORY_WARNING) {
    console.warn(`⚠️  HIGH MEMORY USAGE: ${memory.rss}MB (Warning threshold: ${MEMORY_WARNING / 1024 / 1024}MB)`);
  }
  
  if (memory.rss > MEMORY_CRITICAL) {
    console.error(`🚨 CRITICAL MEMORY USAGE: ${memory.rss}MB (Critical threshold: ${MEMORY_CRITICAL / 1024 / 1024}MB)`);
  }
  
  if (loadAvg['1min'] > 2.0) {
    console.warn(`⚠️  HIGH CPU LOAD: ${loadAvg['1min'].toFixed(2)} (Warning threshold: 2.0)`);
  }
  
  console.log('==========================================\n');
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Close database connections
  try {
    const { closeConnection } = await import('./lib/mysql.js');
    await closeConnection();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
  }
  
  console.log('✅ Graceful shutdown completed');
  process.exit(0);
};

// Setup monitoring
const startMonitoring = () => {
  console.log('🚀 Starting Wemax Resource Monitor');
  console.log(`⏰ Monitoring interval: ${MONITOR_INTERVAL / 1000}s`);
  console.log(`⚠️  Memory warning threshold: ${MEMORY_WARNING / 1024 / 1024}MB`);
  console.log(`🚨  Memory critical threshold: ${MEMORY_CRITICAL / 1024 / 1024}MB`);

  // Start monitoring
  setInterval(logResourceUsage, MONITOR_INTERVAL);
};

// Start monitoring when script runs
startMonitoring();

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Log startup info
logResourceUsage();
