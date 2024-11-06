const User = require("../models/User");

const bcrypt = require("bcryptjs");
const auth = require("../auth");

// Register a User
module.exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, mobileNo } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).send({ error: "Email invalid" });
  }

  if (!mobileNo || mobileNo.length !== 11) {
    return res.status(400).send({ error: "Mobile number invalid" });
  }

  if (!password || password.length < 8) {
    return res
      .status(400)
      .send({ error: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Duplicate Email found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNo,
    });

    await newUser.save();
    return res.status(201).send({ message: "Registered successfully" });
  } catch (error) {
    console.error("Error in registering the user", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

// Login
module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Enter your email" });
  }

  if (!email.includes("@")) {
    return res.status(400).send({ error: "Invalid Email" });
  }

  if (!password) {
    return res.status(400).send({ error: "Enter your password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "User not Found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      return res.status(200).send({ access: auth.createAccessToken(user) });
    } else {
      return res.status(401).send({ error: "Email and password do not match" });
    }
  } catch (error) {
    console.error("Error in finding the user", error);
    return res.status(500).send({ error: "Error in find" });
  }
};

// Get User details
module.exports.userDetails = async (req, res) => {
  const userId = req.user.id;

  if (!req.body.id || req.body.id.length !== 24) {
    return res.status(400).send({ error: "Please enter a valid user ID" });
  }

  if (userId !== req.body.id) {
    return res
      .status(400)
      .send({ error: "You are not authorized to access this profile" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not Found" });
    }

    user.password = "";

    return res.status(200).send(user);
  } catch (error) {
    console.error("Error in finding the user", error);
    return res.status(500).send({ error: "Failed to fetch user profile" });
  }
};

//Update User as Admin
module.exports.updateToAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).send({ error: "User not found" });
    }

    if (userToUpdate.isAdmin) {
      return res.status(400).send({ error: "User is already an admin" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );

    const userObject = {
      isAdmin: updatedUser.isAdmin,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      password: updatedUser.password,
      mobileNo: updatedUser.mobileNo,
    };

    return res.status(200).send({
      message: "Admin priveleges granted successfully",
      userObject,
    });
  } catch (error) {
    console.error("Error updating admin status", error);
    return res.status(500).send({ error: "Failed in Find", details: error });
  }
};

// Reset Password
module.exports.updatePassword = async (req, res) => {
  const { id } = req.user;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .send({ error: "Password should be at least 8 characters" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    return res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error updating password", error);
    return res
      .status(500)
      .send({ error: "Failed to update password", details: error });
  }
};
