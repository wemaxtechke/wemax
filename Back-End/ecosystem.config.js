module.exports = {
  apps: [{
    name: "wemax-api",
    script: "server-optimized.js",
    instances: 1, // SINGLE INSTANCE for cPanel
    exec_mode: "fork",
    max_memory_restart: "150M", // Restart if memory exceeds 150MB
    env: {
      NODE_ENV: "production",
      // Force single-threaded mode for cPanel
      UV_THREADPOOL_SIZE: "4", // Smaller thread pool
      NODE_OPTIONS: "--max-old-space-size=256 --max-semi-space-size=128", // Optimize memory
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    merge_logs: true,
    max_restarts: 3, // Limit restarts per hour
    watch: false, // Don't restart on file changes
    ignore_watch: ["node_modules", "logs"],
    kill_timeout: 5000, // Graceful shutdown timeout
    restart_delay: 5000, // Delay between restarts
  }]
};
