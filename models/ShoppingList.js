/**
 * Modèle Liste de Courses (BONUS)
 * Collection: shoppinglists
 * Associé à un événement
 */

const mongoose = require('mongoose');

// Sous-schéma pour les articles
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'article est requis'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  unit: {
    type: String,
    default: 'unité',
    trim: true
  },
  bringBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    arrivalTime: {
      type: Date,
      default: null
    }
  },
  isProvided: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const shoppingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la liste est requis'],
    trim: true,
    default: 'Liste de courses'
  },
  // Relation avec événement (obligatoire et unique)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Une liste de courses doit être associée à un événement'],
    unique: true
  },
  // Articles de la liste
  items: [itemSchema],
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

// Validation: Chaque article doit être unique par événement
shoppingListSchema.index({ event: 1 }, { unique: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
