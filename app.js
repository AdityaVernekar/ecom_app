const express = require("express");
require("dotenv").config();
var morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookie parser and fileupload middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

// view engine setup
app.set("view engine", "ejs");

//morgan middleware
app.use(morgan("dev"));

// import all routes here

const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");
// router middleware
app.use("/api/v1", home);

//user routes
app.use("/api/v1/user", user);
//product routes

app.use("/api/v1/products", product);

app.use("/payment", payment);

app.use("/api/v1/order", order);

app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});

//export app
module.exports = app;
