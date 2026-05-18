const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const farmerController = require('../controllers/farmerController');
const simulatorController = require('../controllers/simulatorController');
const futureGrowthController = require('../controllers/futureGrowthController');
const logger = require('../utils/logger');

// Basic Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/analyze', upload.single('image'), farmerController.analyzeCrop);
router.get('/history', farmerController.getHistory);
router.delete('/history/:id', (req, res, next) => {
    logger.info(`Incoming DELETE request for history ID: ${req.params.id}`);
    next();
}, farmerController.deleteHistory);
router.post('/crop-schedule', farmerController.getCropSchedule);
router.get('/crop-groups', farmerController.getCropGroups);
router.post('/chat', farmerController.chatWithFarmer);

// Impact Simulator
router.post('/simulator/compare', simulatorController.simulateImpact);
router.get('/simulator/history', simulatorController.getSimulationHistory);

// Future Growth Simulator
router.post('/future-growth/simulate', upload.single('image'), futureGrowthController.simulateGrowth);
router.get('/future-growth/history', futureGrowthController.getHistory);

// Disease Spread & Mutation Risk Simulator (Research Level)
const diseaseSpreadController = require('../controllers/diseaseSpreadController');
router.post('/spread-risk/predict', diseaseSpreadController.predictSpread);
router.get('/spread-risk/history', diseaseSpreadController.getHistory);

// Weather Tool
const weatherController = require('../controllers/weatherController');
router.post('/weather/refine', weatherController.refineWeather);

module.exports = router;
