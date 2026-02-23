import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });

    const user = await User.create({ name, email, password });

    // --- አዲሱ ክፍል (JWT Token መፍጠር) ---
    // Token-ን ለመፍጠር የዩዘሩን ID፣ ሚስጥራዊ ቁልፍ (Secret) እና የሚቆይበትን ጊዜ እንሰጠዋለን
    const token = jwt.sign(
      { id: user._id },process.env.JWT_SECRET, // .env ካልሰራ ለጊዜው እንዲህ ይቆይ
      { expiresIn: '30d' } // ለ 30 ቀን የሚቆይ መታወቂያ
    );

    res.status(201).json({
      message: "ተጠቃሚ በትክክል ተመዝግቧል",
      user: { id: user._id, name: user.name, email: user.email },
      token // ቶከኑን ለፍሮንቴንዱ እንልካለን
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. ተጠቃሚውን በኢሜይል መፈለግ
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "ኢሜይል ወይም ፓስወርድ ተሳስቷል!" });
  
      // 2. ፓስወርዱን ማመሳከር (በሞዴሉ ላይ የሰራነውን comparePassword እንጠቀማለን)
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: "ኢሜይል ወይም ፓስወርድ ተሳስቷል!" });
  
      // 3. Token መስጠት
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
  
      res.json({
        message: "እንኳን ደህና መጡ!",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };