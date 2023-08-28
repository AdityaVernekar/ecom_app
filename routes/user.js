const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  updatePassword,
  adminAllUser,
  managerAllUser,
  getSingleUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/auth");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetpassword/:token").post(resetPassword);
router.route("/dashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/dashboard/password").put(isLoggedIn, updatePassword);
router.route("/admin/users").get([isLoggedIn, customRole("admin")], adminAllUser);
router.route("/manager/users").get([isLoggedIn, customRole("manager")], managerAllUser);
router.route("/admin/users/:id").get([isLoggedIn, customRole("admin")], getSingleUser);
module.exports = router;
