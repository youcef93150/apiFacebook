/**
 * Modèle Album Photo
 * Collection: albums
 * Associé à 1 événement
 */

const mongoose = require('mongoose');

// Sous-schéma pour les commentaires
const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sous-schéma pour les photos
const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'L\'URL de la photo est requise']
  },
  caption: {
    type: String,
    default: '',
    maxlength: [200, 'La légende ne peut pas dépasser 200 caractères']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const albumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'album est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  // Relation avec événement (obligatoire)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Un album doit être associé à un événement']
  },
  // Photos de l'album
  photos: [photoSchema],
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

// Index
albumSchema.index({ event: 1 });

module.exports = mongoose.model('Album', albumSchema);
