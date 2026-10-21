const User = require("../models/User");

// GET ALL USERS (Search & Filter)
const getUsers = async (req, res, next) => {
  try {
    const { search, skill } = req.query;

    let query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { bio: regex },
        { location: regex },
        { skills: regex }
      ];
    }

    if (skill) {
      query.skills = { $in: [new RegExp(`^${skill}$`, "i")] };
    }

    const users = await User.find(query)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    if (!user) {
      const error = new Error("User not found");
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

// UPDATE OWN PROFILE
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      skills,
      avatar,
      location,
      website,
      github,
      linkedin
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills.map(s => String(s).trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];
    }
    if (avatar !== undefined) user.avatar = avatar;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// FOLLOW USER
const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      const error = new Error("You cannot follow yourself");
      error.statusCode = 400;
      throw error;
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Add target to current user's following list
    if (!currentUser.following.some(id => id.toString() === targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }

    // Add current user to target user's followers list
    if (!targetUser.followers.some(id => id.toString() === currentUserId)) {
      targetUser.followers.push(currentUserId);
      await targetUser.save();
    }

    const updatedTargetUser = await User.findById(targetUserId)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    res.json({
      success: true,
      message: `You are now following ${targetUser.name}`,
      user: updatedTargetUser
    });
  } catch (error) {
    next(error);
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      const error = new Error("You cannot unfollow yourself");
      error.statusCode = 400;
      throw error;
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Remove target from current user's following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove current user from target user's followers list
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId
    );
    await targetUser.save();

    const updatedTargetUser = await User.findById(targetUserId)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    res.json({
      success: true,
      message: `You unfollowed ${targetUser.name}`,
      user: updatedTargetUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser
};
