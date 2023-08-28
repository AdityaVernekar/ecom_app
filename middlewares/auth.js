const BigPromise = require("./bigPromise");
const User = require("../models/User");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  if (!token) {
    return next(new CustomError("Please login to continue", 401));
  }

  const { id, role } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("You ara malicious", 401));
  }
  req.user = user;

  next();
});

exports.customRole = (...roles) => {
  return BigPromise(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("You are not authorized for this resource", 401));
    }
    next();
  });
};
