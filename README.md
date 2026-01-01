# Master Splitter 🐀🍕

WhatsApp-integrated expense splitting application that automatically detects and tracks shared expenses within groups.

## Features

- 🤖 **WhatsApp Integration**: Automatically detects expenses from WhatsApp messages
- 💰 **Smart Expense Tracking**: Uses AI (OpenAI) to parse expense information
- 👥 **Multi-User Support**: Manage expenses across multiple apartments/groups
- 📊 **Balance Calculation**: Automatically calculates who owes whom
- 🔐 **Secure Authentication**: JWT-based auth with bcrypt password hashing
- 📱 **Modern UI**: React-based responsive frontend

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- WhatsApp Integration via [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
- OpenAI API for message parsing
- JWT authentication
- Security: Helmet, Rate Limiting, CORS

### Frontend
- React 19
- Vite build tool
- Bootstrap 5
- Axios for API calls
- React Router for navigation

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- OpenAI API key
- WhatsApp account (for bot integration)

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/youruser/masterSplitter.git
cd masterSplitter
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env
# Edit .env with your actual values:
# - MONGO_URI
# - JWT_SECRET (generate a strong random string)
# - OPENAI_API_KEY
# - PORT (default: 5000)
# - FRONTEND_URL (for CORS)
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file from example
cp .env.example .env
# Edit .env:
# - VITE_BACKEND_URL (default: http://localhost:5000)
```

### 4. Start MongoDB
```bash
# Make sure MongoDB is running
sudo systemctl start mongod
# Or if using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for hot reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev  # Runs on http://localhost:3000
```

The backend API will be available at `http://localhost:5000` and the frontend at `http://localhost:3000`.

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to AWS Lightsail or other platforms.

### Quick Deploy Summary

1. Setup server with Node.js, MongoDB, Nginx, PM2
2. Clone repository and configure environment variables
3. Build frontend: `npm run build`
4. Start with PM2: `pm2 start ecosystem.config.js`
5. Configure Nginx reverse proxy
6. Setup SSL with Certbot

## Project Structure

```
masterSplitter/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (WhatsApp, AI, etc.)
│   ├── utils/           # Helper functions
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   └── vite.config.js
├── scripts/             # Deployment & maintenance scripts
├── nginx/               # Nginx configuration
└── ecosystem.config.js  # PM2 configuration
```

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user
- `GET /api/users/my-owned` - Get balance with other users

### Apartments
- `GET /api/apartments/my` - Get user's apartment
- `POST /api/apartments/:apartmentId` - Join apartment
- `POST /api/apartments/connect-group` - Connect WhatsApp group
- `GET /api/apartments/invite-code` - Get invite code

### Expenses
- `GET /api/expenses/my-expenses` - Get user's expenses
- `POST /api/expenses/manual` - Create manual expense
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense

### WhatsApp
- `POST /api/whatsapp/start` - Start WhatsApp session
- `GET /api/whatsapp/qr` - Get QR code for authentication

### Health
- `GET /health` - Health check endpoint

## Environment Variables

### Backend
```env
MONGO_URI=mongodb://localhost:27017/master_splitter
JWT_SECRET=your-super-secure-random-string-min-32-chars
OPENAI_API_KEY=sk-proj-your-key-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Frontend
```env
VITE_BACKEND_URL=https://yourdomain.com
```

## Security Features

- ✅ Helmet.js for security headers
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ CORS restricted to frontend domain
- ✅ JWT token authentication
- ✅ Bcrypt password hashing
- ✅ Input validation with Joi

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Authors

- Or Haklay ([@or-haklay](https://github.com/or-haklay))

---

Made with ❤️ for easier expense splitting

