import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });
  
      // --- አዲሱ ማስተካከያ ---
      // በዳታቤዙ ውስጥ ምንም ተጠቃሚ ካለለ (count === 0) የመጀመሪያው ተመዝጋቢ 'admin' ይሆናል
      const isFirstAccount = (await User.countDocuments({})) === 0;
      const role = isFirstAccount ? 'admin' : 'user';
  
      const user = await User.create({ 
        name, 
        email, 
        password, 
        role // እዚህ ጋር ሮሉን እናስቀምጣለን
      });
      // ---------------------
  
      const token = jwt.sign(
        { id: user._id }, process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
  
      res.status(201).json({
        message: isFirstAccount ? "የመጀመሪያው የአድሚን አካውንት ተፈጥሯል!" : "ተጠቃሚ በትክክል ተመዝግቧል",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
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