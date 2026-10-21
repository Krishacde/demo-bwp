const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

// REGISTER
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error(
        "Name, email and password are required"
      );

      error.statusCode = 400;

      throw error;
    }

    if (password.length < 6) {
      const error = new Error(
        "Password must be at least 6 characters"
      );

      error.statusCode = 400;

      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error(
        "User already exists"
      );

      error.statusCode = 400;

      throw error;
    }

    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    next(error);
  }
};


// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error(
        "Email and password are required"
      );

      error.statusCode = 400;

      throw error;
    }

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error(
        "Invalid email or password"
      );

      error.statusCode = 401;

      throw error;
    }

    const passwordMatch =
      await user.comparePassword(password);

    if (!passwordMatch) {
      const error = new Error(
        "Invalid email or password"
      );

      error.statusCode = 401;

      throw error;
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    next(error);
  }
};


// GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user._id
    )
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      throw error;
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  register,
  login,
  getMe
};