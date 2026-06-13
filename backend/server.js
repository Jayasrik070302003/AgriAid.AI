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

// Allow Netlify and Render deploy previews
const netlifyPattern = /^https:\/\/[a-z0-9-]+\.netlify\.app$/;
const renderPattern = /^https:\/\/[a-z0-9-]+\.onrender\.com$/;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin) || netlifyPattern.test(origin) || renderPattern.test(origin)) {
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
const schemesRoutes = require('./routes/schemes');
app.use('/api/farmer', farmerRoutes);
app.use('/api/schemes', schemesRoutes);

app.get('/', (_req, res) => res.json({ status: 'AgriAid.AI API running', version: '3.0.0' }));

app.use((err, _req, res, _next) => {
    logger.error(`${err.message}\n${err.stack}`);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
