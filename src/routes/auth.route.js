const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controlller");

router.get("/signin", authController.getAuthForm);
router.post("/signin", authController.signIn);
router.get("/signout", authController.signOut);

module.exports = router;
