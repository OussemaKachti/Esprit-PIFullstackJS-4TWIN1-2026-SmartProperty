# SmartProperty Backend API

Backend API pour la plateforme SmartProperty - Gestion Immobilière Intelligente avec IA.

## 🚀 Fonctionnalités

### Module 1 : Gestion des Actifs Immobiliers
- ✅ CRUD complet des propriétés
- ✅ Upload multiple d'images (Cloudinary)
- ✅ Géolocalisation avec MongoDB Geospatial
- ✅ Recherche et filtrage avancés
- ✅ Traçabilité : Enregistrement de l'utilisateur créateur

### Module IA
- 🤖 **Génération de descriptions** : 3 variantes avec tons personnalisables (professionnel, chaleureux, luxe)
- 🔍 **Détection automatique des caractéristiques** : Analyse des photos avec GPT-4 Vision
- 📊 **Extraction intelligente** : Type de bien, pièces, équipements, état, style

## 🛠️ Stack Technique

- **Framework** : Express.js
- **Base de données** : MongoDB Atlas + Mongoose
- **IA** : OpenAI GPT-4 + GPT-4 Vision
- **Storage** : Cloudinary
- **Validation** : Joi
- **Logging** : Winston

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

## ⚙️ Configuration

Remplir les variables dans `.env` :

```env
MONGODB_URI=votre_url_mongodb_atlas
OPENAI_API_KEY=votre_clé_openai
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## 🏃 Démarrage

```bash
# Initialiser l'utilisateur statique (une seule fois)
npm run init-user

# Mode développement
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:5000`

## 📚 Endpoints API

### Properties

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/properties` | Liste toutes les propriétés |
| GET | `/api/properties/:id` | Récupère une propriété |
| POST | `/api/properties` | Crée une propriété |
| PUT | `/api/properties/:id` | Modifie une propriété |
| DELETE | `/api/properties/:id` | Supprime une propriété |
| DELETE | `/api/properties/:id/images/:imageId` | Supprime une image |

### AI (Intelligence Artificielle)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/generate-description/:id` | Génère 3 descriptions IA |
| POST | `/api/ai/analyze-images/:id` | Analyse les photos |
| POST | `/api/ai/apply-features/:id` | Applique les features détectées |

### Exemples

**Créer une propriété avec images :**
```bash
POST /api/properties
Content-Type: multipart/form-data

{
  "title": "Appartement moderne 3 pièces",
  "type": "APARTMENT",
  "price": 250000,
  "surface": 75,
  "rooms": 3,
  "address": "15 Rue de la Paix",
  "city": "Paris",
  "country": "France",
  "images": [file1, file2, file3]
}
```

**Générer des descriptions IA :**
```bash
POST /api/ai/generate-description/ID_PROPERTY
Content-Type: application/json

{
  "tone": "professional",  // professional | warm | luxury
  "length": "medium"       // short | medium | long
}
```

**Analyser les images :**
```bash
POST /api/ai/analyze-images/ID_PROPERTY
```

## 🏗️ Structure du projet

```
backend/
├── src/
│   ├── config/          # Configurations (DB, Cloudinary, OpenAI)
│   ├── models/          # Modèles Mongoose
│   ├── controllers/     # Contrôleurs (logique métier)
│   ├── services/        # Services IA
│   ├── routes/          # Routes Express
│   ├── middleware/      # Middlewares (upload, validation, erreurs)
│   ├── utils/           # Utilitaires (logger, apiResponse)
│   ├── app.js           # Configuration Express
│   └── server.js        # Point d'entrée
├── logs/                # Logs de l'application
├── .env.example         # Template variables d'environnement
└── package.json
```

## 🔐 Sécurité

- Helmet pour les en-têtes HTTP sécurisés
- CORS configuré
- Rate limiting (100 requêtes / 15 min)
- Validation des données avec Joi
- Gestion centralisée des erreurs

## 📝 À venir (Phase 2)

- [ ] Authentication JWT
- [ ] Autorisation basée sur les rôles
- [ ] Module d'évaluation des prix IA
- [ ] Appariement intelligent locataire/bien
- [ ] Analyse de solvabilité
- [ ] Webhooks et notifications

## 📄 Licence

ISC
