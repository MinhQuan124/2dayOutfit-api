const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // timeout sau 10s
    });
    console.log("Connection successful !");
  } catch (error) {
    console.log("Connection failed !");
  }
}

module.exports = { connect };
