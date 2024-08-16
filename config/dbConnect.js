const mongoose = require("mongoose");
const colors = require("colors");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("===================================");
    console.log("Database Connected Successfully".yellow.bold);
  } catch (error) {
    console.log("|");
    console.log("===================================");
    console.log("Database error".red.bold);
    console.error(error);
    process.exit(1);
  }
};

module.exports = dbConnect;