const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms, consultationType } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !timeSlot || !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is approved
    if (!doctor.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not approved yet'
      });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Generate video room ID for video consultations
    const videoRoomId = consultationType === 'video' ? uuidv4() : null;

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      appointmentDate: appointmentDateTime,
      timeSlot,
      symptoms,
      consultationType: consultationType || 'video',
      videoRoomId,
      status: 'pending'
    });

    // Populate appointment data
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone photo')
      .populate({
        path: 'doctor',
        populate: {
          path: 'userId',
          select: 'name email phone photo'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments (filtered by user role)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query.doctor = doctor._id;
    }
    // Admin can see all appointments (no filter)

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch appointments with populated data
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone photo address')
      .populate({
        path: 'doctor',
        populate: {
          path: 'userId',
          select: 'name email phone photo'
        }
      })
      .populate('payment')
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone photo address dateOfBirth gender')
      .populate({
        path: 'doctor',
        populate: {
          path: 'userId',
          select: 'name email phone photo'
        }
      })
      .populate('payment');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = doctor && appointment.doctor._id.toString() === doctor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get Appointment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = appointment.patient.toString() === req.user.id;
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Extract update fields
    const { status, notes, appointmentDate, timeSlot } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (appointmentDate) updateData.appointmentDate = appointmentDate;
    if (timeSlot) updateData.timeSlot = timeSlot;

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email phone' }
      });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = appointment.patient.toString() === req.user.id;
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    const { cancelReason } = req.body;

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancelReason = cancelReason || 'No reason provided';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add prescription to appointment
// @route   PUT /api/appointments/:id/prescription
// @access  Private (Doctor only)
exports.addPrescription = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription to this appointment'
      });
    }

    // Validate appointment status
    if (appointment.status !== 'confirmed' && appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add prescription to confirmed or completed appointments'
      });
    }

    const { medicines, instructions, followUp } = req.body;

    // Validate prescription data
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one medicine'
      });
    }

    // Update appointment with prescription
    appointment.prescription = {
      medicines,
      instructions: instructions || '',
      followUp: followUp || null
    };
    appointment.status = 'completed';

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email phone' }
      });

    res.status(200).json({
      success: true,
      message: 'Prescription added successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Add Prescription Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res) => {
  try {
    let query = {
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    };

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query.doctor = doctor._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone photo')
      .populate({
        path: 'doctor',
        populate: {
          path: 'userId',
          select: 'name email phone photo'
        }
      })
      .sort('appointmentDate')
      .limit(10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get Upcoming Appointments Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
exports.getAppointmentStats = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query.doctor = doctor._id;
    }

    const [total, pending, confirmed, completed, cancelled, today] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({ ...query, status: 'pending' }),
      Appointment.countDocuments({ ...query, status: 'confirmed' }),
      Appointment.countDocuments({ ...query, status: 'completed' }),
      Appointment.countDocuments({ ...query, status: 'cancelled' }),
      Appointment.countDocuments({
        ...query,
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        today
      }
    });
  } catch (error) {
    console.error('Get Appointment Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};