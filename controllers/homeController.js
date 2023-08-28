const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise((req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the home page",
  });
});
