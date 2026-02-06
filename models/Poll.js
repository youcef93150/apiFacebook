/**
 * Modèle Sondage
 * Collection: polls
 * Lié à un événement
 */

const mongoose = require('mongoose');

// Sous-schéma pour les options de réponse
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Le texte de l\'option est requis'],
    trim: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'La question du sondage est requise'],
    trim: true,
    minlength: [5, 'La question doit contenir au moins 5 caractères'],
    maxlength: [500, 'La question ne peut pas dépasser 500 caractères']
  },
  // Options de réponse (minimum 2)
  options: {
    type: [optionSchema],
    validate: {
      validator: function(v) {
        return v && v.length >= 2;
      },
      message: 'Un sondage doit avoir au moins 2 options'
    }
  },
  // Relation avec événement (obligatoire)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Un sondage doit être associé à un événement']
  },
  // Permet de voter pour une seule option (choix unique)
  allowMultipleChoices: {
    type: Boolean,
    default: false
  },
  // Date de clôture du sondage (optionnel)
  closeDate: {
    type: Date,
    default: null
  },
  isClosed: {
    type: Boolean,
    default: false
  },
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

// Méthode pour vérifier si un utilisateur a déjà voté
pollSchema.methods.hasUserVoted = function(userId) {
  return this.options.some(option => 
    option.votes.some(vote => vote.user.toString() === userId.toString())
  );
};

// Index
pollSchema.index({ event: 1 });

module.exports = mongoose.model('Poll', pollSchema);
