const Appointment = require('../models/Appointment');

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name email phone photo' }
      })
      .populate('payment')
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMedicalHistory = async (req, res) => {
  try {
    const completedAppointments = await Appointment.find({
      patient: req.user.id,
      status: 'completed'
    })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name specialization' }
      })
      .select('appointmentDate doctor prescription notes')
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      count: completedAppointments.length,
      history: completedAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};