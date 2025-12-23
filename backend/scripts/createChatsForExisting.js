const mongoose = require('mongoose');
require('dotenv').config();

// Models
const appointmentSchema = new mongoose.Schema({}, { strict: false });
const chatSchema = new mongoose.Schema({
  appointment: mongoose.Schema.Types.ObjectId,
  patient: mongoose.Schema.Types.ObjectId,
  doctor: mongoose.Schema.Types.ObjectId,
  messages: Array,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: {
    patient: Number,
    doctor: Number
  },
  isActive: Boolean
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Chat = mongoose.model('Chat', chatSchema);

const createChats = async () => {
  try {
    console.log('🚀 Starting chat creation script...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected\n');

    // Find appointments that need chats
    const appointments = await Appointment.find({
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    console.log(`📋 Found ${appointments.length} appointments\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const appointment of appointments) {
      try {
        // Check if chat exists
        const exists = await Chat.findOne({ appointment: appointment._id });
        
        if (exists) {
          console.log(`⏭️  Skip: Appointment ${appointment._id} (chat exists)`);
          skipped++;
          continue;
        }

        // Create chat
        await Chat.create({
          appointment: appointment._id,
          patient: appointment.patient,
          doctor: appointment.doctor,
          messages: [],
          lastMessage: '',
          lastMessageAt: new Date(),
          unreadCount: {
            patient: 0,
            doctor: 0
          },
          isActive: true
        });

        console.log(`✅ Created: Chat for appointment ${appointment._id}`);
        created++;
        
      } catch (error) {
        console.error(`❌ Error: Appointment ${appointment._id} - ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Chats Created:        ${created}`);
    console.log(`⏭️  Chats Skipped:       ${skipped}`);
    console.log(`❌ Errors:               ${errors}`);
    console.log(`📝 Total Appointments:   ${appointments.length}`);
    console.log('='.repeat(50) + '\n');

    if (created > 0) {
      console.log('🎉 Success! Chats have been created.');
      console.log('💡 Tip: Restart your backend server and check the Messages page.\n');
    }

    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run
createChats();