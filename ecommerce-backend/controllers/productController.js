import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const product = new Product({
      name,
      price,
      description,
      category,
      countInStock,
      image: req.file.path,
      user: req.user._id // Provided by protect middleware
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};