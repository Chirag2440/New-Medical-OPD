const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    console.log('🔧 Fixing Chat Collection Indexes...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected\n');

    const db = mongoose.connection.db;
    const chatsCollection = db.collection('chats');

    // Step 1: Get all existing indexes
    console.log('📋 Current indexes:');
    const indexes = await chatsCollection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)}`);
    });
    console.log('');

    // Step 2: Drop the problematic appointmentId index if it exists
    try {
      await chatsCollection.dropIndex('appointmentId_1');
      console.log('✅ Dropped old appointmentId_1 index\n');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  appointmentId_1 index does not exist (already dropped)\n');
      } else {
        console.log('⚠️  Could not drop appointmentId_1:', error.message, '\n');
      }
    }

    // Step 3: Ensure correct appointment index exists
    try {
      await chatsCollection.createIndex({ appointment: 1 }, { unique: true });
      console.log('✅ Created appointment_1 index (unique)\n');
    } catch (error) {
      console.log('ℹ️  appointment_1 index already exists\n');
    }

    // Step 4: Show updated indexes
    console.log('📋 Updated indexes:');
    const newIndexes = await chatsCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)}`);
    });
    console.log('');

    // Step 5: Clean up any invalid chats (where appointment is null)
    const invalidChats = await chatsCollection.find({ appointment: null }).toArray();
    if (invalidChats.length > 0) {
      console.log(`🗑️  Found ${invalidChats.length} invalid chats (appointment is null)`);
      const deleteResult = await chatsCollection.deleteMany({ appointment: null });
      console.log(`✅ Deleted ${deleteResult.deletedCount} invalid chats\n`);
    } else {
      console.log('✅ No invalid chats found\n');
    }

    console.log('═'.repeat(50));
    console.log('🎉 SUCCESS! Indexes fixed.');
    console.log('═'.repeat(50));
    console.log('💡 Now run: node scripts/createChatsForExisting.js\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run
fixIndexes();