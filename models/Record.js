import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contact: {
    type: String,
    required: [true, 'Contact is required'],
    trim: true,
    maxlength: [20, 'Contact cannot exceed 20 characters']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative'],
    max: [10000000, 'Amount too large']
  },
  remainingAmount: {
    type: Number,
    required: [true, 'Remaining amount is required'],
    min: [0, 'Amount cannot be negative'],
    max: [10000000, 'Amount too large']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Validation: remainingAmount cannot be greater than totalAmount
recordSchema.pre('save', function(next) {
  if (this.remainingAmount > this.totalAmount) {
    next(new Error('Remaining amount cannot be greater than total amount'));
  } else {
    next();
  }
});

const Record = mongoose.model('Record', recordSchema);

export default Record;