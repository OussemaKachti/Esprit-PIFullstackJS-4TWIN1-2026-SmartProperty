require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Test de connexion MongoDB...\n');

// Afficher l'URL (masquer le mot de passe)
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI non trouvé dans .env');
  process.exit(1);
}

const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`📍 URI: ${maskedUri}\n`);

// Tester la connexion
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    console.log('\n✨ Tout fonctionne correctement !\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion MongoDB:\n');
    console.error(`Message: ${error.message}\n`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('💡 Solutions possibles:');
      console.error('1. Vérifiez que votre MONGODB_URI est correct dans .env');
      console.error('2. Format attendu: mongodb+srv://user:password@cluster.mongodb.net/database');
      console.error('3. Remplacez "username", "password" et "cluster" par vos vraies valeurs');
      console.error('4. Ou utilisez MongoDB local: mongodb://localhost:27017/smartproperty\n');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Erreur d\'authentification:');
      console.error('1. Vérifiez le username et password dans MongoDB Atlas');
      console.error('2. Database Access → Vérifier les credentials\n');
    } else if (error.message.includes('IP')) {
      console.error('💡 Erreur d\'accès réseau:');
      console.error('1. Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)');
      console.error('2. Attendez 2-3 minutes que la config soit appliquée\n');
    }
    
    process.exit(1);
  });
