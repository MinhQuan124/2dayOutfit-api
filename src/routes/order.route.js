const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");

router.post("/:id/status", orderController.changeOrderStatus);
router.get("/:id", orderController.getOrderDetail);
router.get("/", orderController.getOrders);

module.exports = router;
