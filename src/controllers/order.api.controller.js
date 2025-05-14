const Order = require("../models/Order.model");

const orderAPIController = {
  //[POST] /api/v1/order/create
  createOrderAPI: async (req, res) => {
    try {
      const {
        userId,
        fullname,
        deliveryAddress,
        phone,
        items,
        totalAmount,
        paymentMethod,
        shippingDateRange,
      } = req.body;

      if (!fullname || !deliveryAddress || !phone) {
        return res.json({ message: "Missing contact info" });
      }

      const order = new Order({
        userId,
        fullname,
        deliveryAddress,
        phone,
        items,
        totalAmount,
        paymentMethod,
        shippingDateRange,
      });

      await order.save();
      res.json({ message: "Order created successfully", order });
    } catch (error) {
      console.error("Create order failed", error);
      res.json({ error });
    }
  },

  //[GET] /api/v1/order - get order
  getOrderAPI: async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await Order.find({ userId, status: { $ne: "Cancelled" } })
        .sort({ createdAt: -1 })
        .populate("items.productId"); //populate (noSQL) = join (SQL);

      res.json(orders);
    } catch (error) {
      console.error("Get order failed", error);
      res.json({ error });
    }
  },

  //[PUT] /api/v1/order/cancel/:id
  cancelOrderAPI: async (req, res) => {
    try {
      const { orderId } = req.params;

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "Cancelled" },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order cancelled", order: updatedOrder });
    } catch (error) {
      console.error("Cancel order failed", error);
      res.status(500).json({ error });
    }
  },
};

module.exports = orderAPIController;
