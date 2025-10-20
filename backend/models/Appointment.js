const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  consultationType: {
    type: String,
    enum: ['video', 'in-person'],
    default: 'video'
  },
  symptoms: {
    type: String,
    required: true
  },
  notes: String,
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    instructions: String,
    followUp: Date
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  videoRoomId: String,
  cancelReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);