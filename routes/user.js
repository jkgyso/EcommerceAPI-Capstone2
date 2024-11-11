const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth");
// const passport = require("passport");

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.userDetails);
router.patch(
  "/:id/set-as-admin",
  verify,
  verifyAdmin,
  userController.updateToAdmin
);
router.patch("/update-password", verify, userController.updatePassword);

// Google Auth
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["email", "profile"],
//     prompt: "select_account",
//   })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "users/failed",
//   }),
//   function (req, res) {
//     res.redirect("/users/success");
//   }
// );

// router.get("/failed", (req, res) => {
//   console.log("User is not authenticated");
//   res.send("Failed");
// });

// router.get("/success", isLoggedIn, (req, res) => {
//   console.log("You are logged in");
//   console.log(req.user);
//   res.send(`Welcome ${req.user.displayName}`);
// });

// router.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.log("Error while destroying session: ", err);
//     } else {
//       req.logout(() => {
//         console.log(`You are logged out`);
//         res.redirect("/");
//       });
//     }
//   });
// });
module.exports = router;
