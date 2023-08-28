const BigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary");
const CustomError = require("../utils/customError");
const Product = require("../models/Product");
const WhereClause = require("../utils/whereClause");

// user routes
exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultperpage = 4;

  const productsObj = new WhereClause(Product.find(), req.query).search().filter();

  let products = productsObj.base;
  //   console.log(products);

  productsObj.pager(resultperpage);

  products = await productsObj.base.clone();
  const filteredProducts = products.length;

  res.status(200).json({
    status: "success",
    filteredProducts,
    products,
  });
});
exports.getSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found ", 400));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// admin routes

exports.addProduct = BigPromise(async (req, res, next) => {
  //images
  let images = [];

  if (!req.files) {
    return next(new CustomError("Please upload at least one image", 400));
  }

  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
        folder: "products",
      });

      images.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = images;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    product,
  });
});

exports.AdmingetAllProduct = BigPromise(async (req, res, next) => {
  const resultperpage = 2;

  const productsObj = new WhereClause(Product.find(), req.query).search().filter();

  let products = productsObj.base;
  //   console.log(products);

  productsObj.pager(resultperpage);

  products = await productsObj.base.clone();
  const filteredProducts = products.length;

  res.status(200).json({
    status: "success",
    filteredProducts,
    products,
  });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found ", 400));
  }

  let images = [];

  if (req.files) {
    for (let i = 0; i < product.photos.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }

    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
        folder: "products",
      });

      images.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  product.photos = images;
  await product.updateOne(
    {
      $set: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        brand: req.body.brand,
        stocks: req.body.stocks,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  await product.save();

  res.status(200).json({
    status: "success",
    product,
  });
});

exports.admindeleteProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found ", 400));
  }
  for (let i = 0; i < product.photos.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
  }

  await product.remove();
  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});

exports.addaReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  console.log(req.body);
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  // console.log(product);

  const alreadyReview = product.review.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReview) {
    product.review.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
  } else {
    product.review.push(review);
    product.noOfReviews = product.review.length;
  }

  product.ratings =
    product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Review added successfully",
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const review = product.review.filter((rev) => rev.user.toString() !== req.user._id.toString());

  const numberOfReviews = review.length;

  product.ratings =
    product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length;
  await Product.findByIdAndUpdate(
    productId,
    {
      review,
      noOfReviews: numberOfReviews,
      ratings: product.ratings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
  });
});

exports.getOnlyReviewsForProduct = BigPromise(async (req, res, next) => {
  // const { productId } = req.query;
  // console.log(productId);
  // const product = await Product.find({ _id: productId });

  // res.status(200).json({
  //   status: "success",
  //   reviews: product.review,
  // });

  return res.send("hello");
});
