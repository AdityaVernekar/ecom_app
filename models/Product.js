const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the product name"],
      trim: true,
      maxlength: [100, "Product name should be less than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter the product price"],
    },
    description: {
      type: String,
      required: [true, "Please enter the product description"],
    },
    photos: [
      {
        id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Please select the product category"],
      enum: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies", "misc"],
    },
    brand: {
      type: String,
      required: [true, "Please enter the product brand"],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    noOfReviews: {
      type: Number,
      default: 0,
    },
    review: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stocks: {
      type: Number,
      required: [true, "Please enter the product stocks"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
