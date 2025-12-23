const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getChatByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name photo')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name photo' }
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = doctor && appointment.doctor._id.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let chat = await Chat.findOne({ appointment: appointmentId })
      .populate('patient', 'name photo')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name photo' }
      })
      .populate('messages.sender', 'name photo');

    if (!chat) {
      chat = await Chat.create({
        appointment: appointmentId,
        patient: appointment.patient._id,
        doctor: appointment.doctor._id
      });

      chat = await Chat.findById(chat._id)
        .populate('patient', 'name photo')
        .populate({
          path: 'doctor',
          populate: { path: 'userId', select: 'name photo' }
        })
        .populate('messages.sender', 'name photo');
    }

    // Reset unread count
    if (isPatient) chat.unreadCount.patient = 0;
    if (isDoctor) chat.unreadCount.doctor = 0;
    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllChats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      query.doctor = doctor._id;
    }

    const chats = await Chat.find(query)
      .populate('patient', 'name photo')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'name photo' }
      })
      .populate('appointment', 'status appointmentDate')
      .sort('-lastMessageAt');

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// SEND MESSAGE
// ===============================
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = chat.patient.toString() === req.user.id;
    const isDoctor = doctor && chat.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const message = {
      sender: req.user.id,
      senderModel: req.user.role === 'doctor' ? 'Doctor' : 'User',
      content,
      messageType: 'text',
      isRead: false
    };

    chat.messages.push(message);

    chat.lastMessage = content;
    chat.lastMessageAt = new Date();

    if (isPatient) {
      chat.unreadCount.doctor += 1;
    } else {
      chat.unreadCount.patient += 1;
    }

    await chat.save();

    const newMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};


// ===============================
// MARK AS READ
// ===============================
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isPatient = chat.patient.toString() === req.user.id;
    const isDoctor = doctor && chat.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
    });

    if (isPatient) chat.unreadCount.patient = 0;
    if (isDoctor) chat.unreadCount.doctor = 0;

    await chat.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
