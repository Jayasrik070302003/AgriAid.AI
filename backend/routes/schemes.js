const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemesController');

router.post('/search', schemesController.searchSchemes);

module.exports = router;
