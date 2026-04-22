// Role-based authorization middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // For now, allow all requests (development mode)
    // TODO: Implement proper role checking from JWT token
    console.log(`Role check for roles: ${allowedRoles.join(', ')} - allowing request (development mode)`);
    next();
  };
};

module.exports = {
  checkRole
};
