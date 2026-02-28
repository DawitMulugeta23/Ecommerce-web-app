import Product from "../models/Product.js";

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;

    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      category,
      countInStock: parseInt(countInStock),
      image: req.file ? req.file.path : req.body.image, // Support both file upload and URL
      user: req.user._id,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "ምርቱ አልተገኘም!" });
    }
  } catch (error) {
    res.status(500).json({ message: "የቴክኒክ ስህተት ተፈጥሯል", error });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "ምርቱ አልተገኘም" });
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

    // Handle old price for sale
    if (req.body.oldPrice) {
      product.oldPrice = req.body.oldPrice;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
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
      return res.status(404).json({ message: "ምርቱ አልተገኘም" });
    }

    await product.deleteOne();
    res.json({ message: "ምርቱ በትክክል ተሰርዟል" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.countInStock = req.body.countInStock;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "ምርቱ አልተገኘም" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
