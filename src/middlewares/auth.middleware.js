const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (req.originalUrl.startsWith("/api/")) {
    return next();
  }

  // Check if token existed
  if (!token) {
    if (req.originalUrl.startsWith("/admin/auth")) {
      return next();
    }
    return res.redirect("/admin/auth/signin");
  }

  try {
    // decode token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    //find user in database
    const user = await User.findById(decodedToken.userId).select(
      "name role email"
    );

    // check user
    if (!user || user.role !== "admin") {
      res.clearCookie("token");
      return res.redirect("/admin/auth/signin");
    }

    // assign info user to res.locals
    res.locals.user = {
      name: user.name,
      role: user.role,
      email: user.email,
      _id: user._id,
    };

    //  assign info user to req so others route can access
    req.user = user;

    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.clearCookie("token");
    return res.redirect("/admin/auth/signin");
  }
};

module.exports = authMiddleware;
