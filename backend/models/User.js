
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },

    bio: {
      type: String,
      default: "",
      trim: true
    },

    skills: {
      type: [String],
      default: []
    },

    avatar: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    website: {
      type: String,
      default: "",
      trim: true
    },

    github: {
      type: String,
      default: "",
      trim: true
    },

    linkedin: {
      type: String,
      default: "",
      trim: true
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
    role: {
  type: String,
  enum: ["founder", "collaborator"],
  required: true,
  default: "collaborator"
},
    headline: { type: String, trim: true, maxlength: 100, default: "" },
    bio: { type: String, trim: true, maxlength: 1000, default: "" },
    skills: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Don't hash password again when updating other fields
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// Compare password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
