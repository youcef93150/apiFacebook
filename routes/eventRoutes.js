/**
 * Routes pour les Événements
 * Endpoints: /api/events
 */

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Joi = require('joi');

// Schéma de validation Joi
const eventValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().max(2000).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  location: Joi.string().required(),
  coverPhoto: Joi.string().uri().allow(''),
  isPrivate: Joi.boolean().required(),
  group: Joi.string().allow(null),
  organizers: Joi.array().items(Joi.string()).min(1).required(),
  createdBy: Joi.string().required()
});

// GET - Récupérer tous les événements
router.get('/', async (req, res) => {
  try {
    const { isPrivate, upcoming } = req.query;
    let filter = {};
    
    if (isPrivate !== undefined) {
      filter.isPrivate = isPrivate === 'true';
    }
    
    if (upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(filter)
      .populate('organizers', 'firstName lastName profilePicture')
      .populate('participants.user', 'firstName lastName profilePicture')
      .populate('group', 'name type')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un événement par ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizers', 'firstName lastName email profilePicture')
      .populate('participants.user', 'firstName lastName profilePicture')
      .populate('group', 'name description type')
      .populate('createdBy', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouvel événement
router.post('/', async (req, res) => {
  try {
    const { error, value } = eventValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const event = new Event(value);
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizers', 'firstName lastName')
      .populate('group', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: populatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un événement
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('organizers', 'firstName lastName')
    .populate('participants.user', 'firstName lastName')
    .populate('group', 'name');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter un participant à un événement
router.post('/:id/participants', async (req, res) => {
  try {
    const { userId, status = 'intéressé' } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est déjà participant
    const isParticipant = event.participants.some(p => p.user.toString() === userId);
    if (isParticipant) {
      return res.status(400).json({
        success: false,
        error: 'Cet utilisateur participe déjà à l\'événement'
      });
    }
    
    event.participants.push({ user: userId, status });
    await event.save();
    
    const updatedEvent = await Event.findById(event._id)
      .populate('participants.user', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Participant ajouté avec succès',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour le statut d'un participant
router.put('/:id/participants/:userId', async (req, res) => {
  try {
    const { status } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    const participant = event.participants.find(
      p => p.user.toString() === req.params.userId
    );
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant non trouvé'
      });
    }
    
    participant.status = status;
    await event.save();
    
    res.json({
      success: true,
      message: 'Statut du participant mis à jour',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
