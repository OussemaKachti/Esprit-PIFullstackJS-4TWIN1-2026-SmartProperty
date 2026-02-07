const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Utilise MongoDB local pour les tests si MongoDB Atlas n'est pas configuré
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartproperty';
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
