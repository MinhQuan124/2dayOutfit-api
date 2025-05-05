const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: { type: String, minLength: 2, maxLength: 100, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Email is invalid"],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true } //add createdAt, updatedAt
);

//hash pass before saving
//use middleware pre-save of mongoose
userSchema.pre("save", async function (next) {
  //if pass is not changed, hash pass will be cancled
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); //10 salt rounds in bcrypt -> 10 times encrypt
  next();
});

//compare pass method
userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userSchema);
