const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

// Allow any localhost port (Vite picks 5173, 5174, etc.) + configured CLIENT_URL
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin) return callback(null, true);
        // Allow any localhost/127.0.0.1 port during development
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

const farmerRoutes = require('./routes/farmer.routes');
app.use('/api/farmer', farmerRoutes);

app.get('/', (_req, res) => res.json({ status: 'AgriAid.AI API running', version: '3.0.0' }));

app.use((err, _req, res, _next) => {
    logger.error(`${err.message}\n${err.stack}`);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
