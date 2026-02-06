/**
 * Routes pour les Sondages
 * Endpoints: /api/polls
 */

const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Joi = require('joi');

// Schéma de validation Joi
const pollValidationSchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().required()
    })
  ).min(2).required(),
  event: Joi.string().required(),
  allowMultipleChoices: Joi.boolean(),
  closeDate: Joi.date().allow(null),
  createdBy: Joi.string().required()
});

const voteValidationSchema = Joi.object({
  userId: Joi.string().required(),
  optionId: Joi.string().required()
});

// GET - Récupérer tous les sondages
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    
    const polls = await Poll.find(filter)
      .populate('event', 'name startDate')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('options.votes.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un sondage par ID
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('event', 'name description startDate')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('options.votes.user', 'firstName lastName profilePicture');
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }
    
    // Calculer les statistiques
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    const statistics = poll.options.map(opt => ({
      text: opt.text,
      votes: opt.votes.length,
      percentage: totalVotes > 0 ? ((opt.votes.length / totalVotes) * 100).toFixed(2) : 0
    }));
    
    res.json({
      success: true,
      data: {
        ...poll.toObject(),
        statistics,
        totalVotes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouveau sondage
router.post('/', async (req, res) => {
  try {
    const { error, value } = pollValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const poll = new Poll(value);
    await poll.save();
    
    const populatedPoll = await Poll.findById(poll._id)
      .populate('event', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Sondage créé avec succès',
      data: populatedPoll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un sondage
router.put('/:id', async (req, res) => {
  try {
    const { question, closeDate, isClosed } = req.body;
    
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { question, closeDate, isClosed, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('event', 'name')
    .populate('createdBy', 'firstName lastName');
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Sondage mis à jour avec succès',
      data: poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un sondage
router.delete('/:id', async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Sondage supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Voter dans un sondage
router.post('/:id/vote', async (req, res) => {
  try {
    const { error, value } = voteValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }
    
    // Vérifier si le sondage est fermé
    if (poll.isClosed || (poll.closeDate && new Date() > poll.closeDate)) {
      return res.status(400).json({
        success: false,
        error: 'Ce sondage est fermé'
      });
    }
    
    // Vérifier si l'utilisateur a déjà voté
    const hasVoted = poll.hasUserVoted(value.userId);
    if (hasVoted && !poll.allowMultipleChoices) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà voté dans ce sondage'
      });
    }
    
    // Trouver l'option
    const option = poll.options.id(value.optionId);
    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Option non trouvée'
      });
    }
    
    // Si choix unique, retirer les votes précédents
    if (!poll.allowMultipleChoices) {
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(v => v.user.toString() !== value.userId);
      });
    }
    
    // Ajouter le vote
    option.votes.push({ user: value.userId });
    await poll.save();
    
    const updatedPoll = await Poll.findById(poll._id)
      .populate('options.votes.user', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Vote enregistré avec succès',
      data: updatedPoll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Retirer son vote
router.delete('/:id/vote/:userId', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }
    
    // Retirer le vote de toutes les options
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(
        v => v.user.toString() !== req.params.userId
      );
    });
    
    await poll.save();
    
    res.json({
      success: true,
      message: 'Vote retiré avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
