/**
 * Routes pour le Covoiturage (BONUS)
 * Endpoints: /api/carpools
 */

const express = require('express');
const router = express.Router();
const Carpool = require('../models/Carpool');
const Joi = require('joi');

// Schéma de validation Joi
const carpoolValidationSchema = Joi.object({
  event: Joi.string().required(),
  driver: Joi.string().required(),
  departureLocation: Joi.string().required(),
  departureTime: Joi.date().required(),
  availableSeats: Joi.number().min(1).max(8).required(),
  pricePerPerson: Joi.number().min(0).required(),
  maxDetour: Joi.number().min(0).required(),
  notes: Joi.string().max(500).allow(''),
  vehicleInfo: Joi.object({
    model: Joi.string().allow(''),
    color: Joi.string().allow(''),
    licensePlate: Joi.string().allow('')
  })
});

const passengerValidationSchema = Joi.object({
  userId: Joi.string().required(),
  pickupPoint: Joi.string().allow('')
});

// GET - Récupérer tous les covoiturages
router.get('/', async (req, res) => {
  try {
    const { eventId, isActive } = req.query;
    let filter = {};
    
    if (eventId) filter.event = eventId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const carpools = await Carpool.find(filter)
      .populate('event', 'name startDate location')
      .populate('driver', 'firstName lastName profilePicture')
      .populate('passengers.user', 'firstName lastName profilePicture')
      .sort({ departureTime: 1 });
    
    // Ajouter les places restantes à chaque covoiturage
    const carpoolsWithSeats = carpools.map(carpool => ({
      ...carpool.toObject(),
      remainingSeats: carpool.availableSeats - carpool.passengers.length
    }));
    
    res.json({
      success: true,
      count: carpools.length,
      data: carpoolsWithSeats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un covoiturage par ID
router.get('/:id', async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id)
      .populate('event', 'name description startDate location')
      .populate('driver', 'firstName lastName email profilePicture')
      .populate('passengers.user', 'firstName lastName email profilePicture');
    
    if (!carpool) {
      return res.status(404).json({
        success: false,
        error: 'Covoiturage non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...carpool.toObject(),
        remainingSeats: carpool.availableSeats - carpool.passengers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouveau covoiturage
router.post('/', async (req, res) => {
  try {
    const { error, value } = carpoolValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const carpool = new Carpool(value);
    await carpool.save();
    
    const populatedCarpool = await Carpool.findById(carpool._id)
      .populate('event', 'name startDate')
      .populate('driver', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Covoiturage créé avec succès',
      data: populatedCarpool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un covoiturage
router.put('/:id', async (req, res) => {
  try {
    const {
      departureLocation,
      departureTime,
      availableSeats,
      pricePerPerson,
      maxDetour,
      notes,
      vehicleInfo,
      isActive
    } = req.body;
    
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({
        success: false,
        error: 'Covoiturage non trouvé'
      });
    }
    
    // Si on réduit le nombre de places, vérifier qu'il n'y a pas trop de passagers
    if (availableSeats && availableSeats < carpool.passengers.length) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de réduire le nombre de places en dessous du nombre de passagers actuels'
      });
    }
    
    const updatedCarpool = await Carpool.findByIdAndUpdate(
      req.params.id,
      {
        departureLocation,
        departureTime,
        availableSeats,
        pricePerPerson,
        maxDetour,
        notes,
        vehicleInfo,
        isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
    .populate('event', 'name')
    .populate('driver', 'firstName lastName')
    .populate('passengers.user', 'firstName lastName');
    
    res.json({
      success: true,
      message: 'Covoiturage mis à jour avec succès',
      data: updatedCarpool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un covoiturage
router.delete('/:id', async (req, res) => {
  try {
    const carpool = await Carpool.findByIdAndDelete(req.params.id);
    
    if (!carpool) {
      return res.status(404).json({
        success: false,
        error: 'Covoiturage non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Covoiturage supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Rejoindre un covoiturage
router.post('/:id/join', async (req, res) => {
  try {
    const { error, value } = passengerValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({
        success: false,
        error: 'Covoiturage non trouvé'
      });
    }
    
    if (!carpool.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Ce covoiturage n\'est plus actif'
      });
    }
    
    // Vérifier que l'utilisateur n'est pas le conducteur
    if (carpool.driver.toString() === value.userId) {
      return res.status(400).json({
        success: false,
        error: 'Le conducteur ne peut pas être passager'
      });
    }
    
    // Vérifier que l'utilisateur n'est pas déjà passager
    const isPassenger = carpool.passengers.some(
      p => p.user.toString() === value.userId
    );
    
    if (isPassenger) {
      return res.status(400).json({
        success: false,
        error: 'Vous êtes déjà inscrit à ce covoiturage'
      });
    }
    
    // Vérifier qu'il reste des places
    if (carpool.passengers.length >= carpool.availableSeats) {
      return res.status(400).json({
        success: false,
        error: 'Plus de places disponibles'
      });
    }
    
    carpool.passengers.push({
      user: value.userId,
      pickupPoint: value.pickupPoint || ''
    });
    
    await carpool.save();
    
    const updatedCarpool = await Carpool.findById(carpool._id)
      .populate('passengers.user', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Vous avez rejoint le covoiturage avec succès',
      data: updatedCarpool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Quitter un covoiturage
router.delete('/:id/leave/:userId', async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({
        success: false,
        error: 'Covoiturage non trouvé'
      });
    }
    
    const initialLength = carpool.passengers.length;
    carpool.passengers = carpool.passengers.filter(
      p => p.user.toString() !== req.params.userId
    );
    
    if (carpool.passengers.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Vous n\'êtes pas inscrit à ce covoiturage'
      });
    }
    
    await carpool.save();
    
    res.json({
      success: true,
      message: 'Vous avez quitté le covoiturage',
      data: carpool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
