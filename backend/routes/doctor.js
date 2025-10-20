const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', protect, authorize('doctor'), upload.single('photo'), doctorController.updateDoctor);
router.delete('/:id', protect, authorize('admin', 'doctor'), doctorController.deleteDoctor);
router.put('/:id/availability', protect, authorize('doctor'), doctorController.updateAvailability);

module.exports = router;