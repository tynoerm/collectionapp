import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  idImagePath: { type: String },
  selfieImagePath: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Loan', loanSchema);
