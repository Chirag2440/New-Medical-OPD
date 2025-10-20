const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, upload.single('photo'), authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;