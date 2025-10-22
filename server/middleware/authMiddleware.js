const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID and attach it to the request object
      // We exclude the password when fetching the user
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next piece of middleware or the controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isChairperson = (req, res, next) => {
  if (req.user && req.user.role === 'Chairperson') {
    next(); // User is a Chairperson, proceed to the controller
  } else {
    res.status(403).json({ message: 'Forbidden: Access is restricted to Chairpersons' });
  }
};

const isSolver = (req, res, next) => {
  if (req.user && req.user.role === 'Solver') {
    next(); // User is a Solver, proceed
  } else {
    res.status(403).json({ message: 'Forbidden: Access is restricted to Solvers' });
  }
};

module.exports = { protect , isChairperson , isSolver };