const User = require("../models/User.model");

const userController = {
  //[GET] /admin/users
  getAllUser: async (req, res) => {
    try {
      const users = await User.find({}).lean();
      res.render("users/index", { users });
    } catch (error) {
      res.json({ error });
    }
  },

  //[GET] /admin/user/create
  createAdminForm: (req, res) => {
    res.render("users/create");
  },

  // [POST] /admin/users/store
  storeAdmin: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const checkEmail = await User.findOne({ email });
      if (checkEmail) {
        return res.render("users/create", {
          error: "This email already exists! Please input another email",
          name,
          email,
        });
      }

      if (password.length < 6) {
        return res.render("users/create", {
          error: "Password must be at least 6 characters",
          name,
          email,
        });
      }

      const userAdmin = new User({ name, email, password, role: "admin" });
      await userAdmin.save();
      res.redirect("/admin/users");
    } catch (error) {
      console.error("Admin creation error:", error);
      res.json({ error });
    }
  },

  // [GET] /admin/users/edit
  getUserEditForm: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).lean();
      res.render("users/edit", { user });
    } catch (error) {
      res.json({ error });
    }
  },

  // [PUT] /admin/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.render("users/edit", {
          error: "User not found",
          name,
          email,
        });
      }

      if (!name || !email) {
        return res.render("users/edit", {
          error: "Name and email are required",
          formData: { name, email },
        });
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.render("users/edit", {
          error: "This email already exists! Please input another email",
          name,
          email,
        });
      }

      if (password && password.length > 0) {
        if (password.length < 6) {
          return res.render("users/edit", {
            error: "Password must be at least 6 characters",
            name,
            email,
          });
        }
        user.password = password;
      }

      user.name = name;
      user.email = email;

      await user.save();
      res.redirect("/admin/users");
    } catch (error) {
      console.error("Admin updating error:", error);
      res.json({ error });
    }
  },

  //[DELETE] /admin/users/:id
  deleteUser: async (req, res) => {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.redirect("/admin/users");
    } catch (err) {
      console.error("Delete user failed", err);
      res.status(500).json(err);
    }
  },
};

module.exports = userController;
