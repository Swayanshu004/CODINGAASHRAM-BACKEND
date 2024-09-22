const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content title is required.']
  },
  url: {
    type: String,
    required: [true, 'URL is required.']
  },
  topic: {
    type: String,
    enum: ['video', 'blog', 'question', 'exercise'],
    required: [true, 'Topic type is required.']
  }
}, {timestamps: true});

export const Content = mongoose.model('Content', contentSchema);