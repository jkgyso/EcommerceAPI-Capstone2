const Cart = require("../models/Cart");
const User = require("../models/User");
const auth = require("../auth");

// Retrieve user's cart
module.exports.getCart = async (req, res) => {
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send({ error: "Cart is empty" });
    }

    return res.status(200).send({ cart });
  } catch (error) {
    console.error("Error retrieving cart", error);
    return res
      .status(500)
      .send({ error: "Failed to fetch cart", details: error.message });
  }
};

// Add to Cart
module.exports.addToCart = async (req, res) => {
  const { productId, quantity, subtotal } = req.body;
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex !== -1) {
      cart.cartItems[itemIndex].quantity += quantity;
      cart.cartItems[itemIndex].subtotal += subtotal;
    } else {
      cart.cartItems.push({ productId, quantity, subtotal });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

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

// Change Product Quantities in Cart
module.exports.updateCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity, subtotal } = req.body;

  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex !== -1) {
      cart.cartItems[itemIndex].quantity += quantity;
      cart.cartItems[itemIndex].subtotal += subtotal;
    } else {
      cart.cartItems.push({ productId, quantity, subtotal });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    await cart.save();
    return res.status(200).send({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating the cart", error);
    return res
      .status(500)
      .send({ error: "Failed in updating the cart", details: error.message });
  }
};

// Remove item from the cart
module.exports.removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  try {
    let updatedCart = await Cart.findOne({ userId });

    if (!updatedCart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    const itemIndex = updatedCart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ error: "Item not found in the cart" });
    }

    updatedCart.cartItems.splice(itemIndex, 1);

    updatedCart.totalPrice = updatedCart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    await updatedCart.save();
    return res.status(200).send({
      message: "Item removed from cart successfully",
      updatedCart,
    });
  } catch (error) {
    console.error("Error removing item from cart", error);
    return res.status(500).send({
      error: "Failed to remove item from the cart",
      details: error.message,
    });
  }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).send({ error: "Cart is already empty" });
    }

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();
    return res.status(200).send({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in clearing the cart", error);
    return res
      .status(500)
      .send({ error: "Failed to clear the cart", details: error.message });
  }
};
