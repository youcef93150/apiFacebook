/**
 * Routes pour les Albums Photo
 * Endpoints: /api/albums
 */

const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Joi = require('joi');

// Schéma de validation Joi
const albumValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().max(500).allow(''),
  event: Joi.string().required(),
  createdBy: Joi.string().required()
});

const photoValidationSchema = Joi.object({
  url: Joi.string().uri().required(),
  caption: Joi.string().max(200).allow(''),
  uploadedBy: Joi.string().required()
});

const commentValidationSchema = Joi.object({
  author: Joi.string().required(),
  content: Joi.string().max(500).required()
});

// GET - Récupérer tous les albums
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    
    const albums = await Album.find(filter)
      .populate('event', 'name startDate location')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('photos.uploadedBy', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: albums.length,
      data: albums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Récupérer un album par ID
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('event', 'name description startDate location')
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('photos.uploadedBy', 'firstName lastName profilePicture')
      .populate('photos.comments.author', 'firstName lastName profilePicture')
      .populate('photos.likes', 'firstName lastName profilePicture');
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Créer un nouvel album
router.post('/', async (req, res) => {
  try {
    const { error, value } = albumValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const album = new Album(value);
    await album.save();
    
    const populatedAlbum = await Album.findById(album._id)
      .populate('event', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Album créé avec succès',
      data: populatedAlbum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Mettre à jour un album
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      { name, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('event', 'name')
    .populate('createdBy', 'firstName lastName');
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Album mis à jour avec succès',
      data: album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Supprimer un album
router.delete('/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Album supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter une photo à un album
router.post('/:id/photos', async (req, res) => {
  try {
    const { error, value } = photoValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    album.photos.push(value);
    await album.save();
    
    const updatedAlbum = await Album.findById(album._id)
      .populate('photos.uploadedBy', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Photo ajoutée avec succès',
      data: updatedAlbum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ajouter un commentaire à une photo
router.post('/:albumId/photos/:photoId/comments', async (req, res) => {
  try {
    const { error, value } = commentValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const album = await Album.findById(req.params.albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    const photo = album.photos.id(req.params.photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo non trouvée'
      });
    }
    
    photo.comments.push(value);
    await album.save();
    
    const updatedAlbum = await Album.findById(album._id)
      .populate('photos.comments.author', 'firstName lastName profilePicture');
    
    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: updatedAlbum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Liker une photo
router.post('/:albumId/photos/:photoId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const album = await Album.findById(req.params.albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }
    
    const photo = album.photos.id(req.params.photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur a déjà liké
    if (photo.likes.includes(userId)) {
      // Retirer le like
      photo.likes = photo.likes.filter(id => id.toString() !== userId);
    } else {
      // Ajouter le like
      photo.likes.push(userId);
    }
    
    await album.save();
    
    res.json({
      success: true,
      message: 'Like mis à jour',
      data: { likes: photo.likes.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
