const Cart = require("../models/Cart");
const User = require("../models/User");
const auth = require("../auth");

module.exports.addToCart = async (req, res) => {
  const { productId, quantity, subtotal } = req.body;
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  try {
    let cart = await Cart.findById(userId);

    if (!cart) {
      cart = new Cart({
        userId,
        cartItems: [{ productId, quantity, subtotal }],
        totalPrice: subtotal,
      });
    } else {
      const existingItem = cart.cartItems.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal *= quantity;
      } else {
        cart.items.push({ productId, quantity, subtotal });
      }
      cart.totalPrice += subtotal;
    }

    await cart.save();
    return res.status(201).send({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart", error);
    return res
      .status(500)
      .send({ error: "Failed adding item to cart", details: error.message });
  }
};
