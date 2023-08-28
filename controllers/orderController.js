const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.createOrder = BigPromise(async (req, res, next) => {
  const { shippingInfo, orderitems, paymentInfo, taxAmount, shippingAmount, totalAmount } =
    req.body;

  const order = await Order.create({
    shippingInfo,
    orderitems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (!order) {
    return next(new CustomError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getUserOrders = BigPromise(async (req, res, next) => {
  const { _id } = req.user;
  const orders = await Order.find({ user: _id });
  if (!orders) {
    return res.status(404).json({
      success: false,
      message: "No orders found",
    });
  }

  res.status(200).json({
    success: true,
    orders,
  });
});
