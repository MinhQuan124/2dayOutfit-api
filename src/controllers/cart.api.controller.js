const Cart = require("../models/Cart.model");

const cartAPIController = {
  //[GET] /api/v1/cart/:userId - get cart by user id
  getCartAPI: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId }).populate(
        "items.productId"
      ); //populate (noSQL) = join (SQL)

      res.json(cart || { userId: req.params.userId, items: [] });
    } catch (error) {
      console.error("Get cart failed", error);
      res.json({ error });
    }
  },

  //[POST] /api/v1/cart
  addOrUpdateCartAPI: async (req, res) => {},
};

module.exports = cartAPIController;
