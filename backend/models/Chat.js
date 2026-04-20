const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Doctor'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // Each appointment can only have one chat
  },
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
  messages: [messageSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    patient: {
      type: Number,
      default: 0
    },
    doctor: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ appointment: 1 }, { unique: true });
chatSchema.index({ patient: 1, doctor: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Update lastMessage and timestamp before saving
chatSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = lastMsg.content.substring(0, 100);
    this.lastMessageAt = lastMsg.createdAt || new Date();
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);