import Product from "../models/Product.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email profilePicture",
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;

    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      category,
      countInStock: parseInt(countInStock),
      image: req.file ? req.file.path : req.body.image,
      user: req.user._id, // Store who created the product
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "user",
      "name email profilePicture",
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.countInStock =
      req.body.countInStock !== undefined
        ? req.body.countInStock
        : product.countInStock;
    product.image = req.body.image || product.image;
    product.oldPrice = req.body.oldPrice || product.oldPrice;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(
      updatedProduct._id,
    ).populate("user", "name email profilePicture");

    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userId = req.user._id;
    const hasLiked = product.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      product.likes = product.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      product.likeCount = Math.max(0, product.likeCount - 1);
    } else {
      // Like
      product.likes.push(userId);
      product.likeCount = product.likeCount + 1;
    }

    await product.save();

    res.json({
      liked: !hasLiked,
      likeCount: product.likeCount,
      productId: product._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProductsByUser = async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.userId })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
