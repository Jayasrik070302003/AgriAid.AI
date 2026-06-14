const express = require('express');
const router = express.Router();
const multer = require('multer');
const farmerController = require('../controllers/farmerController');
const simulatorController = require('../controllers/simulatorController');
const futureGrowthController = require('../controllers/futureGrowthController');
const diseaseSpreadController = require('../controllers/diseaseSpreadController');
const weatherController = require('../controllers/weatherController');
const cropCalendarController = require('../controllers/cropCalendarController');
const toolsController = require('../controllers/toolsController');
const aiFarmingAssistant = require('../controllers/aiFarmingAssistantController');
const climateRiskController = require('../controllers/climateRiskController');

// Memory storage — files go to Supabase, not disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Crop Analysis
router.post('/analyze', upload.single('image'), farmerController.analyzeCrop);
router.get('/history', farmerController.getHistory);
router.get('/crop-groups', farmerController.getCropGroups);
router.delete('/history/:id', farmerController.deleteHistory);
router.post('/chat', farmerController.chatWithFarmer);
router.get('/crop-suggestions', farmerController.getCropSuggestions);
router.post('/soil-profile', farmerController.getSoilProfile);

// Impact Simulator
router.post('/simulator/compare', simulatorController.simulateImpact);
router.get('/simulator/history', simulatorController.getSimulationHistory);

// Climate Risk Predictor
router.get('/simulator/weather-live', climateRiskController.getLiveWeather);
router.post('/simulator/climate-risk', climateRiskController.predictClimateRisk);

// Future Growth Simulator
router.post('/future-growth/simulate', upload.single('image'), futureGrowthController.simulateGrowth);
router.get('/future-growth/history', futureGrowthController.getHistory);

// Disease Spread Simulator
router.post('/spread-risk/predict', diseaseSpreadController.predictSpread);
router.get('/spread-risk/history', diseaseSpreadController.getHistory);

// Crop Calendar
router.post('/autocomplete-crop', cropCalendarController.autocompleteCrop);
router.post('/crop-schedule', cropCalendarController.generateCropSchedule);

// Weather Advisory
router.get('/weather/by-coords', weatherController.getWeather);
router.post('/weather/refine', weatherController.refineWeather);
router.get('/reverse-geocode', weatherController.reverseGeocode);

// Tools — AI powered
router.post('/tools/soil-analysis', toolsController.soilAnalysis);
router.post('/tools/parse-soil-report', upload.single('image'), toolsController.parseSoilReport);
router.post('/tools/fertilizer-advisory', toolsController.fertilizerAdvisory);
router.get('/tools/market-sentiment', toolsController.marketSentiment);

// AI Farming Assistant
router.post('/assistant/chat', aiFarmingAssistant.handleChat);
router.post('/assistant/analyze-image', upload.single('image'), aiFarmingAssistant.handleImageAnalysis);
router.get('/assistant/suggestions', aiFarmingAssistant.getSuggestedQuestions);
router.post('/assistant/explain-result', aiFarmingAssistant.explainResult);

module.exports = router;
