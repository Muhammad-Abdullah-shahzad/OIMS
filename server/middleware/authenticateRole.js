exports.authenticateRoles = (...validRoles) => {
    return (req, res, next) => {
      const { role } = req.user;
  
      if (!validRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied for this role" });
      }
  
      next();
    };
  };
  