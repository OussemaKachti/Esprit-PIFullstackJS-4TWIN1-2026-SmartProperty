# Documentation — Module BI Analytics Dashboard
## SmartProperty — Backoffice Admin

---

## 1. Vue d'ensemble

SmartProperty est une plateforme immobilière full-stack. Pour permettre aux administrateurs de **piloter la plateforme** et de **prendre des décisions basées sur les données**, nous avons intégré un module de **Business Intelligence (BI)** complet dans le backoffice admin.

**Objectif du module BI :** Transformer les données brutes stockées dans MongoDB en indicateurs visuels exploitables (KPIs, graphiques, tendances) accessibles en temps réel depuis un tableau de bord dédié.

---

## 2. Qu'est-ce que le BI ? Est-ce vraiment du BI ou juste des statistiques ?

### La question légitime

> "Dans un vrai projet BI, on utilise un ETL comme Talend pour extraire les données, un data warehouse, puis Power BI pour les visualisations. Ici, on fait juste des agrégations MongoDB — est-ce vraiment du BI ?"

### La réponse honnête

**Oui, c'est du BI.** Voici pourquoi :

| Concept | BI Classique (Entreprise) | Notre approche (Embedded BI) |
|---------|--------------------------|------------------------------|
| **Source des données** | Multiples systèmes hétérogènes (ERP, CRM, Excel…) | Une seule base MongoDB (source unique) |
| **ETL** | Talend, Informatica — extraction + transformation + chargement vers un DWH | MongoDB Aggregation Pipelines jouent le rôle de la transformation directement en base |
| **Stockage analytique** | Data Warehouse (Snowflake, Redshift, BigQuery) | Pas nécessaire — les données sont déjà structurées dans MongoDB |
| **Couche sémantique** | Modèle dimensionnel (tables de faits + dimensions) | Modèles Mongoose (Property, User, Transaction…) |
| **Visualisation** | Power BI, Tableau, Qlik | ApexCharts intégré dans React |
| **Accès** | Application séparée (portail Power BI) | Intégré dans le backoffice admin (Embedded BI) |

### Pourquoi notre approche est valide en BI

Le BI se définit par **l'objectif**, pas par les outils :

> **Business Intelligence** = processus de collecte, transformation, analyse et présentation des données d'une organisation pour aider à la prise de décision.

Nous remplissons exactement ce rôle :

1. **Collecte** : MongoDB stocke toutes les données opérationnelles (annonces, users, transactions)
2. **Transformation** : Les MongoDB Aggregation Pipelines calculent les métriques (groupements, filtrages, comparaisons temporelles)
3. **Analyse** : KPIs avec comparaison mois/mois, tendances sur 12 mois, distributions
4. **Présentation** : Dashboard interactif avec charts professionnels

### Pourquoi on n'a pas eu besoin de Talend ni Power BI

- **Talend** est nécessaire quand les données viennent de **sources multiples et hétérogènes** (un fichier Excel + une base Oracle + une API externe). Ici, toutes les données sont déjà dans **une seule base MongoDB propre**.
- **Power BI** est un outil généraliste externe. Nous avons choisi l'**Embedded BI** — intégrer la visualisation directement dans l'application, ce qui est la tendance moderne (ex: Metabase, Grafana, Redash sont tous de l'embedded BI).

### La différence entre "statistiques" et "BI"

| Statistiques classiques | BI |
|------------------------|-----|
| Calculs ponctuels (ex: `db.count()`) | Analyses structurées avec KPIs définis par le métier |
| Pas de contexte temporel | Comparaison mois/mois, tendances, évolutions |
| Pas d'interface dédiée | Dashboard interactif accessible aux décideurs |
| Résultat brut (nombre) | Résultat contextualisé ("+12% vs mois précédent") |
| Pas d'accès contrôlé | Réservé aux ADMIN (RBAC) |

---

## 3. Stack technologique utilisée

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Base de données | **MongoDB** | Stockage de toutes les données opérationnelles |
| Transformation | **MongoDB Aggregation Pipelines** | Calcul des métriques — remplace l'ETL dans notre contexte |
| Backend | **Node.js + Express.js** | API REST qui expose les métriques calculées |
| Authentification | **JWT (JSON Web Token)** | Sécurisation de l'accès (Admin uniquement) |
| Frontend | **React + TypeScript** | Interface du tableau de bord |
| Visualisation | **ApexCharts** (`react-apexcharts`) | Rendu de tous les graphiques interactifs |
| Styling | **Tailwind CSS** | Design responsive + support dark mode |

**Aucune librairie BI payante.** Tout repose sur des outils open-source intégrés au projet.

---

## 4. Architecture du module

```
CLIENT (navigateur Admin)
    |
    | HTTPS + JWT Bearer Token
    ▼
[Express Router]  GET /api/bi/analytics
    |
    | Middleware: protect()        → vérifie le JWT
    | Middleware: authorize('ADMIN') → vérifie le rôle RBAC
    ▼
[biController.getAnalytics()]
    |
    | Promise.all(29 pipelines MongoDB en parallèle)
    ▼
[MongoDB]  Collections: Property, User, Transaction, Feedback, Lease
    |
    | Résultats agrégés et formatés
    ▼
[Réponse JSON]  KPIs + séries temporelles + distributions
    |
    ▼
[AdminAnalytics.tsx]
    |
    | useEffect() → fetch() → setData()
    | ReactApexChart renders
    ▼
Tableau de bord visuel interactif
```

---

## 5. Backend — Détail technique

### 5.1 `biController.js` — Le moteur analytique

Contient la fonction `getAnalytics` qui :

1. **Calcule les dates de référence** (mois courant, mois précédent, début d'année)
2. **Lance 29 requêtes MongoDB en parallèle** via `Promise.all()` pour minimiser la latence
3. **Calcule les % de variation** mois/mois avec la formule `((cur - prev) / prev) * 100`
4. **Formate et renvoie** un objet JSON structuré en sections

**Exemple — Pipeline "Nouvelles annonces par mois" :**
```js
Property.aggregate([
  { $match: { createdAt: { $gte: new Date(year, 0, 1) } } },
  { $group: {
      _id: { month: { $month: "$createdAt" } },
      count: { $sum: 1 }
  }}
])
```
Ce pipeline filtre les propriétés de l'année courante, les regroupe par mois, et compte.

**Collections MongoDB interrogées :**

| Collection | Données |
|------------|---------|
| `Property` | Annonces immobilières |
| `User` | Comptes utilisateurs |
| `Transaction` | Ventes et locations |
| `Feedback` | Avis et notes (1–5 étoiles) |
| `Lease` | Contrats de bail |

### 5.2 `bi.routes.js` — Route sécurisée

```js
router.get('/analytics', protect, authorize('ADMIN'), biController.getAnalytics);
```

Double protection middleware :
- `protect` : vérifie le token JWT → `401` si absent/invalide
- `authorize('ADMIN')` : vérifie le rôle → `403` si non-admin

---

## 6. Frontend — Détail technique

### 6.1 `AdminAnalytics.tsx` — Le tableau de bord

**Étape 1 — Fetch des données au montage :**
```tsx
useEffect(() => {
  fetch(`${API_URL}/bi/analytics`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  }).then(res => res.json()).then(data => setData(data));
}, []);
```

**Étape 2 — Skeleton pendant le chargement :**
Des blocs animés (`animate-pulse`) remplacent les charts pour une UX fluide.

**Étape 3 — Rendu des charts avec ApexCharts :**
```tsx
<ReactApexChart
  type="donut"
  height={250}
  options={donutOptions(labels, colors, "Total")}
  series={data}
/>
```

---

## 7. Contenu du tableau de bord

### 7.1 KPI Cards (5 indicateurs clés de performance)

| KPI | Valeur affichée | Comparaison |
|-----|----------------|-------------|
| Propriétés | Total + nouveaux ce mois | % vs mois précédent |
| Utilisateurs | Total + nouveaux ce mois | % vs mois précédent |
| Transactions | Total + nouveaux ce mois | % vs mois précédent |
| Revenue ce mois | Chiffre d'affaires en TND | % vs mois précédent |
| Prix moyen | Prix moyen + valeur totale du portefeuille | — |

### 7.2 Graphiques (12 visualisations)

| Section | Graphique | Type | Données |
|---------|-----------|------|---------|
| Évolution temporelle | Nouvelles annonces & Utilisateurs | Area (double courbe) | 12 mois |
| Évolution temporelle | Volume de transactions | Area | k TND sur 12 mois |
| Propriétés | Types de propriétés | Donut | APARTMENT, VILLA, HOUSE, LAND… |
| Propriétés | Statuts des propriétés | Donut | AVAILABLE, RENTED, SOLD… |
| Propriétés | Vente vs Location | Donut | FOR_SALE vs FOR_RENT |
| Géographie | Top 8 villes | Bar horizontal | Propriétés par ville |
| Utilisateurs | Répartition par rôle | Donut | ADMIN, AGENCY, OWNER, TENANT, BUYER |
| Transactions | Types | Donut | SALE vs RENT |
| Transactions | Statuts | Donut | PENDING, CONFIRMED, COMPLETED… |
| Satisfaction | Distribution des avis | Bar coloré | ★1 à ★5 |
| Finance | Distribution des prix | Bar | Fourchettes TND |
| Finance | Revenue par type | Bar | SALE vs RENT en TND |

---

## 8. Sécurité (RBAC)

Le module BI est réservé aux administrateurs. Deux niveaux :

1. **Authentification (AuthN)** : JWT valide requis → `401` sinon
2. **Autorisation (AuthZ)** : Rôle ADMIN requis → `403` sinon

Validation : `GET http://localhost:5000/api/bi/analytics` sans token → `401 "No token provided"`

---

## 9. Performance

**Problème :** 29 métriques en séquence = trop lent.

**Solution :** `Promise.all()` — toutes les requêtes MongoDB lancées **simultanément**.

```
Séquentiel : 29 × 50ms = ~1450ms
Parallèle  : max(50ms) = ~50–150ms
```

---

## 10. Flux complet — De la donnée au graphique

```
1. Admin se connecte  →  reçoit un JWT
2. Ouvre /admin/analytics  →  React monte le composant
3. useEffect() déclenche fetch GET /api/bi/analytics + JWT header
4. Express: protect() vérifie JWT → authorize('ADMIN') vérifie le rôle
5. biController: Promise.all(29 pipelines MongoDB)
6. MongoDB calcule agrégations, groupements, sommes, moyennes
7. Backend renvoie JSON: { kpis, timeSeries, properties, users, transactions, feedback }
8. React setState(data) → re-render
9. ApexCharts reçoit les series + options → rend les graphiques interactifs
10. Admin interagit, survole les points, lit les KPIs en temps réel
```

---

## 11. Fichiers créés / modifiés

### Backend
| Fichier | Action | Description |
|---------|--------|-------------|
| `src/controllers/biController.js` | Créé | 29 pipelines MongoDB en Promise.all |
| `src/routes/bi.routes.js` | Créé | GET /api/bi/analytics protégé ADMIN |
| `src/routes/index.js` | Modifié | Mount de /bi ajouté |
| `src/app.js` | Modifié | CORS whitelist mise à jour |

### Frontend (Backoffice)
| Fichier | Action | Description |
|---------|--------|-------------|
| `src/pages/Admin/AdminAnalytics.tsx` | Créé | Page BI avec KPIs + 12 charts |
| `src/App.tsx` | Modifié | Route /admin/analytics ajoutée |
| `src/layout/AppSidebar.tsx` | Modifié | Lien "Analytics BI" dans le menu admin |

---

## 12. Comment accéder

1. Se connecter sur `http://localhost:5174/signin` avec un compte ADMIN
2. Dans la sidebar → cliquer "Analytics BI"
3. La page charge automatiquement toutes les données depuis MongoDB
4. Bouton "Actualiser" disponible en haut à droite pour refresh manuel

---

## 13. Résumé pour la soutenance

> **Ce module implémente le principe du BI (Business Intelligence) sous forme d'Embedded BI dans l'application.**
>
> Dans un projet d'entreprise classique, on utiliserait Talend (ETL) pour extraire des données depuis plusieurs sources hétérogènes, les charger dans un Data Warehouse, puis Power BI pour les visualiser. Dans notre cas, une seule source de données structurée (MongoDB) rend l'ETL inutile. Les **MongoDB Aggregation Pipelines** jouent le rôle de la couche de transformation. L'API REST joue le rôle de la couche sémantique. Et **ApexCharts intégré dans React** joue le rôle de la couche de présentation.
>
> Le résultat est fonctionnellement équivalent à un dashboard Power BI pour notre périmètre : indicateurs clés en temps réel, comparaisons temporelles, distributions, tendances — le tout sécurisé par rôle et intégré nativement dans la plateforme.
