/**
 * Modèles Billetterie
 * Collections: tickettypes, ticketpurchases
 * Pour événements publics uniquement
 */

const mongoose = require('mongoose');

// Modèle Type de Billet
const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du type de billet est requis'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  quantityAvailable: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  // Relation avec événement
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Un type de billet doit être associé à un événement']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Initialiser la quantité disponible à la création
ticketTypeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.quantityAvailable = this.quantity;
  }
  next();
});

// Modèle Achat de Billet
const ticketPurchaseSchema = new mongoose.Schema({
  ticketType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketType',
    required: [true, 'Le type de billet est requis']
  },
  // Informations de l'acheteur
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  address: {
    street: {
      type: String,
      required: [true, 'La rue est requise']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est requis']
    },
    country: {
      type: String,
      required: [true, 'Le pays est requis']
    }
  },
  // Référence optionnelle à un utilisateur inscrit
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['en attente', 'confirmé', 'annulé'],
    default: 'confirmé'
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Générer un numéro de billet unique
ticketPurchaseSchema.pre('save', function(next) {
  if (this.isNew && !this.ticketNumber) {
    this.ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index
ticketTypeSchema.index({ event: 1, isActive: 1 });
ticketPurchaseSchema.index({ email: 1, ticketType: 1 });

const TicketType = mongoose.model('TicketType', ticketTypeSchema);
const TicketPurchase = mongoose.model('TicketPurchase', ticketPurchaseSchema);

module.exports = { TicketType, TicketPurchase };
