const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const upload = require('../middleware/multer');

router.get('/', protect, chatController.getAllChats);
router.get('/appointment/:appointmentId', protect, chatController.getChatByAppointment);
router.post('/:chatId/messages', protect, upload.single('file'), chatController.sendMessage);
router.put('/:chatId/read', protect, chatController.markAsRead);

module.exports = router;
