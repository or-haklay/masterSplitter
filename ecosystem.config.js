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
        MONGO_URI: 'mongodb://localhost:27017/master_splitter',
        JWT_SECRET: 'mflaYL3q8WOZteCJqWmlwXE1JJuutETtn/mkeYnnyVM=',
        OPENAI_API_KEY: 'sk-proj-g2fWQVNZN9ujhOY_xpjXuYX_IOhcsOC60btKIumnyUVXs4srngC_QPliBE8Q-NeYTl38khaXb4T3BlbkFJqK0tupGwOAPZd3oS-xasx_iAF3eTFRONTEND',
        SETUP_PASSWORD: '2506',
        FRONTEND_URL: 'https://mastersplitter.hayotush.com'
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

