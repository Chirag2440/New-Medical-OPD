const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Chat = require('../models/Chat');
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

    // Create chat automatically when appointment is created
    try {
      const chat = await Chat.create({
        appointment: appointment._id,
        patient: req.user.id,
        doctor: doctorId,
        messages: [],
        isActive: true
      });
      console.log(`✅ Chat created for appointment ${appointment._id}`);
    } catch (chatError) {
      console.error('Error creating chat:', chatError);
    }

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

    // Create chat when status changes to confirmed (if not already exists)
    if (status === 'confirmed') {
      const existingChat = await Chat.findOne({ appointment: appointment._id });
      if (!existingChat) {
        try {
          await Chat.create({
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            messages: [],
            isActive: true
          });
          console.log(`✅ Chat created for confirmed appointment ${appointment._id}`);
        } catch (chatError) {
          console.error('Error creating chat on confirmation:', chatError);
        }
      }
    }

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

// Rest of the controller methods remain the same...
// (Include all other methods from your original appointmentController.js)

exports.getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
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

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

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

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

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

exports.addPrescription = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription to this appointment'
      });
    }

    if (appointment.status !== 'confirmed' && appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add prescription to confirmed or completed appointments'
      });
    }

    const { medicines, instructions, followUp } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one medicine'
      });
    }

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

exports.getUpcomingAppointments = async (req, res) => {
  try {
    let query = {
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    };

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

exports.getAppointmentStats = async (req, res) => {
  try {
    let query = {};

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