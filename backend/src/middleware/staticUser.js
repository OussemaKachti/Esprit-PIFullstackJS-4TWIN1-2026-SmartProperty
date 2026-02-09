
const staticUser = (req, res, next) => {
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    login: 'testuser',
    email: 'test@example.com',
    role: 'ADMIN', // ADMIN, AGENCY, OWNER, TENANT, BUYER
  };
  next();
};

module.exports = staticUser;
