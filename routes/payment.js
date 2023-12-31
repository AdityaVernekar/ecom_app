const express = require("express");
const {
  sendStripeKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");

const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/auth");

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
