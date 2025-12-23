const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join appointment chat room
    socket.on('join-chat', async ({ appointmentId, userId, userType }) => {
      socket.join(`chat-${appointmentId}`);
      socket.appointmentId = appointmentId;
      socket.userId = userId;
      socket.userType = userType;
      
      console.log(`${userType} ${userId} joined chat ${appointmentId}`);
      
      // Notify other party
      socket.to(`chat-${appointmentId}`).emit('user-joined', {
        userId,
        userType
      });
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { appointmentId, text, messageType, attachment } = data;
        
        // Save message to database
        const message = new Message({
          appointmentId,
          senderId: socket.userId,
          senderType: socket.userType,
          senderName: data.senderName,
          messageType: messageType || 'text',
          text,
          attachment
        });
        
        await message.save();
        
        // Update chat last message
        await Chat.findOneAndUpdate(
          { appointmentId },
          { lastMessage: message._id },
          { upsert: true }
        );
        
        // Emit to all users in the room
        io.to(`chat-${appointmentId}`).emit('receive-message', {
          ...message.toObject(),
          timestamp: message.createdAt
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ appointmentId, isTyping }) => {
      socket.to(`chat-${appointmentId}`).emit('user-typing', {
        userId: socket.userId,
        userType: socket.userType,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('mark-read', async ({ appointmentId, messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, appointmentId },
          { read: true, readAt: new Date() }
        );
        
        socket.to(`chat-${appointmentId}`).emit('messages-read', {
          messageIds
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.appointmentId) {
        socket.to(`chat-${socket.appointmentId}`).emit('user-left', {
          userId: socket.userId,
          userType: socket.userType
        });
      }
    });
  });
};