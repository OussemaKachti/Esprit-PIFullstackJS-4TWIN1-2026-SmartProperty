require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');

console.log('🔧 Initialisation de l\'utilisateur statique pour les tests...\n');

const staticUserId = '507f1f77bcf86cd799439011';

const staticUser = {
  _id: staticUserId,
  login: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+33612345678',
  role: 'ADMIN',
};

async function initStaticUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si le user existe déjà
    const existingUser = await User.findById(staticUserId);
    
    if (existingUser) {
      console.log('ℹ️  L\'utilisateur statique existe déjà :');
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   Login: ${existingUser.login}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}\n`);
    } else {
      // Créer l'utilisateur statique
      const user = await User.create(staticUser);
      console.log('✅ Utilisateur statique créé avec succès :');
      console.log(`   ID: ${user._id}`);
      console.log(`   Login: ${user.login}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}\n`);
    }

    console.log('✨ Configuration terminée ! Vous pouvez maintenant lancer : npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  }
}

initStaticUser();
