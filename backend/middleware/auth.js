const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error(
        "Authorization header is missing"
      );

      error.statusCode = 401;

      throw error;
    }

    if (!authHeader.startsWith("Bearer ")) {
      const error = new Error(
        "Authorization header must use Bearer token"
      );

      error.statusCode = 401;

      throw error;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      const error = new Error(
        "Token is missing"
      );

      error.statusCode = 401;

      throw error;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 401;

      throw error;
    }

    req.user = user;

    next();

  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action"
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };

// module.exports = {
//   protect
// };