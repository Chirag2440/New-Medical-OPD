const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'system'],
    default: 'text'
  },
  text: String,
  attachment: {
    url: String,
    filename: String,
    mimetype: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);