const express = require("express");

const router = express.Router();

const {
  addProduct,
  getAllProduct,
  AdmingetAllProduct,
  getSingleProduct,
  adminUpdateProduct,
  admindeleteProduct,
  addaReview,
  deleteReview,
  getOnlyReviewsForProduct,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/auth");
// user routes
router.route("/").get(getAllProduct);
router.route("/:id").get(getSingleProduct);
router.route("/review").put(isLoggedIn, addaReview).delete(isLoggedIn, deleteReview);
// router.route("/reviews").get(getOnlyReviewsForProduct);

// admin routes
router.route("/add").post([isLoggedIn, customRole("admin")], addProduct);
router.route("/admin/getAll").get([isLoggedIn, customRole("admin")], AdmingetAllProduct);
router
  .route("/admin/product/:id")
  .put([isLoggedIn, customRole("admin")], adminUpdateProduct)
  .delete([isLoggedIn, customRole("admin")], admindeleteProduct);

module.exports = router;
