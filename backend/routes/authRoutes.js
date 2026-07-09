const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');


router.post('/register', validateRegistration, AuthController.register);


router.post('/login', AuthController.login);

module.exports = router;