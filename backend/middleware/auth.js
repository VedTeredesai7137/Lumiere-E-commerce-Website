module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
