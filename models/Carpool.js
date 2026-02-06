/**
 * Modèle Covoiturage (BONUS)
 * Collection: carpools
 * Associé à un événement
 */

const mongoose = require('mongoose');

// Sous-schéma pour les passagers
const passengerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupPoint: {
    type: String,
    default: ''
  },
  confirmedAt: {
    type: Date,
    default: Date.now
  }
});

const carpoolSchema = new mongoose.Schema({
  // Relation avec événement
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Un covoiturage doit être associé à un événement']
  },
  // Conducteur
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un conducteur est requis']
  },
  // Détails du trajet
  departureLocation: {
    type: String,
    required: [true, 'Le lieu de départ est requis'],
    trim: true
  },
  departureTime: {
    type: Date,
    required: [true, 'L\'heure de départ est requise']
  },
  // Places disponibles
  availableSeats: {
    type: Number,
    required: [true, 'Le nombre de places disponibles est requis'],
    min: [1, 'Il doit y avoir au moins 1 place'],
    max: [8, 'Maximum 8 places']
  },
  // Prix par personne
  pricePerPerson: {
    type: Number,
    required: [true, 'Le prix par personne est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  // Détour maximum (en km)
  maxDetour: {
    type: Number,
    required: [true, 'Le détour maximum est requis'],
    min: [0, 'Le détour ne peut pas être négatif'],
    default: 10
  },
  // Passagers
  passengers: {
    type: [passengerSchema],
    validate: {
      validator: function(v) {
        return v.length <= this.availableSeats;
      },
      message: 'Le nombre de passagers ne peut pas dépasser le nombre de places disponibles'
    }
  },
  // Notes supplémentaires
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  // Détails du véhicule
  vehicleInfo: {
    model: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    licensePlate: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Méthode pour calculer les places restantes
carpoolSchema.virtual('remainingSeats').get(function() {
  return this.availableSeats - this.passengers.length;
});

// Index
carpoolSchema.index({ event: 1, isActive: 1 });
carpoolSchema.index({ driver: 1 });

module.exports = mongoose.model('Carpool', carpoolSchema);
