const Cart = require("../models/Cart.model");

const cartAPIController = {
  //[GET] /api/v1/cart/:userId - get cart by user id
  getCartAPI: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId }).populate(
        "items.productId"
      ); //populate (noSQL) = join (SQL)

      if (!cart) {
        return res.json({ userId: req.params.userId, items: [] });
      }

      //Filter not ordered items
      const filteredItems = cart.items.filter((item) => item.ordered !== true);

      res.json({ ...cart.toObject(), items: filteredItems });
    } catch (error) {
      console.error("Get cart failed", error);
      res.json({ error });
    }
  },

  //[POST] /api/v1/cart/:userId - add cart
  addCartAPI: async (req, res) => {
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

          if (existingItem.quantity > 10) {
            existingItem.quantity = 10;
          }
        } else {
          const addedQuantity = quantity > 10 ? 10 : quantity;
          cart.items.push({
            productId,
            price,
            size,
            color,
            image,
            quantity: addedQuantity,
            ordered: false,
          });
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

  //[PATCH] /api/v1/cart/:userId/items - patch cart
  updateCartItemQuantity: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, price, size, color, image, updatedQuantity } =
        req.body;

      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const item = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color &&
          item.image === image
      );

      if (!item) return res.status(404).json({ error: "Item not found" });

      item.quantity = updatedQuantity;
      if (item.quantity < 1) item.quantity = 1;

      await cart.save();
      res.json(cart);
    } catch (error) {
      console.error("update cart failed", error);
      res.json({ error });
    }
  },

  // [PATCH] /api/v1/cart/mark-ordered/:userId
  markItemsAsOrdered: async (req, res) => {
    const { userId } = req.params;
    const { cartData } = req.body;
    const items = cartData.items;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      items.forEach((target) => {
        const productId =
          typeof target.productId === "object"
            ? target.productId._id
            : target.productId;

        const itemToUpdate = cart.items.find(
          (item) =>
            item.productId.toString() === productId.toString() &&
            item.size === target.size &&
            item.color === target.color
        );

        if (itemToUpdate) {
          itemToUpdate.ordered = target.ordered;
        }
      });

      await cart.save();
      res.json({ message: "Items updated successfully", cart });
    } catch (error) {
      console.error("Marking items as ordered failed", error);
      res.status(500).json({ error });
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
