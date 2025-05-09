const express = require("express");
const router = express.Router();

const authAPIController = require("../controllers/auth.api.controller");

router.post("/register", authAPIController.registerUser);
router.post("/login", authAPIController.loginUser);
router.post("/verify-email", authAPIController.verifyEmail);
router.get("/verify-email", authAPIController.verifyEmailGet); // GET from email link

module.exports = router;
