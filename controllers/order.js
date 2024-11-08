const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create Order
module.exports.createOrder = async (req, res) => {
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).send({ message: "Admin is forbidden" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).send({ error: "No Items to Checkout" });
    }

    let newOrder = new Order({
      userId,
      productsOrdered: cart.cartItems,
      totalPrice: cart.totalPrice,
    });

    await newOrder.save();

    await Cart.deleteOne({ userId });

    return res.status(201).send({ message: "Ordered Successfully" });
  } catch (error) {
    console.error("Error Creating the Order", error);
    return res
      .status(500)
      .send({ error: "Failed to create order", details: error.message });
  }
};

// Retrieve User's Orders
module.exports.getOrders = async (req, res) => {
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).send({ message: "Admin is forbidden" });
  }

  try {
    const orders = await Order.find({ userId });

    if (!orders) {
      return res.status(404).send({ error: "No orders found" });
    }

    return res.status(200).send({ orders });
  } catch (error) {
    console.error("Error retrieving orders", error);
    return res
      .status(500)
      .send({ error: "Failed to fetch orders", details: error.message });
  }
};

//Retrieve all orders
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (orders.length === 0) {
      return res.status(404).send({ error: "No orders found" });
    }

    return res.status(200).send({ orders });
  } catch (error) {
    console.error("Error finding orders", error);
    return res
      .status(500)
      .send({ error: "Failed to fetch orders", details: error.message });
  }
};
