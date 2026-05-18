const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger'); // Import Logger

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request for ${req.url}`);
    next();
});

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
// const authRoutes = require('./routes/auth.routes');
const farmerRoutes = require('./routes/farmer.routes');

// Use Routes
// app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/ml', mlRoutes);

// Health Check
app.get('/', (req, res) => {
    logger.info('Health check endpoint hit');
    res.send('Crop Disease Prediction API is running');
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: 'INTERNAL_SERVER_ERROR',
        details: err.message
    });
});

const db = require('./config/database');

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);

    // Seed Default User (Resilient Check)
    try {
        const [tables] = await db.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            const [rows] = await db.query('SELECT * FROM users WHERE id = 1');
            if (rows.length === 0) {
                await db.query(`
                    INSERT INTO users (id, name, email, password_hash, role) 
                    VALUES (1, 'Test Farmer', 'farmer@example.com', 'hashed_pw', 'farmer')
                `);
                logger.info('Seeded default user (ID 1)');
            }
        } else {
            logger.warn("Users table not found. Please run 'npm run init-db' to setup database schema.");
        }
    } catch (err) {
        logger.error(`Seeding check failed: ${err.message || err}`);
    }
});
