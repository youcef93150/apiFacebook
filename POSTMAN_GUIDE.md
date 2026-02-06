# 🚀 Guide de Test Postman - API Réseau Social

## ⚠️ IMPORTANT : Ordre des tests

Suivez cet ordre pour avoir des données cohérentes :
1. Créer des utilisateurs
2. Créer des groupes
3. Créer des événements
4. Puis tester les autres fonctionnalités

---

## 📝 ÉTAPE 1 : Vérifier que l'API fonctionne

### GET - Page d'accueil
```
GET http://localhost:3000/
```
**Réponse attendue** : Liste des endpoints disponibles

---

## 👤 ÉTAPE 2 : Créer des utilisateurs

### POST - Créer l'utilisateur 1 (Jean)
```
POST http://localhost:3000/api/users
Content-Type: application/json
```

**Body :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "password123",
  "dateOfBirth": "1990-05-15",
  "gender": "homme",
  "bio": "Développeur Full Stack",
  "location": "Paris, France"
}
```

**✅ Après cette requête :** Copiez le `_id` dans la réponse (ex: `65c1234567890abcdef12345`)

---

### POST - Créer l'utilisateur 2 (Marie)
```
POST http://localhost:3000/api/users
Content-Type: application/json
```

**Body :**
```json
{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie.martin@example.com",
  "password": "password456",
  "dateOfBirth": "1992-08-20",
  "gender": "femme",
  "bio": "Designer UI/UX",
  "location": "Lyon, France"
}
```

---

### POST - Créer l'utilisateur 3 (Thomas)
```
POST http://localhost:3000/api/users
Content-Type: application/json
```

**Body :**
```json
{
  "firstName": "Thomas",
  "lastName": "Petit",
  "email": "thomas.petit@example.com",
  "password": "password789",
  "dateOfBirth": "1988-12-10",
  "gender": "homme",
  "bio": "Chef de projet",
  "location": "Marseille, France"
}
```

---

### GET - Récupérer tous les utilisateurs
```
GET http://localhost:3000/api/users
```

**Note :** Dans la réponse, vous verrez tous les utilisateurs créés avec leurs `_id`. Gardez-les à portée de main !

---

## 👥 ÉTAPE 3 : Créer un groupe

### POST - Créer un groupe
```
POST http://localhost:3000/api/groups
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Développeurs JavaScript Paris",
  "description": "Communauté des développeurs JavaScript passionnés basés à Paris",
  "type": "public",
  "allowMembersToPost": true,
  "allowMembersToCreateEvents": true,
  "administrators": ["REMPLACER_PAR_ID_JEAN"],
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

**📝 Instructions :**
1. Remplacez `REMPLACER_PAR_ID_JEAN` par le vrai `_id` de Jean (obtenu à l'étape précédente)
2. Exemple : `"administrators": ["65c1234567890abcdef12345"]`
3. Sauvegardez l'`_id` du groupe créé

---

### POST - Ajouter Marie au groupe
```
POST http://localhost:3000/api/groups/REMPLACER_PAR_ID_GROUPE/members
Content-Type: application/json
```

**Body :**
```json
{
  "userId": "REMPLACER_PAR_ID_MARIE",
  "role": "membre"
}
```

---

## 🎉 ÉTAPE 4 : Créer un événement

### POST - Créer un événement
```
POST http://localhost:3000/api/events
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Meetup JavaScript - Mars 2026",
  "description": "Rencontre mensuelle des développeurs JavaScript. Au programme : présentations, networking et pizza !",
  "startDate": "2026-03-15T18:00:00.000Z",
  "endDate": "2026-03-15T22:00:00.000Z",
  "location": "WeWork Paris La Défense, 92800 Puteaux",
  "isPrivate": false,
  "group": "REMPLACER_PAR_ID_GROUPE",
  "organizers": ["REMPLACER_PAR_ID_JEAN"],
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

**📝 Instructions :**
- Remplacez `REMPLACER_PAR_ID_GROUPE` par l'ID du groupe
- Remplacez `REMPLACER_PAR_ID_JEAN` par l'ID de Jean
- Sauvegardez l'`_id` de l'événement

---

### POST - Marie rejoint l'événement
```
POST http://localhost:3000/api/events/REMPLACER_PAR_ID_EVENEMENT/participants
Content-Type: application/json
```

**Body :**
```json
{
  "userId": "REMPLACER_PAR_ID_MARIE",
  "status": "participant"
}
```

---

## 💬 ÉTAPE 5 : Créer un fil de discussion

### POST - Fil de discussion pour l'événement
```
POST http://localhost:3000/api/threads
Content-Type: application/json
```

**Body :**
```json
{
  "title": "Questions et discussions sur le Meetup",
  "group": null,
  "event": "REMPLACER_PAR_ID_EVENEMENT",
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

### POST - Ajouter un message au fil
```
POST http://localhost:3000/api/threads/REMPLACER_PAR_ID_THREAD/messages
Content-Type: application/json
```

**Body :**
```json
{
  "author": "REMPLACER_PAR_ID_MARIE",
  "content": "Bonjour à tous ! J'ai hâte de participer à ce meetup. Y aura-t-il un live coding ?"
}
```

---

## 📸 ÉTAPE 6 : Créer un album photo

### POST - Créer un album
```
POST http://localhost:3000/api/albums
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Photos du Meetup Mars 2026",
  "description": "Souvenirs de notre rencontre",
  "event": "REMPLACER_PAR_ID_EVENEMENT",
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

### POST - Ajouter une photo
```
POST http://localhost:3000/api/albums/REMPLACER_PAR_ID_ALBUM/photos
Content-Type: application/json
```

**Body :**
```json
{
  "url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "caption": "Session de coding en équipe",
  "uploadedBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

## 📊 ÉTAPE 7 : Créer un sondage

### POST - Créer un sondage
```
POST http://localhost:3000/api/polls
Content-Type: application/json
```

**Body :**
```json
{
  "question": "Quel sujet souhaitez-vous aborder au prochain meetup ?",
  "options": [
    { "text": "Node.js et microservices" },
    { "text": "React et Next.js" },
    { "text": "TypeScript avancé" },
    { "text": "Architecture logicielle" }
  ],
  "event": "REMPLACER_PAR_ID_EVENEMENT",
  "allowMultipleChoices": false,
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

### POST - Marie vote dans le sondage
```
POST http://localhost:3000/api/polls/REMPLACER_PAR_ID_POLL/vote
Content-Type: application/json
```

**Body :**
```json
{
  "userId": "REMPLACER_PAR_ID_MARIE",
  "optionId": "REMPLACER_PAR_ID_OPTION"
}
```

**Note :** L'`optionId` se trouve dans la réponse du GET du sondage

---

## 🎫 ÉTAPE 8 : Billetterie

### POST - Créer un type de billet
```
POST http://localhost:3000/api/tickets/types
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Entrée Standard",
  "price": 15,
  "quantity": 50,
  "description": "Accès complet au meetup, pizza et boissons incluses",
  "event": "REMPLACER_PAR_ID_EVENEMENT"
}
```

---

### POST - Acheter un billet
```
POST http://localhost:3000/api/tickets/purchases
Content-Type: application/json
```

**Body :**
```json
{
  "ticketType": "REMPLACER_PAR_ID_TYPE_BILLET",
  "firstName": "Sophie",
  "lastName": "Bernard",
  "email": "sophie.bernard@example.com",
  "address": {
    "street": "45 Avenue des Champs-Élysées",
    "city": "Paris",
    "postalCode": "75008",
    "country": "France"
  }
}
```

---

## 🛒 ÉTAPE 9 : Liste de courses (BONUS)

### POST - Créer une liste
```
POST http://localhost:3000/api/shopping-lists
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Liste pour le Meetup",
  "event": "REMPLACER_PAR_ID_EVENEMENT",
  "createdBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

### POST - Ajouter des articles
```
POST http://localhost:3000/api/shopping-lists/REMPLACER_PAR_ID_LISTE/items
Content-Type: application/json
```

**Body :**
```json
{
  "name": "Pizza Margherita",
  "quantity": 10,
  "unit": "unités",
  "addedBy": "REMPLACER_PAR_ID_JEAN"
}
```

---

### PUT - Assigner un article à Marie
```
PUT http://localhost:3000/api/shopping-lists/REMPLACER_PAR_ID_LISTE/items/REMPLACER_PAR_ID_ITEM/assign
Content-Type: application/json
```

**Body :**
```json
{
  "userId": "REMPLACER_PAR_ID_MARIE",
  "arrivalTime": "2026-03-15T17:30:00.000Z"
}
```

---

## 🚗 ÉTAPE 10 : Covoiturage (BONUS)

### POST - Créer un covoiturage
```
POST http://localhost:3000/api/carpools
Content-Type: application/json
```

**Body :**
```json
{
  "event": "REMPLACER_PAR_ID_EVENEMENT",
  "driver": "REMPLACER_PAR_ID_JEAN",
  "departureLocation": "Gare de Lyon, Paris",
  "departureTime": "2026-03-15T17:00:00.000Z",
  "availableSeats": 3,
  "pricePerPerson": 8,
  "maxDetour": 5,
  "notes": "Départ à 17h pile, soyez ponctuels !",
  "vehicleInfo": {
    "model": "Peugeot 308",
    "color": "Noir",
    "licensePlate": "AB-123-CD"
  }
}
```

---

### POST - Marie rejoint le covoiturage
```
POST http://localhost:3000/api/carpools/REMPLACER_PAR_ID_COVOITURAGE/join
Content-Type: application/json
```

**Body :**
```json
{
  "userId": "REMPLACER_PAR_ID_MARIE",
  "pickupPoint": "Gare de Lyon, sortie Hall 1"
}
```

---

## 📌 ASTUCES POSTMAN

### 1. Créer des variables d'environnement

Dans Postman, créez un environnement avec ces variables :
- `base_url` = `http://localhost:3000`
- `user_jean_id` = (à remplir après création)
- `user_marie_id` = (à remplir après création)
- `group_id` = (à remplir après création)
- `event_id` = (à remplir après création)

Puis utilisez : `{{base_url}}/api/users/{{user_jean_id}}`

### 2. Script pour sauvegarder automatiquement les IDs

Dans l'onglet "Tests" d'une requête POST, ajoutez :
```javascript
var jsonData = pm.response.json();
if (jsonData.data && jsonData.data._id) {
    pm.environment.set("last_created_id", jsonData.data._id);
}
```

### 3. Collection organisée

Créez une collection "API Réseau Social" avec des dossiers :
- 📁 Users
- 📁 Groups
- 📁 Events
- 📁 Threads
- 📁 Albums
- 📁 Polls
- 📁 Tickets
- 📁 Shopping Lists
- 📁 Carpools

---

## ✅ Checklist de test

- [ ] Créer 3 utilisateurs
- [ ] Récupérer la liste des utilisateurs
- [ ] Créer un groupe
- [ ] Ajouter des membres au groupe
- [ ] Créer un événement
- [ ] Ajouter des participants à l'événement
- [ ] Créer un fil de discussion
- [ ] Poster des messages
- [ ] Créer un album et ajouter des photos
- [ ] Créer un sondage et voter
- [ ] Créer des types de billets et acheter
- [ ] Créer une liste de courses
- [ ] Créer un covoiturage

Bon test ! 🚀
