const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// This will be mapped to /api/users/register
router.post('/register', registerUser);


// Mapped to /api/users/login
router.post('/login', loginUser);

module.exports = router;