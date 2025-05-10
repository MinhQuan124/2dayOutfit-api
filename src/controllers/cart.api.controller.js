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

  //[POST] /api/v1/cart/:userId - add/update cart
  addOrUpdateCartAPI: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, price, size, color, image, quantity } = req.body;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [{ productId, price, size, color, image, quantity }],
        });
      } else {
        const existingItem = cart.items.find(
          (item) =>
            item.productId.toString() === productId &&
            item.size === size &&
            item.color === color
        );

        if (existingItem) {
          existingItem.quantity = quantity;
        } else {
          cart.items.push({ productId, price, size, color, image, quantity });
        }
      }

      cart.updatedAt = Date.now();
      await cart.save();
      res.json(cart);
    } catch (error) {
      console.error("Add/update cart failed", error);
      res.json({ error });
    }
  },

  //[DELETE] /api/v1/cart/:userId/items - delete cart
  deleteCartAPI: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, size, color, image } = req.body;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.json({ message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) =>
          item.productId.toString() !== productId ||
          item.size !== size ||
          item.color !== color ||
          item.image !== image
      );

      cart.updatedAt = Date.now();
      await cart.save();

      res.json(cart);
    } catch (error) {
      console.log("Deleting cart failed", error);
      res.json({ error });
    }
  },
};

module.exports = cartAPIController;
