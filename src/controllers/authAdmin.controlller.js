const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

const authAdminController = {
  //[GET] /admin/auth
  getAuthForm: (req, res) => {
    res.render("auth/login", { layout: "auth" });
  },

  signIn: async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || user.role !== "admin") {
        return res.render("auth/login", {
          layout: "auth",
          error: "Admin access only",
        });
      }

      const isPassMatch = await user.comparePassword(password);
      if (!isPassMatch) {
        return res.render("auth/login", {
          layout: "auth",
          error: "Wrong password or email",
        });
      }

      //create jwt token
      const token = jwt.sign(
        { userId: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      //send cookie
      res.cookie("token", token, {
        httpOnly: true, //only apply server read cookie (prevent from xss)
        secure: process.env.NODE_ENV === "production", //send cookie through https (production env only)
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect("/");
    } catch (error) {
      console.error("Sign in error:", error);
      res.render("auth/login", {
        layout: "auth",
        error: "Internal server error",
      });
    }
  },

  signOut: (req, res) => {
    //detete cookie
    res.clearCookie("token");

    return res.redirect("/admin/auth/signin");
  },
};

module.exports = authAdminController;
