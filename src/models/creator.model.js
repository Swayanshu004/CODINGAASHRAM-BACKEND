const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty. Please enter a password.'],
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  uploadedContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }
  ],
}, {
    timestamps: true
});

export const Creator = mongoose.model('Creator', creatorSchema);