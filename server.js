/**
 * API REST - Réseau Social
 * Serveur principal Express.js
 * @author Backend Senior Developer
 * @date 2026
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const eventRoutes = require('./routes/eventRoutes');
const threadRoutes = require('./routes/threadRoutes');
const albumRoutes = require('./routes/albumRoutes');
const pollRoutes = require('./routes/pollRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const carpoolRoutes = require('./routes/carpoolRoutes');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion à MongoDB réussie');
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error.message);
  process.exit(1);
});

// Gestion des événements de connexion MongoDB
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connecté à la base de données');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose déconnecté');
});

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'API Réseau Social - Projet Facebook',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      groups: '/api/groups',
      events: '/api/events',
      threads: '/api/threads',
      albums: '/api/albums',
      polls: '/api/polls',
      tickets: '/api/tickets',
      shoppingLists: '/api/shopping-lists',
      carpools: '/api/carpools'
    }
  });
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/carpools', carpoolRoutes);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await mongoose.connection.close();
  process.exit(0);
});
