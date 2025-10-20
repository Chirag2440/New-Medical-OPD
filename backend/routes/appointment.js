const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), appointmentController.createAppointment);
router.get('/', protect, appointmentController.getAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);
router.put('/:id', protect, appointmentController.updateAppointment);
router.delete('/:id', protect, appointmentController.cancelAppointment);
router.put('/:id/prescription', protect, authorize('doctor'), appointmentController.addPrescription);

module.exports = router;