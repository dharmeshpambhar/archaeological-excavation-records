// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not authorized to access this route. Required: ${roles.join(', ')}`
      );
    }
    next();
  };
};

// Check if user is admin
const isAdmin = authorize('Admin');

// Check if user can edit (not viewer)
const canEdit = authorize('Admin', 'Lead Archaeologist', 'Field Assistant');

// Check if user is lead or admin
const isLeadOrAdmin = authorize('Admin', 'Lead Archaeologist');

module.exports = { authorize, isAdmin, canEdit, isLeadOrAdmin };
