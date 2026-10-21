const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"]
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },

    problem: { type: String, trim: true, maxlength: 2000, default: "" },
    solution: { type: String, trim: true, maxlength: 2000, default: "" },
    lookingFor: { type: String, trim: true, maxlength: 1000, default: "" },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Technology",
          "Healthcare",
          "Education",
          "Finance",
          "E-commerce",
          "Social Impact",
          "Other"
        ],
        message: "Invalid category"
      }
    },

    stage: {
      type: String,
      enum: {
        values: ["Idea", "Prototype", "MVP", "Growth"],
        message: "Invalid stage"
      },
      default: "Idea"
    },

    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],

    teamSize: {
      type: Number,
      min: [1, "Team size must be at least 1"],
      default: 1
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // for upvotes
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // for comments
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        text: {
          type: String,
          trim: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // for proposals
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Idea", ideaSchema);
