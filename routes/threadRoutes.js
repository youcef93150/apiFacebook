/**
 * Routes pour les Fils de Discussion
 * Endpoints: /api/threads
 */

const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Joi = require('joi');

// Schéma de validation Joi
const threadValidationSchema = Joi.object({
  title: Joi.string().min(3).required(),
  group: Joi.string().allow(null),
  event: Joi.string().allow(null),
  createdBy: Joi.string().required()
}).xor('group', 'event'); // Un seul doit être présent

const messageValidationSchema = Joi.object({
  author: Joi.string().required(),
  content: Joi.string().max(5000).required()
});

const replyValidationSchema = Joi.object({
  author: Joi.string().required(),
  content: Joi.string().max(2000).required()
});

// GET - Récupérer tous les fils de discussion
router.get('/', async (req, res) => {
  try {
    const { groupId, eventId } = req.query;
    let filter = {};
    
    if (groupId) filter.group = groupId;
    if (eventId) filter.event = eventId;
    
    const threads = await Thread.find(filter)
      .populate('group', 'name type')
      .populate('event', 'name startDate')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('messages.author', 'firstName lastName profilePicture')
      .populate('participants', 'firstName lastName profilePicture')
      .sort({ isPinned: -1, updatedAt: -1 });
    
    res.json({
      success: true,
      count: threads.length,
      data: threads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un fil par ID
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('group', 'name description type')
      .populate('event', 'name description startDate')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('messages.author', 'firstName lastName profilePicture')
      .populate('messages.replies.author', 'firstName lastName profilePicture')
      .populate('participants', 'firstName lastName profilePicture');
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Fil de discussion non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouveau fil de discussion
router.post('/', async (req, res) => {
  try {
    const { error, value } = threadValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const thread = new Thread(value);
    await thread.save();
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('group', 'name')
      .populate('event', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Fil de discussion créé avec succès',
      data: populatedThread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un fil de discussion
router.put('/:id', async (req, res) => {
  try {
    const { title, isPinned, isClosed } = req.body;
    
    const thread = await Thread.findByIdAndUpdate(
      req.params.id,
      { title, isPinned, isClosed, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('group', 'name')
    .populate('event', 'name')
    .populate('createdBy', 'firstName lastName');
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Fil de discussion non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Fil de discussion mis à jour avec succès',
      data: thread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un fil de discussion
router.delete('/:id', async (req, res) => {
  try {
    const thread = await Thread.findByIdAndDelete(req.params.id);
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Fil de discussion non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Fil de discussion supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter un message à un fil
router.post('/:id/messages', async (req, res) => {
  try {
    const { error, value } = messageValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Fil de discussion non trouvé'
      });
    }
    
    if (thread.isClosed) {
      return res.status(400).json({
        success: false,
        error: 'Ce fil de discussion est fermé'
      });
    }
    
    thread.messages.push(value);
    
    // Ajouter l'auteur aux participants s'il n'y est pas déjà
    if (!thread.participants.includes(value.author)) {
      thread.participants.push(value.author);
    }
    
    await thread.save();
    
    const updatedThread = await Thread.findById(thread._id)
      .populate('messages.author', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Message ajouté avec succès',
      data: updatedThread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter une réponse à un message
router.post('/:threadId/messages/:messageId/replies', async (req, res) => {
  try {
    const { error, value } = replyValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const thread = await Thread.findById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Fil de discussion non trouvé'
      });
    }
    
    if (thread.isClosed) {
      return res.status(400).json({
        success: false,
        error: 'Ce fil de discussion est fermé'
      });
    }
    
    const message = thread.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message non trouvé'
      });
    }
    
    message.replies.push(value);
    await thread.save();
    
    const updatedThread = await Thread.findById(thread._id)
      .populate('messages.author', 'firstName lastName profilePicture')
      .populate('messages.replies.author', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: updatedThread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
