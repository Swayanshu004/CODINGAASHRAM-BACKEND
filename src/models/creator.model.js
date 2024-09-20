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

const Creator = mongoose.model('Creator', creatorSchema);

export default Creator;