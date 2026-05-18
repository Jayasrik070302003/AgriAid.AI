const express = require('express');
const router = express.Router();
const multer = require('multer');
const farmerController = require('../controllers/farmerController');
const simulatorController = require('../controllers/simulatorController');
const futureGrowthController = require('../controllers/futureGrowthController');
const diseaseSpreadController = require('../controllers/diseaseSpreadController');
const weatherController = require('../controllers/weatherController');

// Memory storage — files go to Supabase, not disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Crop Analysis
router.post('/analyze', upload.single('image'), farmerController.analyzeCrop);
router.get('/history', farmerController.getHistory);
router.get('/crop-groups', farmerController.getCropGroups);
router.delete('/history/:id', farmerController.deleteHistory);
router.post('/chat', farmerController.chatWithFarmer);

// Impact Simulator
router.post('/simulator/compare', simulatorController.simulateImpact);
router.get('/simulator/history', simulatorController.getSimulationHistory);

// Future Growth Simulator
router.post('/future-growth/simulate', upload.single('image'), futureGrowthController.simulateGrowth);
router.get('/future-growth/history', futureGrowthController.getHistory);

// Disease Spread Simulator
router.post('/spread-risk/predict', diseaseSpreadController.predictSpread);
router.get('/spread-risk/history', diseaseSpreadController.getHistory);

// Weather Advisory
router.post('/weather/refine', weatherController.refineWeather);

module.exports = router;
