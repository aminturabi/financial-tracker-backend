import express from 'express';
import Record from '../models/Record.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect ALL routes
router.use(protect);

// Input validation middleware
const validateRecordInput = (req, res, next) => {
  const { name, contact, totalAmount, remainingAmount, date } = req.body;
  
  if (!name?.trim() || !contact?.trim() || !totalAmount || !remainingAmount || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({ message: 'Name too long' });
  }

  if (contact.trim().length > 20) {
    return res.status(400).json({ message: 'Contact too long' });
  }

  next();
};

// Get all records for current user
router.get('/', async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Create new record
router.post('/', validateRecordInput, async (req, res) => {
  try {
    const { name, contact, totalAmount, remainingAmount, date } = req.body;

    const total = parseFloat(totalAmount);
    const remaining = parseFloat(remainingAmount);

    if (isNaN(total) || isNaN(remaining)) {
      return res.status(400).json({ message: 'Invalid amount values' });
    }

    if (total < 0 || remaining < 0) {
      return res.status(400).json({ message: 'Amounts cannot be negative' });
    }

    if (remaining > total) {
      return res.status(400).json({ message: 'Remaining amount cannot be greater than total amount' });
    }

    const record = new Record({
      name: name.trim(),
      contact: contact.trim(),
      totalAmount: total,
      remainingAmount: remaining,
      date: new Date(date),
      user: req.user.id
    });

    const newRecord = await record.save();
    res.status(201).json(newRecord);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: 'Error creating record' });
  }
});

// Update record
router.put('/:id', validateRecordInput, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const { name, contact, totalAmount, remainingAmount, date } = req.body;
    const total = parseFloat(totalAmount);
    const remaining = parseFloat(remainingAmount);

    if (isNaN(total) || isNaN(remaining) || total < 0 || remaining < 0 || remaining > total) {
      return res.status(400).json({ message: 'Invalid amount values' });
    }

    record.name = name.trim();
    record.contact = contact.trim();
    record.totalAmount = total;
    record.remainingAmount = remaining;
    record.date = new Date(date);

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: 'Error updating record' });
  }
});

// Delete record
router.delete('/:id', async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await Record.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record' });
  }
});

export default router;