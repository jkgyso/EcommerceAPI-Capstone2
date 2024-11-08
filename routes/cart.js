const express = require("express");
const cartController = require("../controllers/cart");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

router.post("/add-to-cart", verify, cartController.addToCart);
router.get("/get-cart", verify, cartController.getCart);
router.patch("/update-cart-quantity", verify, cartController.updateCart);
router.patch(
  "/:productId/remove-from-cart",
  verify,
  cartController.removeCartItem
);
router.put("/clear-cart", verify, cartController.clearCart);
module.exports = router;
