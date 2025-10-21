import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Loan from '../models/Loan.js'; // ✅ Import Loan model

const router = express.Router();

// --- Multer storage setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Accept two files: idImage and selfieImage
const upload = multer({ storage });

// --- POST Loan Application ---
router.post(
  '/',
  upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
  ]),
  async (req, res) => {
    const { fullName, email, phone, amount, purpose } = req.body;

    if (!fullName || !email || !phone || !amount || !purpose) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const idImagePath = req.files['idImage'] ? req.files['idImage'][0].path : null;
    const selfieImagePath = req.files['selfieImage'] ? req.files['selfieImage'][0].path : null;

    try {
      const newLoan = new Loan({
        fullName,
        email,
        phone,
        amount,
        purpose,
        idImagePath,
        selfieImagePath,
      });

      await newLoan.save();

      res.status(201).json({
        success: true,
        message: 'Loan application submitted successfully!',
        data: newLoan,
      });
    } catch (err) {
      console.error('Error saving loan application:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
