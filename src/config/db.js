const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/2dayoutfit_dev");
    console.log("Connection successful !");
  } catch (error) {
    console.log("Connection failed !");
  }
}

module.exports = { connect };
