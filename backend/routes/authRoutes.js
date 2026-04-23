const express = require('express');
const router = express.Router();
const { register, login, getDashboard } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected dashboard route
router.get('/dashboard', protect, getDashboard);

module.exports = router;
