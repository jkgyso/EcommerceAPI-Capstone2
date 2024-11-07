const express = require("express");
const cartController = require("../controllers/cart");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

router.post("/add-to-cart", verify, cartController.addToCart);

module.exports = router;
