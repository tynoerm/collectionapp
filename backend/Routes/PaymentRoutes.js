import express from 'express';
import { Paynow } from 'paynow'; // default import, not { Paynow }
const router = express.Router();

// === helper to normalise Zim phone numbers to +263 format ===
function formatPhoneNumber(phone) {
  let p = phone.toString().trim();
  if (p.startsWith('0')) {
    p = '+263' + p.slice(1);
  }
  if (!p.startsWith('+263')) {
    p = '+263' + p; // fallback
  }
  return p;
}


// Initialise Paynow
const paynow = new Paynow(
    '22028', // your integration ID
    '99335ca4-e96a-4d5a-91c8-59f0bc7e947b' // your integration key
);

// GET: Fetch loans to be paid
router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    try {
        const [rows] = await db.query('SELECT id, amount FROM loans');
        res.json(rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'DB error', error: err });
    }
});

// POST: Make payment
router.post('/payments', async (req, res) => {
  console.log('Payment request body:', req.body);
  const { loanId, amount, phone, paymentMethod } = req.body;

  if (!loanId || !amount || !phone || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const db = req.app.locals.db;

    // normalise phone
    const formattedPhone = formatPhoneNumber(phone);

    // Create Paynow payment – use your registered email OR omit it in test mode
    const payment = paynow.createPayment(`Loan-${loanId}`,'tinomutendamutemaringa@gmail.com'); 
    // if you want to include your merchant email instead:
    

    payment.add(`Loan repayment ${loanId}`, Number(amount));

    // Paynow requires full http/https URLs
    payment.resultUrl = 'http://192.168.3.43:5000/api/loanstobepaid/payments/status';
    payment.returnUrl = 'http://192.168.3.43:5000/thankyou';

    const method = paymentMethod.toLowerCase(); // ecocash / onemoney / innbucks etc.

    // send mobile payment
    const result = await paynow.sendMobile(payment, formattedPhone, method);

    if (result.success) {
      // store transaction in DB
      const sql = `INSERT INTO transactions 
          (loan_id, phone, amount, method, status, poll_url) 
          VALUES (?,?,?,?,?,?)`;

      await db.query(sql, [
        loanId,
        formattedPhone,
        amount,
        paymentMethod,
        'Pending',
        result.pollUrl,
      ]);

      res.json({
        success: true,
        message: 'Payment initiated. Enter PIN on your phone.',
        pollUrl: result.pollUrl,
      });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET: Poll payment status
router.get('/payments/status', async (req, res) => {
    const { pollUrl } = req.query;
    if (!pollUrl) {
        return res.status(400).json({ success: false, message: 'pollUrl required' });
    }

    try {
        const db = req.app.locals.db;
        const status = await paynow.pollTransaction(pollUrl);

        const sql = 'UPDATE transactions SET status=? WHERE poll_url=?';
        await db.query(sql, [status.status, pollUrl]);

        res.json(status);
    } catch (err) {
        console.error('Poll error:', err);
        res.status(500).json({ success: false, message: 'Error polling status' });
    }
});

export default router;
