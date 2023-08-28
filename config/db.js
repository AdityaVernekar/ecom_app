const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection
    .on("connected", () => {
      console.log("MongoDB is connected");
    })
    .on("error", (err) => {
      console.log("Connection error " + err);
      process.exit(1);
    });
};

module.exports = connectDB;
