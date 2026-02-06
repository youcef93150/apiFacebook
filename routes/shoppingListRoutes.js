/**
 * Routes pour les Listes de Courses (BONUS)
 * Endpoints: /api/shopping-lists
 */

const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');
const Joi = require('joi');

// Schéma de validation Joi
const shoppingListValidationSchema = Joi.object({
  name: Joi.string().allow(''),
  event: Joi.string().required(),
  createdBy: Joi.string().required()
});

const itemValidationSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  unit: Joi.string(),
  addedBy: Joi.string().required()
});

// GET - Récupérer toutes les listes de courses
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    
    const shoppingLists = await ShoppingList.find(filter)
      .populate('event', 'name startDate location')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('items.addedBy', 'firstName lastName profilePicture')
      .populate('items.bringBy.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: shoppingLists.length,
      data: shoppingLists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer une liste de courses par ID
router.get('/:id', async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id)
      .populate('event', 'name description startDate location')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('items.addedBy', 'firstName lastName profilePicture')
      .populate('items.bringBy.user', 'firstName lastName profilePicture');
    
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: shoppingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer la liste de courses par événement
router.get('/event/:eventId', async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findOne({ event: req.params.eventId })
      .populate('event', 'name description startDate location')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('items.addedBy', 'firstName lastName profilePicture')
      .populate('items.bringBy.user', 'firstName lastName profilePicture');
    
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée pour cet événement'
      });
    }
    
    res.json({
      success: true,
      data: shoppingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer une nouvelle liste de courses
router.post('/', async (req, res) => {
  try {
    const { error, value } = shoppingListValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // Vérifier qu'une liste n'existe pas déjà pour cet événement
    const existingList = await ShoppingList.findOne({ event: value.event });
    if (existingList) {
      return res.status(400).json({
        success: false,
        error: 'Une liste de courses existe déjà pour cet événement'
      });
    }
    
    const shoppingList = new ShoppingList(value);
    await shoppingList.save();
    
    const populatedList = await ShoppingList.findById(shoppingList._id)
      .populate('event', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Liste de courses créée avec succès',
      data: populatedList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour une liste de courses
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    const shoppingList = await ShoppingList.findByIdAndUpdate(
      req.params.id,
      { name, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('event', 'name')
    .populate('createdBy', 'firstName lastName');
    
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Liste de courses mise à jour avec succès',
      data: shoppingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer une liste de courses
router.delete('/:id', async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findByIdAndDelete(req.params.id);
    
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Liste de courses supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter un article à la liste
router.post('/:id/items', async (req, res) => {
  try {
    const { error, value } = itemValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const shoppingList = await ShoppingList.findById(req.params.id);
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    // Vérifier que l'article n'existe pas déjà
    const itemExists = shoppingList.items.some(item => 
      item.name.toLowerCase() === value.name.toLowerCase()
    );
    
    if (itemExists) {
      return res.status(400).json({
        success: false,
        error: 'Cet article existe déjà dans la liste'
      });
    }
    
    shoppingList.items.push(value);
    await shoppingList.save();
    
    const updatedList = await ShoppingList.findById(shoppingList._id)
      .populate('items.addedBy', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Article ajouté avec succès',
      data: updatedList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Assigner un article à quelqu'un
router.put('/:listId/items/:itemId/assign', async (req, res) => {
  try {
    const { userId, arrivalTime } = req.body;
    
    const shoppingList = await ShoppingList.findById(req.params.listId);
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    const item = shoppingList.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    item.bringBy = {
      user: userId,
      arrivalTime: arrivalTime || null
    };
    item.isProvided = false;
    
    await shoppingList.save();
    
    const updatedList = await ShoppingList.findById(shoppingList._id)
      .populate('items.bringBy.user', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Article assigné avec succès',
      data: updatedList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Marquer un article comme fourni
router.put('/:listId/items/:itemId/provided', async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.listId);
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    const item = shoppingList.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    item.isProvided = !item.isProvided;
    await shoppingList.save();
    
    res.json({
      success: true,
      message: `Article marqué comme ${item.isProvided ? 'fourni' : 'non fourni'}`,
      data: shoppingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un article de la liste
router.delete('/:listId/items/:itemId', async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.listId);
    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        error: 'Liste de courses non trouvée'
      });
    }
    
    shoppingList.items = shoppingList.items.filter(
      item => item._id.toString() !== req.params.itemId
    );
    
    await shoppingList.save();
    
    res.json({
      success: true,
      message: 'Article supprimé avec succès',
      data: shoppingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
