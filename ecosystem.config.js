require('dotenv').config({ path: './backend/.env' });

module.exports = {
  apps: [
    {
      name: 'master-splitter-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        MONGO_URI: process.env.MONGO_URI  ,
        JWT_SECRET: process.env.JWT_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        SETUP_PASSWORD: process.env.SETUP_PASSWORD,
        FRONTEND_URL: process.env.FRONTEND_URL
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

