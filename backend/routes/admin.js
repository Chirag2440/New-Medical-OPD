const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/doctors', adminController.getAllDoctors);
router.get('/patients', adminController.getAllPatients);
router.get('/patients/:id', adminController.getPatientById);
router.put('/approve-doctor/:id', adminController.approveDoctor);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;