const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const auth = require("../auth");

// Create Product
module.exports.createProduct = async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).send({ error: "Please enter the required fields" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).send({ error: "Invalid price value" });
  }

  try {
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res.status(409).send({ error: "Product already exists" });
    }

    const product = new Product({
      name,
      description,
      price,
    });

    await product.save();
    return res.status(201).send({ product });
  } catch (error) {
    console.error("Error in creating a product", error);
    return res
      .status(500)
      .send({ error: "Failed to create product", details: error });
  }
};

// Retrieve all products
module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products.length) {
      return res.status(404).send({ error: "No Products found" });
    }

    return res.status(200).send({ products });
  } catch (error) {
    console.error("Error finding products", error);
    return res.status(500).send({ error: "Failed to fetch products" });
  }
};

// Retrieve all active products
module.exports.getAllActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    if (!products.length) {
      return res.status(404).send({ error: "No Active Products Found" });
    }

    return res.status(200).send({ products });
  } catch (error) {
    console.error("Error finding active products", error);
    return res.status(500).send({
      error: "Failed to fetch active products",
      details: error.message,
    });
  }
};

// Retrieve a single product
module.exports.getProduct = async (req, res) => {
  const productId = req.params.productId;

  if (productId.length < 24) {
    return res.status(400).send({ error: "Product ID is invalid" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send({ error: "Product not found" });
    }

    return res.status(200).send({ product });
  } catch (error) {
    console.error("Error finding the product", error);
    return res
      .status(500)
      .send({ error: "Failed to fetch product", details: error.message });
  }
};

// Update Product info
module.exports.updateProductInfo = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).send({ error: "Please enter the required fields" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).send({ error: "Invalid price value" });
  }

  if (productId.length < 24) {
    return res.status(400).send({ error: "Product ID is invalid" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    return res.status(200).send({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error in updating the product", error);
    return res
      .status(500)
      .send({ error: "Failed to update the product", details: error.message });
  }
};

// Archive Product
module.exports.archiveProduct = async (req, res) => {
  const { productId } = req.params;

  if (productId.length < 24) {
    return res.status(400).send({ error: "Product ID is invalid" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (product.isActive === false) {
      return res.status(400).send({ error: "Product is already archived" });
    }

    const archivedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    return res.status(200).send({
      message: "Product archived successfully",
      archivedProduct,
    });
  } catch (error) {
    console.error("Error in archiving the product", error);
    return res
      .status(500)
      .send({ error: "Failed to archive the product", details: error.message });
  }
};

//Activate Product
module.exports.activateProduct = async (req, res) => {
  const { productId } = req.params;

  if (productId.length < 24) {
    return res.status(400).send({ error: "Product ID is invalid" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (product.isActive == true) {
      return res.status(400).send({ error: "Product is already active" });
    }

    const activateProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isActive: true,
      },
      { new: true }
    );

    return res.status(200).send({
      message: "Product activated successfully",
      activateProduct,
    });
  } catch (error) {
    console.error("Error activating the product", error);
    return res
      .status(500)
      .send({ error: "Failed to active the product", details: error.message });
  }
};
