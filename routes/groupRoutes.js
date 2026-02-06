/**
 * Routes pour les Groupes
 * Endpoints: /api/groups
 */

const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Joi = require('joi');

// Schéma de validation Joi
const groupValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().max(1000).required(),
  icon: Joi.string().uri().allow(''),
  coverPhoto: Joi.string().uri().allow(''),
  type: Joi.string().valid('public', 'privé', 'secret').required(),
  allowMembersToPost: Joi.boolean().required(),
  allowMembersToCreateEvents: Joi.boolean().required(),
  administrators: Joi.array().items(Joi.string()).min(1).required(),
  createdBy: Joi.string().required()
});

// GET - Récupérer tous les groupes
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    
    const groups = await Group.find(filter)
      .populate('administrators', 'firstName lastName email profilePicture')
      .populate('members.user', 'firstName lastName profilePicture')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un groupe par ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('administrators', 'firstName lastName email profilePicture')
      .populate('members.user', 'firstName lastName profilePicture')
      .populate('createdBy', 'firstName lastName');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Groupe non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouveau groupe
router.post('/', async (req, res) => {
  try {
    const { error, value } = groupValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const group = new Group(value);
    await group.save();
    
    const populatedGroup = await Group.findById(group._id)
      .populate('administrators', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Groupe créé avec succès',
      data: populatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un groupe
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('administrators', 'firstName lastName')
    .populate('members.user', 'firstName lastName');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Groupe non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Groupe mis à jour avec succès',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un groupe
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Groupe non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter un membre à un groupe
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, role = 'membre' } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Groupe non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est déjà membre
    const isMember = group.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'Cet utilisateur est déjà membre du groupe'
      });
    }
    
    group.members.push({ user: userId, role });
    await group.save();
    
    const updatedGroup = await Group.findById(group._id)
      .populate('members.user', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Membre ajouté avec succès',
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Retirer un membre d'un groupe
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Groupe non trouvé'
      });
    }
    
    group.members = group.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await group.save();
    
    res.json({
      success: true,
      message: 'Membre retiré avec succès',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
