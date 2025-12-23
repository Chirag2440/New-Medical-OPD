const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Chat = require('../models/Chat');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    
    const payments = await Payment.find({ status: 'success' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingApprovals = await Doctor.countDocuments({ isApproved: false });
    
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalRevenue,
        pendingApprovals
      },
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone photo')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id)
      .select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name' }
      })
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      patient: {
        ...patient.toObject(),
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor approved successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ userId: user._id });
    }

    await Appointment.deleteMany({
      $or: [{ patient: user._id }, { doctor: user._id }]
    });

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createMissingChats = async (req, res) => {
  try {
    // Find all appointments that don't have a chat
    const appointments = await Appointment.find({
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const appointment of appointments) {
      const existingChat = await Chat.findOne({ appointment: appointment._id });
      
      if (existingChat) {
        skipped++;
        continue;
      }

      try {
        await Chat.create({
          appointment: appointment._id,
          patient: appointment.patient,
          doctor: appointment.doctor,
          messages: [],
          isActive: true
        });
        created++;
      } catch (error) {
        errors.push({
          appointmentId: appointment._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Missing chats created successfully',
      summary: {
        created,
        skipped,
        total: appointments.length,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Create Missing Chats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};