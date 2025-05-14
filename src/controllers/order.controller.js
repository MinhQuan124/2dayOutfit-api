const Order = require("../models/Order.model");

const orderController = {
  //[GET] /admin/orders
  getOrders: async (req, res) => {
    try {
      const orders = await Order.find({}).lean();
      res.render("orders/index", { orders });
    } catch (error) {
      console.error("Error get orders", error);
      res.json({ error });
    }
  },
  getOrderDetail: async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.params.id })
        .lean()
        .sort({ createdAt: -1 })
        .populate("items.productId"); //populate (noSQL) = join (SQL);
      res.render("orders/detail", { order });
    } catch (error) {
      console.error("Error get order detail", error);
      res.json({ error });
    }
  },

  changeOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.redirect("/admin/orders");
      }
      res.redirect("/admin/orders");
    } catch (error) {
      console.error(error);
      res.json({ error });
    }
  },
};

module.exports = orderController;
