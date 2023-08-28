const express = require("express");

const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/auth");

const { createOrder, getOneOrder, getUserOrders } = require("../controllers/orderController");

router.route("/create").post(isLoggedIn, createOrder);
router.route("/:id").get(isLoggedIn, customRole("user"), getOneOrder);
router.route("/").get(isLoggedIn, getUserOrders);

module.exports = router;
