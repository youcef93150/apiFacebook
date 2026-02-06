/**
 * Modèle Événement
 * Collection: events
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'événement est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  location: {
    type: String,
    required: [true, 'Le lieu est requis'],
    trim: true
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false,
    required: true
  },
  // Relation avec groupe (optionnel)
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  // Organisateurs
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['invité', 'intéressé', 'participant', 'refusé'],
      default: 'invité'
    },
    joinedAt: {
      type: Date,
      default: Date.now
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

// Validation: Au moins un organisateur
eventSchema.pre('save', function(next) {
  if (this.organizers.length === 0) {
    next(new Error('Un événement doit avoir au moins un organisateur'));
  }
  next();
});

// Index
eventSchema.index({ startDate: 1, isPrivate: 1 });
eventSchema.index({ group: 1 });

module.exports = mongoose.model('Event', eventSchema);
