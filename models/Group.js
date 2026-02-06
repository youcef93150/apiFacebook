/**
 * Modèle Groupe
 * Collection: groups
 */

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du groupe est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  icon: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['public', 'privé', 'secret'],
    required: [true, 'Le type de groupe est requis'],
    default: 'public'
  },
  // Permissions
  allowMembersToPost: {
    type: Boolean,
    default: true,
    required: true
  },
  allowMembersToCreateEvents: {
    type: Boolean,
    default: false,
    required: true
  },
  // Relations
  administrators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['membre', 'modérateur'],
      default: 'membre'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validation: Au moins un administrateur
groupSchema.pre('save', function(next) {
  if (this.administrators.length === 0) {
    next(new Error('Un groupe doit avoir au moins un administrateur'));
  }
  next();
});

// Index
groupSchema.index({ name: 1, type: 1 });

module.exports = mongoose.model('Group', groupSchema);
