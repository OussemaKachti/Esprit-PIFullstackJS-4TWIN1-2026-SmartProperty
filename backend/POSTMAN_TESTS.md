# 📬 Documentation Postman - Tests API SmartProperty

## 🔧 Configuration MongoDB Atlas

### Étape 1 : Créer un cluster MongoDB Atlas

1. Allez sur [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit ou connectez-vous
3. Créez un nouveau cluster (M0 Sandbox - Gratuit)
4. Attendez que le cluster soit créé (5-10 minutes)

### Étape 2 : Configurer l'accès

1. **Network Access** : 
   - Cliquez sur "Network Access" dans le menu
   - Cliquez sur "Add IP Address"
   - Sélectionnez "Allow Access from Anywhere" (0.0.0.0/0)
   - Cliquez sur "Confirm"

2. **Database Access** :
   - Cliquez sur "Database Access"
   - Cliquez sur "Add New Database User"
   - Choisissez un username et password (ex: `smartproperty` / `SmartProp2026!`)
   - Donnez les droits "Read and write to any database"
   - Cliquez sur "Add User"

### Étape 3 : Obtenir la chaîne de connexion

1. Retournez sur "Database" (menu principal)
2. Cliquez sur "Connect" sur votre cluster
3. Choisissez "Connect your application"
4. Copiez la chaîne de connexion (format : `mongodb+srv://...`)

Exemple :
```
mongodb+srv://smartproperty:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

### Étape 4 : Configurer le fichier .env

Modifiez votre fichier `.env` dans le backend :

```env
MONGODB_URI=mongodb+srv://smartproperty:SmartProp2026!@cluster0.abcde.mongodb.net/smartproperty?retryWrites=true&w=majority
```

⚠️ **Important** : 
- Remplacez `<password>` par votre mot de passe
- Ajoutez `/smartproperty` après `.net` pour spécifier le nom de la base de données
- Si votre mot de passe contient des caractères spéciaux (@, #, etc.), encodez-les en URL

## 🚀 Démarrer le serveur

```bash
cd backend

# IMPORTANT : Initialiser l'utilisateur statique (une seule fois)
npm run init-user

# Puis démarrer le serveur
npm run dev
```

Vous devriez voir :
```
✅ MongoDB Connected: cluster0-shard-00-00.abcde.mongodb.net
🚀 Server running on port 5000 in development mode
📍 API: http://localhost:5000/api
```

---

## 📋 Tests Postman - CRUD Properties

### Base URL
```
http://localhost:5000/api
```

---

## ✅ Test 1 : Health Check

**Méthode** : `GET`  
**URL** : `http://localhost:5000/api/health`  

**Résultat attendu** :
```json
{
  "success": true,
  "message": "SmartProperty API is running",
  "timestamp": "2026-02-07T00:00:00.000Z"
}
```

---

## 📝 Test 2 : Créer une propriété (CREATE)

**Méthode** : `POST`  
**URL** : `http://localhost:5000/api/properties`  
**Headers** :
```
Content-Type: application/json
```

**Body (JSON)** :
```json
{
  "title": "Magnifique appartement 3 pièces - Centre ville",
  "type": "APARTMENT",
  "price": 250000,
  "surface": 75,
  "rooms": 3,
  "address": "15 Rue de la République",
  "city": "Paris",
  "country": "France",
  "description": "Superbe appartement rénové au cœur de Paris"
}
```

**Types valides** : `APARTMENT`, `HOUSE`, `VILLA`, `STUDIO`

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Property created successfully",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "reference": "PROP-2026-00001",
    "title": "Magnifique appartement 3 pièces - Centre ville",
    "type": "APARTMENT",
    "status": "AVAILABLE",
    "price": 250000,
    "surface": 75,
    "rooms": 3,
    "address": "15 Rue de la République",
    "city": "Paris",
    "country": "France",
    "description": "Superbe appartement rénové au cœur de Paris",
    "images": [],
    "location": {
      "type": "Point",
      "coordinates": [0, 0]
    },
    "aiGeneratedDescription": false,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "login": "testuser",
      "email": "test@example.com",
      "role": "ADMIN"
    },
    "createdAt": "2026-02-07T00:00:00.000Z",
    "updatedAt": "2026-02-07T00:00:00.000Z"
  }
}
```

---

## 📋 Test 3 : Lister toutes les propriétés (READ ALL)

**Méthode** : `GET`  
**URL** : `http://localhost:5000/api/properties`  

**Paramètres optionnels (Query)** :
- `page=1` - Numéro de page
- `limit=10` - Nombre de résultats par page
- `type=APARTMENT` - Filtrer par type
- `status=AVAILABLE` - Filtrer par statut
- `city=Paris` - Filtrer par ville
- `minPrice=100000` - Prix minimum
- `maxPrice=500000` - Prix maximum
- `search=centre ville` - Recherche textuelle

**Exemples d'URLs** :
```
# Tous les appartements
http://localhost:5000/api/properties?type=APARTMENT

# Propriétés à Paris entre 200k et 400k €
http://localhost:5000/api/properties?city=Paris&minPrice=200000&maxPrice=400000

# Page 2 avec 20 résultats
http://localhost:5000/api/properties?page=2&limit=20

# Recherche textuelle
http://localhost:5000/api/properties?search=centre ville
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "data": {
    "properties": [
      {
        "_id": "65c1234567890abcdef12345",
        "reference": "PROP-2026-00001",
        "title": "Magnifique appartement 3 pièces",
        "type": "APARTMENT",
        "status": "AVAILABLE",
        "price": 250000,
        "surface": 75,
        "rooms": 3,
        "city": "Paris",
        "images": [],
        "createdBy": {
          "_id": "507f1f77bcf86cd799439011",
          "login": "testuser",
          "email": "test@example.com",
          "role": "ADMIN"
        }
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "total": 1
  }
}
```

---

## 🔍 Test 4 : Récupérer une propriété par ID (READ ONE)

**Méthode** : `GET`  
**URL** : `http://localhost:5000/api/properties/:id`  

**Exemple** :
```
http://localhost:5000/api/properties/65c1234567890abcdef12345
```

⚠️ Remplacez `:id` par un vrai ID de votre base de données (récupéré lors du Test 2 ou 3)

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Property retrieved successfully",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "reference": "PROP-2026-00001",
    "title": "Magnifique appartement 3 pièces - Centre ville",
    "type": "APARTMENT",
    "status": "AVAILABLE",
    "price": 250000,
    "surface": 75,
    "rooms": 3,
    "address": "15 Rue de la République",
    "city": "Paris",
    "country": "France",
    "description": "Superbe appartement rénové au cœur de Paris",
    "images": [],
    "location": {
      "type": "Point",
      "coordinates": [0, 0]
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "login": "testuser",
      "email": "test@example.com",
      "role": "ADMIN"
    },
    "createdAt": "2026-02-07T00:00:00.000Z",
    "updatedAt": "2026-02-07T00:00:00.000Z"
  }
}
```

---

## ✏️ Test 5 : Modifier une propriété (UPDATE)

**Méthode** : `PUT`  
**URL** : `http://localhost:5000/api/properties/:id`  
**Headers** :
```
Content-Type: application/json
```

**Body (JSON)** - Tous les champs sont optionnels :
```json
{
  "price": 275000,
  "description": "Magnifique appartement entièrement rénové avec vue dégagée",
  "status": "RENTED"
}
```

**Status valides** : `AVAILABLE`, `RENTED`, `ARCHIVED`

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Property updated successfully",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "data": {
    "_id": "65c1234567890abcdef12345",
    "reference": "PROP-2026-00001",
    "title": "Magnifique appartement 3 pièces - Centre ville",
    "price": 275000,
    "status": "RENTED",
    "description": "Magnifique appartement entièrement rénové avec vue dégagée",
    "updatedAt": "2026-02-07T01:00:00.000Z"
  }
}
```

---

## ❌ Test 6 : Supprimer une propriété (DELETE)

**Méthode** : `DELETE`  
**URL** : `http://localhost:5000/api/properties/:id`  

**Exemple** :
```
http://localhost:5000/api/properties/65c1234567890abcdef12345
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Property deleted successfully",
  "timestamp": "2026-02-07T00:00:00.000Z"
}
```

---

## 📸 Test 7 : Créer une propriété avec images (CREATE WITH UPLOAD)

**Méthode** : `POST`  
**URL** : `http://localhost:5000/api/properties`  
**Headers** :
```
Content-Type: multipart/form-data
```

**Body (form-data)** :
```
title: Villa de luxe avec piscine
type: VILLA
price: 850000
surface: 250
rooms: 6
address: 25 Avenue des Palmiers
city: Nice
country: France
description: Magnifique villa avec piscine et vue mer
images: [Sélectionner plusieurs fichiers images]
```

⚠️ **Dans Postman** :
1. Sélectionnez `Body` → `form-data`
2. Pour chaque champ, ajoutez une key/value
3. Pour `images`, sélectionnez `File` dans le dropdown et choisissez plusieurs images

**Formats acceptés** : jpg, jpeg, png, webp, heic  
**Taille max** : 10 MB par image  
**Max images** : 20 images par propriété

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "_id": "65c1234567890abcdef12346",
    "reference": "PROP-2026-00002",
    "title": "Villa de luxe avec piscine",
    "images": [
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/smartproperty/properties/abc123.jpg",
        "publicId": "smartproperty/properties/abc123",
        "uploadedAt": "2026-02-07T00:00:00.000Z",
        "_id": "65c1234567890abcdef12347"
      },
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/smartproperty/properties/def456.jpg",
        "publicId": "smartproperty/properties/def456",
        "uploadedAt": "2026-02-07T00:00:00.000Z",
        "_id": "65c1234567890abcdef12348"
      }
    ]
  }
}
```

---

## 🗑️ Test 8 : Supprimer une image spécifique

**Méthode** : `DELETE`  
**URL** : `http://localhost:5000/api/properties/:propertyId/images/:imageId`  

**Exemple** :
```
http://localhost:5000/api/properties/65c1234567890abcdef12346/images/65c1234567890abcdef12347
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "_id": "65c1234567890abcdef12346",
    "reference": "PROP-2026-00002",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../def456.jpg",
        "_id": "65c1234567890abcdef12348"
      }
    ]
  }
}
```

---

## 🤖 Test 9 : Générer des descriptions IA

**Méthode** : `POST`  
**URL** : `http://localhost:5000/api/ai/generate-description/:id`  
**Headers** :
```
Content-Type: application/json
```

**Body (JSON)** - Optionnel :
```json
{
  "tone": "professional",
  "length": "medium"
}
```

**Paramètres** :
- **tone** : `professional` (défaut), `warm`, `luxury`
- **length** : `short` (50-80 mots), `medium` (120-180 mots, défaut), `long` (250-350 mots)

**Exemple complet** :
```
POST http://localhost:5000/api/ai/generate-description/65c1234567890abcdef12345

Body:
{
  "tone": "luxury",
  "length": "long"
}
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Descriptions generated successfully",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "data": {
    "variant1": "Découvrez cet exceptionnel appartement de 75m² situé au cœur de Paris...",
    "variant2": "Au sein d'un quartier prisé parisien, cet élégant trois pièces de 75m²...",
    "variant3": "Ce magnifique appartement parisien de 75m² allie charme et modernité...",
    "metadata": {
      "tone": "luxury",
      "length": "long",
      "generatedAt": "2026-02-07T00:00:00.000Z"
    }
  }
}
```

---

## 🧪 Scénario de test complet

### Ordre recommandé :

1. ✅ **Health Check** - Vérifier que l'API fonctionne
2. 📝 **Créer propriété 1** - Appartement sans images
3. 📝 **Créer propriété 2** - Maison sans images
4. 📝 **Créer propriété 3** - Villa avec images (si Cloudinary configuré)
5. 📋 **Lister toutes** - Vérifier les 3 propriétés
6. 🔍 **Récupérer propriété 1** - Test READ ONE
7. ✏️ **Modifier propriété 1** - Changer prix et description
8. 📋 **Lister avec filtres** - Tester les filtres par type, ville, prix
9. 🤖 **Générer descriptions** - Tester les 3 tons différents
10. ❌ **Supprimer propriété 2** - Test DELETE

---

## 🛠️ Résolution des erreurs courantes

### Erreur 500 : MongoDB not connected
```json
{
  "success": false,
  "message": "Internal server error"
}
```
**Solution** : Vérifiez votre MONGODB_URI dans `.env` et que MongoDB est connecté.

### Erreur 400 : Validation error
```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      {
        "field": "price",
        "message": "\"price\" must be a number"
      }
    ]
  }
}
```
**Solution** : Vérifiez les types de vos données (price doit être un nombre, pas une string).

### Erreur 404 : Property not found
```json
{
  "success": false,
  "message": "Property not found"
}
```
**Solution** : Vérifiez que l'ID est correct (24 caractères hexadécimaux).

### Erreur 400 : Invalid ID format
```json
{
  "success": false,
  "message": "Invalid ID format"
}
```
**Solution** : L'ID MongoDB doit être un ObjectId valide (ex: `65c1234567890abcdef12345`).

---

## 📦 Collection Postman à importer

Pour faciliter les tests, créez une collection Postman avec les variables suivantes :

**Variables d'environnement** :
```
base_url: http://localhost:5000/api
property_id: [À remplir après Test 2]
image_id: [À remplir après Test 7]
```

Ensuite, utilisez `{{base_url}}` et `{{property_id}}` dans vos requêtes.

---

## 🎯 Prochaines étapes

Une fois les tests CRUD validés :
1. ✅ Configurer OpenAI API key dans `.env`
2. 🤖 Tester la génération de descriptions avec les 3 tons
3. 🔗 Intégrer avec le module d'authentification de votre collègue
4. 📊 Implémenter le module d'évaluation des prix (Phase 2)

---

**Besoin d'aide ?** Consultez les logs du serveur pour plus de détails sur les erreurs.
