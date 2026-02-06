# API REST - Réseau Social (Projet Facebook)

## Description
API REST complète pour un réseau social développée en Node.js avec Express et MongoDB.

## Technologies
- **Backend**: Node.js, Express.js
- **Base de données**: MongoDB avec Mongoose
- **Validation**: Joi
- **Autres**: CORS, dotenv, body-parser

## Installation

### 1. Cloner le projet
```bash
cd apiFB
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
Le fichier `.env` est déjà configuré avec la connexion MongoDB.

### 4. Démarrer le serveur

**Mode développement** (avec rechargement automatique):
```bash
npm run dev
```

**Mode production**:
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Structure du Projet

```
apiFB/
├── models/              # Modèles Mongoose
│   ├── User.js          # Utilisateurs
│   ├── Group.js         # Groupes
│   ├── Event.js         # Événements
│   ├── Thread.js        # Fils de discussion
│   ├── Album.js         # Albums photo
│   ├── Poll.js          # Sondages
│   ├── Ticket.js        # Billetterie
│   ├── ShoppingList.js  # Listes de courses (BONUS)
│   └── Carpool.js       # Covoiturage (BONUS)
├── routes/              # Routes API
│   ├── userRoutes.js
│   ├── groupRoutes.js
│   ├── eventRoutes.js
│   ├── threadRoutes.js
│   ├── albumRoutes.js
│   ├── pollRoutes.js
│   ├── ticketRoutes.js
│   ├── shoppingListRoutes.js
│   └── carpoolRoutes.js
├── server.js            # Point d'entrée
├── package.json
└── .env                 # Variables d'environnement
```

## Endpoints API

### 🏠 Base
- `GET /` - Informations de l'API

### 👤 Utilisateurs (`/api/users`)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Désactiver un utilisateur
- `GET /api/users/search/:query` - Rechercher des utilisateurs

### 👥 Groupes (`/api/groups`)
- `GET /api/groups` - Liste des groupes
- `GET /api/groups/:id` - Détails d'un groupe
- `POST /api/groups` - Créer un groupe
- `PUT /api/groups/:id` - Modifier un groupe
- `DELETE /api/groups/:id` - Supprimer un groupe
- `POST /api/groups/:id/members` - Ajouter un membre
- `DELETE /api/groups/:id/members/:userId` - Retirer un membre

### 🎉 Événements (`/api/events`)
- `GET /api/events` - Liste des événements
- `GET /api/events/:id` - Détails d'un événement
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `POST /api/events/:id/participants` - Ajouter un participant
- `PUT /api/events/:id/participants/:userId` - Mettre à jour le statut

### 💬 Fils de Discussion (`/api/threads`)
- `GET /api/threads` - Liste des fils
- `GET /api/threads/:id` - Détails d'un fil
- `POST /api/threads` - Créer un fil
- `PUT /api/threads/:id` - Modifier un fil
- `DELETE /api/threads/:id` - Supprimer un fil
- `POST /api/threads/:id/messages` - Ajouter un message
- `POST /api/threads/:threadId/messages/:messageId/replies` - Ajouter une réponse

### 📸 Albums Photo (`/api/albums`)
- `GET /api/albums` - Liste des albums
- `GET /api/albums/:id` - Détails d'un album
- `POST /api/albums` - Créer un album
- `PUT /api/albums/:id` - Modifier un album
- `DELETE /api/albums/:id` - Supprimer un album
- `POST /api/albums/:id/photos` - Ajouter une photo
- `POST /api/albums/:albumId/photos/:photoId/comments` - Commenter une photo
- `POST /api/albums/:albumId/photos/:photoId/like` - Liker une photo

### 📊 Sondages (`/api/polls`)
- `GET /api/polls` - Liste des sondages
- `GET /api/polls/:id` - Détails d'un sondage
- `POST /api/polls` - Créer un sondage
- `PUT /api/polls/:id` - Modifier un sondage
- `DELETE /api/polls/:id` - Supprimer un sondage
- `POST /api/polls/:id/vote` - Voter
- `DELETE /api/polls/:id/vote/:userId` - Retirer son vote

### 🎫 Billetterie (`/api/tickets`)
- `GET /api/tickets/types` - Liste des types de billets
- `GET /api/tickets/types/:id` - Détails d'un type de billet
- `POST /api/tickets/types` - Créer un type de billet
- `PUT /api/tickets/types/:id` - Modifier un type de billet
- `DELETE /api/tickets/types/:id` - Désactiver un type de billet
- `GET /api/tickets/purchases` - Liste des achats
- `GET /api/tickets/purchases/:id` - Détails d'un achat
- `POST /api/tickets/purchases` - Acheter un billet
- `PUT /api/tickets/purchases/:id/cancel` - Annuler un achat

### 🛒 Listes de Courses (`/api/shopping-lists`) - BONUS
- `GET /api/shopping-lists` - Liste des listes
- `GET /api/shopping-lists/:id` - Détails d'une liste
- `GET /api/shopping-lists/event/:eventId` - Liste par événement
- `POST /api/shopping-lists` - Créer une liste
- `PUT /api/shopping-lists/:id` - Modifier une liste
- `DELETE /api/shopping-lists/:id` - Supprimer une liste
- `POST /api/shopping-lists/:id/items` - Ajouter un article
- `PUT /api/shopping-lists/:listId/items/:itemId/assign` - Assigner un article
- `PUT /api/shopping-lists/:listId/items/:itemId/provided` - Marquer comme fourni
- `DELETE /api/shopping-lists/:listId/items/:itemId` - Supprimer un article

### 🚗 Covoiturage (`/api/carpools`) - BONUS
- `GET /api/carpools` - Liste des covoiturages
- `GET /api/carpools/:id` - Détails d'un covoiturage
- `POST /api/carpools` - Créer un covoiturage
- `PUT /api/carpools/:id` - Modifier un covoiturage
- `DELETE /api/carpools/:id` - Supprimer un covoiturage
- `POST /api/carpools/:id/join` - Rejoindre un covoiturage
- `DELETE /api/carpools/:id/leave/:userId` - Quitter un covoiturage

## Modèles de Données

### User (Utilisateur)
- Email unique (obligatoire)
- Informations personnelles complètes
- Photo de profil et couverture

### Group (Groupe)
- Types: public, privé, secret
- Permissions configurables (posts, événements)
- Administrateurs et membres

### Event (Événement)
- Dates, lieu, description
- Public ou privé
- Organisateurs et participants
- Peut être lié à un groupe

### Thread (Fil de Discussion)
- Lié SOIT à un groupe SOIT à un événement (exclusif)
- Messages avec réponses
- Épinglage et fermeture

### Album (Album Photo)
- Associé à un événement
- Photos avec commentaires et likes

### Poll (Sondage)
- Lié à un événement
- Choix unique par défaut
- Statistiques en temps réel

### Ticket (Billetterie)
- Types de billets avec quantités limitées
- 1 billet maximum par personne/email
- Gestion des stocks automatique

### ShoppingList (Liste de Courses) - BONUS
- 1 liste unique par événement
- Articles assignables avec heure d'arrivée
- Suivi des articles fournis

### Carpool (Covoiturage) - BONUS
- Détails du trajet et véhicule
- Gestion des passagers et places
- Prix et détour maximum

## Validation

Toutes les routes utilisent **Joi** pour la validation des données entrantes, garantissant:
- Types de données corrects
- Contraintes respectées
- Messages d'erreur clairs

## Contraintes Importantes

1. **Email unique** pour les utilisateurs
2. **Fil de discussion** : lié SOIT à un groupe SOIT à un événement (mutuellement exclusif)
3. **Album photo** : obligatoirement associé à un événement
4. **Sondage** : lié à un événement avec minimum 2 options
5. **Billetterie** : 1 billet maximum par email/type
6. **Liste de courses** : 1 seule liste par événement
7. **Groupes** : Au moins 1 administrateur requis
8. **Événements** : Au moins 1 organisateur requis

## Auteur
Développeur Senior Backend - Spécialiste JavaScript/Node.js

## Date
Février 2026
