// Middleware temporaire pour ajouter un user statique pendant les tests
// À supprimer quand l'auth sera implémentée

const staticUser = (req, res, next) => {
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    login: 'testuser',
    email: 'test@example.com',
    role: 'ADMIN' // ou 'AGENT' selon les besoins
  };
  next();
};

module.exports = staticUser;
