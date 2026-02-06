/**
 * Routes pour la Billetterie
 * Endpoints: /api/tickets
 */

const express = require('express');
const router = express.Router();
const { TicketType, TicketPurchase } = require('../models/Ticket');
const Joi = require('joi');

// Schéma de validation pour les types de billets
const ticketTypeValidationSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(1).required(),
  description: Joi.string().max(500).allow(''),
  event: Joi.string().required()
});

// Schéma de validation pour les achats de billets
const ticketPurchaseValidationSchema = Joi.object({
  ticketType: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  user: Joi.string().allow(null)
});

// ===== TYPES DE BILLETS =====

// GET - Récupérer tous les types de billets
router.get('/types', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId, isActive: true } : { isActive: true };
    
    const ticketTypes = await TicketType.find(filter)
      .populate('event', 'name startDate location')
      .sort({ price: 1 });
    
    res.json({
      success: true,
      count: ticketTypes.length,
      data: ticketTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un type de billet par ID
router.get('/types/:id', async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id)
      .populate('event', 'name description startDate endDate location');
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        error: 'Type de billet non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: ticketType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouveau type de billet
router.post('/types', async (req, res) => {
  try {
    const { error, value } = ticketTypeValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const ticketType = new TicketType(value);
    await ticketType.save();
    
    const populatedTicketType = await TicketType.findById(ticketType._id)
      .populate('event', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Type de billet créé avec succès',
      data: populatedTicketType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un type de billet
router.put('/types/:id', async (req, res) => {
  try {
    const { name, price, description, isActive } = req.body;
    
    const ticketType = await TicketType.findByIdAndUpdate(
      req.params.id,
      { name, price, description, isActive },
      { new: true, runValidators: true }
    ).populate('event', 'name');
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        error: 'Type de billet non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Type de billet mis à jour avec succès',
      data: ticketType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un type de billet (soft delete)
router.delete('/types/:id', async (req, res) => {
  try {
    const ticketType = await TicketType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        error: 'Type de billet non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Type de billet désactivé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== ACHATS DE BILLETS =====

// GET - Récupérer tous les achats de billets
router.get('/purchases', async (req, res) => {
  try {
    const { email, ticketTypeId } = req.query;
    let filter = {};
    
    if (email) filter.email = email;
    if (ticketTypeId) filter.ticketType = ticketTypeId;
    
    const purchases = await TicketPurchase.find(filter)
      .populate('ticketType', 'name price event')
      .populate('user', 'firstName lastName email')
      .sort({ purchaseDate: -1 });
    
    res.json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un achat de billet par ID
router.get('/purchases/:id', async (req, res) => {
  try {
    const purchase = await TicketPurchase.findById(req.params.id)
      .populate({
        path: 'ticketType',
        populate: { path: 'event', select: 'name startDate endDate location' }
      })
      .populate('user', 'firstName lastName email');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Achat non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Acheter un billet
router.post('/purchases', async (req, res) => {
  try {
    const { error, value } = ticketPurchaseValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // Vérifier le type de billet
    const ticketType = await TicketType.findById(value.ticketType);
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        error: 'Type de billet non trouvé'
      });
    }
    
    if (!ticketType.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Ce type de billet n\'est plus disponible'
      });
    }
    
    if (ticketType.quantityAvailable <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Plus de billets disponibles'
      });
    }
    
    // Vérifier limite de 1 billet par email
    const existingPurchase = await TicketPurchase.findOne({
      email: value.email,
      ticketType: value.ticketType
    });
    
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà acheté un billet de ce type'
      });
    }
    
    // Créer l'achat
    const purchase = new TicketPurchase(value);
    await purchase.save();
    
    // Décrémenter la quantité disponible
    ticketType.quantityAvailable -= 1;
    await ticketType.save();
    
    const populatedPurchase = await TicketPurchase.findById(purchase._id)
      .populate({
        path: 'ticketType',
        populate: { path: 'event', select: 'name startDate location' }
      });
    
    res.status(201).json({
      success: true,
      message: 'Billet acheté avec succès',
      data: populatedPurchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Annuler un achat de billet
router.put('/purchases/:id/cancel', async (req, res) => {
  try {
    const purchase = await TicketPurchase.findById(req.params.id)
      .populate('ticketType');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Achat non trouvé'
      });
    }
    
    if (purchase.status === 'annulé') {
      return res.status(400).json({
        success: false,
        error: 'Ce billet est déjà annulé'
      });
    }
    
    // Annuler l'achat
    purchase.status = 'annulé';
    await purchase.save();
    
    // Remettre le billet en stock
    const ticketType = await TicketType.findById(purchase.ticketType._id);
    ticketType.quantityAvailable += 1;
    await ticketType.save();
    
    res.json({
      success: true,
      message: 'Achat annulé avec succès',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
