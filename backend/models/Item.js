const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Lost', 'Found'],
      required: [true, 'Type (Lost/Found) is required'],
    },
    category: {
      type: String,
      enum: ['Electronics', 'Clothing', 'Books', 'Accessories', 'Documents', 'Keys', 'Wallet', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      trim: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
