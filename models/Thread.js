/**
 * Modèle Fil de Discussion
 * Collection: threads
 * Contrainte: Lié SOIT à un groupe, SOIT à un événement (mutuellement exclusif)
 */

const mongoose = require('mongoose');

// Sous-schéma pour les messages
const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu du message est requis'],
    maxlength: [5000, 'Le message ne peut pas dépasser 5000 caractères']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Réponses aux messages
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'La réponse ne peut pas dépasser 2000 caractères']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du fil est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères']
  },
  // Relation mutuellement exclusive: SOIT groupe, SOIT événement
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  // Messages du fil
  messages: [messageSchema],
  // Participants du fil
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
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

// Validation: Un fil doit être lié SOIT à un groupe SOIT à un événement (exclusif)
threadSchema.pre('save', function(next) {
  const hasGroup = this.group !== null && this.group !== undefined;
  const hasEvent = this.event !== null && this.event !== undefined;
  
  if (hasGroup && hasEvent) {
    next(new Error('Un fil ne peut pas être lié à la fois à un groupe ET à un événement'));
  } else if (!hasGroup && !hasEvent) {
    next(new Error('Un fil doit être lié soit à un groupe, soit à un événement'));
  }
  next();
});

// Index
threadSchema.index({ group: 1 });
threadSchema.index({ event: 1 });

module.exports = mongoose.model('Thread', threadSchema);
