import Product from '../models/Product.js';

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
      const { name, price, description, category, countInStock } = req.body;
  
      const product = new Product({
        name,
        price: parseFloat(price), // 👈 እዚህ ጋር parseFloat ተጠቀም
        description,
        category,
        countInStock: parseInt(countInStock), // ለክምችት ደግሞ ሙሉ ቁጥር (Integer)
        image: req.file.path,
        user: req.user._id
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

export const updateProductStock = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.countInStock = req.body.countInStock;
        const updatedProduct = await product.save();
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'ምርቱ አልተገኘም' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };