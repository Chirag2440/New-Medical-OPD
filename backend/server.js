const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const adminRoutes = require('./routes/admin');
const appointmentRoutes = require('./routes/appointment');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup for video calls, chat, and real-time features
const io = socketIO(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'https://new-medical-opd-1.onrender.com',
      process.env.ADMIN_URL || 'https://new-medical-opd-2.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://new-medical-opd-1.onrender.com',
    process.env.ADMIN_URL || 'https://new-medical-opd-2.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Medical OPD API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      doctors: '/api/doctors',
      patients: '/api/patients',
      admin: '/api/admin',
      appointments: '/api/appointments',
      payments: '/api/payments',
      chats: '/api/chats',
      health: '/api/health'
    }
  });
});


const users = new Map(); 
const rooms = new Map(); 
const chatRooms = new Map(); 

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  
  socket.on('join-room', ({ roomId, userId, userType }) => {
    try {
      
      users.set(socket.id, { userId, roomId, userType });

      
      socket.join(roomId);

      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      console.log(`👤 User ${userId} (${userType}) joined video room ${roomId}`);

      // Get all other users in the room
      const usersInRoom = Array.from(rooms.get(roomId))
        .filter(id => id !== socket.id)
        .map(id => {
          const user = users.get(id);
          return {
            socketId: id,
            userId: user?.userId,
            userType: user?.userType
          };
        });

      socket.emit('all-users', usersInRoom);

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userType
      });
    } catch (error) {
      console.error('Error joining video room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  
  socket.on('sending-signal', ({ userToSignal, signal, callerId }) => {
    try {
      io.to(userToSignal).emit('user-joined', { signal, callerId });
    } catch (error) {
      console.error('Error sending signal:', error);
    }
  });

  // WebRTC signaling - returning answer
  socket.on('returning-signal', ({ signal, callerId }) => {
    try {
      io.to(callerId).emit('receiving-returned-signal', { signal, id: socket.id });
    } catch (error) {
      console.error('Error returning signal:', error);
    }
  });

  // ICE candidate exchange
  socket.on('ice-candidate', ({ target, candidate }) => {
    try {
      io.to(target).emit('ice-candidate', { candidate, sender: socket.id });
    } catch (error) {
      console.error('Error with ICE candidate:', error);
    }
  });

  // Video consultation messages
  socket.on('send-message', ({ roomId, message, sender }) => {
    try {
      io.to(roomId).emit('receive-message', {
        message,
        sender,
        timestamp: new Date(),
        socketId: socket.id
      });
      console.log(`💬 Video room message in ${roomId} from ${sender}`);
    } catch (error) {
      console.error('Error sending video room message:', error);
    }
  });

  socket.on('toggle-video', ({ roomId, userId, videoEnabled }) => {
    try {
      socket.to(roomId).emit('user-video-toggle', { userId, videoEnabled, socketId: socket.id });
      console.log(`📹 User ${userId} ${videoEnabled ? 'enabled' : 'disabled'} video`);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  });

  socket.on('toggle-audio', ({ roomId, userId, audioEnabled }) => {
    try {
      socket.to(roomId).emit('user-audio-toggle', { userId, audioEnabled, socketId: socket.id });
      console.log(`🎤 User ${userId} ${audioEnabled ? 'unmuted' : 'muted'} audio`);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  });

  socket.on('start-screen-share', ({ roomId }) => {
    try {
      socket.to(roomId).emit('user-screen-share-started', { socketId: socket.id });
      console.log(`🖥️ User started screen sharing in room ${roomId}`);
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  });

  socket.on('stop-screen-share', ({ roomId }) => {
    try {
      socket.to(roomId).emit('user-screen-share-stopped', { socketId: socket.id });
      console.log(`🖥️ User stopped screen sharing in room ${roomId}`);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    try {
      handleVideoRoomDisconnect(socket.id);
      console.log(`👋 User left video room ${roomId}`);
    } catch (error) {
      console.error('Error leaving video room:', error);
    }
  });


  socket.on('join-chat', ({ chatId, userId, userType }) => {
    try {
      const chatRoomId = `chat_${chatId}`;
      socket.join(chatRoomId);
      
      const existingUser = users.get(socket.id) || {};
      users.set(socket.id, { 
        ...existingUser, 
        userId, 
        chatId: chatRoomId, 
        userType 
      });

      if (!chatRooms.has(chatRoomId)) {
        chatRooms.set(chatRoomId, new Set());
      }
      chatRooms.get(chatRoomId).add(socket.id);

      console.log(`💬 User ${userId} (${userType}) joined chat ${chatId}`);
      
    
      socket.to(chatRoomId).emit('user-online', { userId, userType });
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Leave chat room
  socket.on('leave-chat', ({ chatId, userId }) => {
    try {
      const chatRoomId = `chat_${chatId}`;
      socket.leave(chatRoomId);
      
      // Remove from chat rooms map
      if (chatRooms.has(chatRoomId)) {
        chatRooms.get(chatRoomId).delete(socket.id);
        if (chatRooms.get(chatRoomId).size === 0) {
          chatRooms.delete(chatRoomId);
        }
      }

      socket.to(chatRoomId).emit('user-offline', { userId });
      console.log(`👋 User ${userId} left chat ${chatId}`);
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  });

  
  socket.on('send-chat-message', ({ chatId, message }) => {
    try {
      const chatRoomId = `chat_${chatId}`;
      
      socket.to(chatRoomId).emit('receive-chat-message', {
        message,
        timestamp: new Date()
      });
      
      console.log(`💬 Message sent in chat ${chatId}`);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  });

  // Typing indicator
  socket.on('typing', ({ chatId, userId, userName, isTyping }) => {
    try {
      const chatRoomId = `chat_${chatId}`;
      socket.to(chatRoomId).emit('user-typing', { 
        userId, 
        userName, 
        isTyping 
      });
    } catch (error) {
      console.error('Error with typing indicator:', error);
    }
  });

  // Message read receipt
  socket.on('message-read', ({ chatId, messageId, userId }) => {
    try {
      const chatRoomId = `chat_${chatId}`;
      socket.to(chatRoomId).emit('message-read-receipt', { 
        messageId, 
        userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error with read receipt:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    handleVideoRoomDisconnect(socket.id);
    handleChatDisconnect(socket.id);
    console.log('🔌 User disconnected:', socket.id);
  });

  // Helper function to handle video room disconnect
  function handleVideoRoomDisconnect(socketId) {
    const user = users.get(socketId);
    if (user && user.roomId) {
      const { roomId } = user;
      
      // Remove from rooms
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socketId);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }

      // Notify others in room
      socket.to(roomId).emit('user-disconnected', socketId);
    }
  }

  // Helper function to handle chat disconnect
  function handleChatDisconnect(socketId) {
    const user = users.get(socketId);
    if (user && user.chatId) {
      const { chatId, userId } = user;
      
      // Remove from chat rooms
      if (chatRooms.has(chatId)) {
        chatRooms.get(chatId).delete(socketId);
        if (chatRooms.get(chatId).size === 0) {
          chatRooms.delete(chatId);
        }
      }

      // Notify others in chat
      socket.to(chatId).emit('user-offline', { userId });
    }
    
    // Remove from users map
    users.delete(socketId);
  }
});

// 404 handler - Must be after all routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware - Must be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
    ╔══════════════════════════════════════╗
    ║   🏥 Medical OPD Server Started      ║
    ╠══════════════════════════════════════╣
    ║   Port: ${PORT}                        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}        ║
    ║   API: http://localhost:${PORT}/api    ║
    ║   Features: Video Calls + Live Chat  ║
    ╚══════════════════════════════════════╝
  `);
});

// Export for testing
module.exports = { app, server, io };