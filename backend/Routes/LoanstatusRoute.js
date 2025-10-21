import express from 'express';
import Loan from '../models/Loan.js'; // ✅ import Loan model

const router = express.Router();

/**
 * GET /api/getstatusloans
 * Fetch all loan applications and their current statuses
 */
router.get('/', async (req, res) => {
  try {
    // Retrieve all loans from MongoDB
    const loans = await Loan.find().sort({ createdAt: -1 }); // latest first

    res.json({
      success: true,
      data: loans,
    });
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching loan statuses.',
    });
  }
});

export default router;
