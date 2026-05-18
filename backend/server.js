const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
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
