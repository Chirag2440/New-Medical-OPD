const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join appointment chat room
    socket.on('join-chat', async ({ chatId, userId, userType }) => {
      socket.join(`chat-${chatId}`);
      socket.chatId = chatId;
      socket.userId = userId;
      socket.userType = userType;
      
      console.log(`${userType} ${userId} joined chat ${chatId}`);
      
      // Notify other party
      socket.to(`chat-${chatId}`).emit('user-joined', {
        userId,
        userType
      });
    });

    // Handle new message
    socket.on('send-chat-message', async (data) => {
      try {
        const { chatId, message } = data;
        
        if (!chatId || !message) {
          console.error('Missing chatId or message');
          return;
        }

        console.log('📨 Received message via socket:', { chatId, messageId: message._id });
        
        // Emit to all users in the room
        io.to(`chat-${chatId}`).emit('receive-chat-message', {
          message: message,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ chatId, userId, userName, isTyping }) => {
      socket.to(`chat-${chatId}`).emit('user-typing', {
        userId,
        userName,
        isTyping
      });
    });

    // Handle read receipt
    socket.on('read-message', async ({ chatId, messageId, readAt }) => {
      try {
        io.to(`chat-${chatId}`).emit('message-read-receipt', {
          messageId,
          readAt,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.chatId) {
        socket.to(`chat-${socket.chatId}`).emit('user-left', {
          userId: socket.userId,
          userType: socket.userType
        });
      }
    });
  });
};