const express = require("express");
const router = express.Router();

const authAdminController = require("../controllers/authAdmin.controlller");

router.get("/signin", authAdminController.getAuthForm);
router.post("/signin", authAdminController.signIn);
router.get("/signout", authAdminController.signOut);

module.exports = router;
