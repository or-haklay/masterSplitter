module.exports = {
  apps: [
    {
      name: 'master-splitter-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'fork',
      env_file: './backend/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true,
      watch: false,
      max_memory_restart: '500M',
      // Restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

