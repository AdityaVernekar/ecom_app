const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      max: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "manager"],
    },
    photo: {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the plain text password before saving

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// validate the password with passed password
userSchema.methods.validatePassword = async function (user_password) {
  return await bcrypt.compare(user_password, this.password);
};

// generate the JWT token

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generate forgot password token

userSchema.methods.generateForgotPasswordToken = function () {
  // generate random string
  const forgotToken = crypto.randomBytes(20).toString("hex");
  // hash the token
  this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex");

  // set the expire time
  this.forgotPasswordExpire = Date.now() + 10 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
