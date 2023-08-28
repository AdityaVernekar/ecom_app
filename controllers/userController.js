const User = require("../models/User");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return next(new CustomError("Please enter all fields", 400));
  }

  if (!req.files) {
    return next(new CustomError("Please upload a file", 400));
  }
  let file = req.files.photo;
  let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new CustomError("User already exist", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  user.password = undefined;

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomError("Please enter all fields", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomError("User does not exist Please SignUp", 400));
  }

  const isMatch = await user.validatePassword(password);

  user.password = undefined;

  if (!isMatch) {
    return next(new CustomError("Password is incorrect", 400));
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new CustomError("Please enter your email", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  if (user) {
    const forgotToken = await user.generateForgotPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get("host")}/api/v1/user/resetpassword/${forgotToken}`;

    const message = () => {
      return `
      Hey ${user.name},Click on the link to reset your password ${url}`;
    };

    try {
      await sendEmail(user.email, "LCO STORE - Reset Password", message());
    } catch (error) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new CustomError("There was an error sending the email", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Email sent",
    });
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encrypToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encrypToken,
    forgotPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new CustomError("Token is invalid or has expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new CustomError("Passwords do not match", 400));
  } else {
    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  }
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    user: user,
  });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
  const { id, role } = req.user;
  if (!req.user) {
    return next(new CustomError("Please login to continue", 400));
  }
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(id).select("+password");
  console.log(user);
  const isPasswordMatch = await user.validatePassword(oldPassword);

  if (!isPasswordMatch) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const { id, role } = req.user;

  const users = await User.find(
    { $or: [{ role: "user" }, { role: "manager" }] },
    { name: 1, email: 1, _id: 1, role: 1 }
  );
  res.status(200).json({
    status: "success",
    count: users.length,
    users: users,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" }, { name: 1, email: 1, _id: 1 });
  res.status(200).json({
    status: "success",
    count: users.length,
    users: users,
  });
});

exports.getSingleUser = BigPromise(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  res.status(200).json({
    status: "success",
    user: user,
  });
});
