import { Schema } from 'mongoose';

const artifactSchema = new Schema({
  artifactId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    meiliIndex: true,
  },
  description: {
    type: String,
    required: true,
    meiliIndex: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  artifactCode: {
    type: String,
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  author: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    meiliIndex: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  duration: {
    type: String,
    default: '10-15 min',
  },
  thumbnail: {
    type: String,
    default: '🎯',
  },
  likes: {
    type: Number,
    default: 0,
  },
  plays: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


// Add indexes for better performance
artifactSchema.index({ category: 1, isPublished: 1 });
artifactSchema.index({ author: 1, createdAt: -1 });
artifactSchema.index({ likes: -1 });
artifactSchema.index({ plays: -1 });

export default artifactSchema;