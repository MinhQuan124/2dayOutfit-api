const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

router.get("/create-admin", userController.createAdminForm);
router.post("/store", userController.storeAdmin);
router.get("/:id/edit", userController.getUserEditForm);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/", userController.getAllUser);

module.exports = router;
