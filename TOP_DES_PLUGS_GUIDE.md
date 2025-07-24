# 🔌 Guide du Nouveau Système "Top des Plugs"

## 📋 Vue d'ensemble

Le système "Top des Plugs" a été entièrement refait selon vos spécifications pour offrir une expérience de filtrage avancée avec :

- ✅ **Filtrage par pays** (dynamique selon les plugs disponibles)
- ✅ **Filtrage par services** (Livraison, Meetup, Envoi Postal)
- ✅ **Filtrage par départements** (pour Livraison et Meetup)
- ✅ **Combinaison de filtres** (Pays + Service + Département)
- ✅ **Réinitialisation complète** des filtres

---

## 🔄 Fonctionnement Étape par Étape

### 🧱 **Étape 1 - Affichage Initial**

Quand l'utilisateur clique sur **"🔌 Top Des Plugs"** :

```
🔌 Liste des Plugs
(Triés par nombre de votes)

🇫🇷 🇪🇸 🇨🇭 🇮🇹  [Boutons pays dynamiques]

📦 Livraison | 🤝 Meetup | 📬 Envoi Postal  [Filtres services]

🇫🇷 69 CANAGOOD 👍 1020
🇫🇷 I ❤️ NARBO 👍 535
🇫🇷 HASHTAG PLUG 👍 482
...

🔁 Réinitialiser les filtres | 🔙 Retour au menu
```

### 🌍 **Filtrage par Pays**

- Clic sur un drapeau → filtre les plugs par pays
- Le drapeau sélectionné affiche ✅
- La liste se met à jour automatiquement

### 📦 **Filtrage par Services**

#### **Livraison** :
```
📦 Afficher les boutiques disponibles pour livraison

🇫🇷 🇪🇸 🇨🇭 🇮🇹  [Pays]
✅ 📦 Livraison | 🤝 Meetup | 📬 Envoi Postal  [Services]
📍 Département 🔁  [Nouveau bouton]

[Liste des plugs avec livraison]

🔁 Réinitialiser les filtres | 🔙 Retour au menu
```

#### **Meetup** :
```
🤝 Afficher les boutiques disponibles pour meetup

🇫🇷 🇪🇸 🇨🇭 🇮🇹
📦 Livraison | ✅ 🤝 Meetup | 📬 Envoi Postal
📍 Département 🔁

[Liste des plugs avec meetup]

🔁 Réinitialiser les filtres | 🔙 Retour au menu
```

#### **Envoi Postal** :
```
📬 Boutiques qui font des envois postaux

🇫🇷 🇪🇸 🇨🇭 🇮🇹
📦 Livraison | 🤝 Meetup | ✅ 📬 Envoi Postal

[Liste directe - pas de départements]

🔁 Réinitialiser les filtres | 🔙 Retour au menu
```

### 📍 **Filtrage par Départements**

Disponible uniquement pour **Livraison** et **Meetup**.

Clic sur **"📍 Département 🔁"** :

```
📍 Départements disponibles

📦 Service: Livraison
🌍 Pays: 🇫🇷 France

Sélectionnez un département :

📍 33 | 📍 59
📍 69 | 📍 75
📍 92 | 📍 93
📍 95

🔙 Retour
```

Après sélection d'un département :

```
🔌 Liste des Plugs
(Triés par nombre de votes)

📦 Service: Livraison
📍 Département: 69
🌍 Pays: 🇫🇷 France

🇫🇷 69 CANAGOOD 👍 1020
🇫🇷 69 LYON COFFEE 👍 245
...

🔁 Réinitialiser les filtres | 🔙 Retour au menu
```

---

## 🛠️ Implémentation Technique

### **Nouveaux Handlers Créés :**

1. **`handleTopPlugs`** - Affichage initial avec pays + services
2. **`handleTopCountryFilter`** - Filtrage par pays
3. **`handleTopServiceFilter`** - Filtrage par service (avec pays optionnel)
4. **`handleDepartmentFilter`** - Affichage des départements disponibles
5. **`handleSpecificDepartment`** - Filtrage par département spécifique
6. **`handleResetFilters`** - Réinitialisation complète

### **Nouvelles Actions Telegram :**

```javascript
bot.action(/^top_country_(.+)$/, ...)     // Pays
bot.action(/^top_service_(.+)$/, ...)     // Services
bot.action(/^top_departments_(.+)$/, ...) // Départements
bot.action(/^top_dept_(.+)_(.+)$/, ...)   // Département spécifique
bot.action('top_reset_filters', ...)      // Reset
```

### **Modèle de Données Étendu :**

Le modèle `Plug` a été étendu avec :

```javascript
services: {
  delivery: {
    enabled: Boolean,
    description: String,
    departments: [String]  // ← NOUVEAU
  },
  meetup: {
    enabled: Boolean,
    description: String,
    departments: [String]  // ← NOUVEAU
  },
  postal: {
    enabled: Boolean,
    description: String
  }
}
```

### **Fonctions Utilitaires :**

- **`getAvailableCountries()`** - Récupère les pays dynamiquement
- **`getAvailableDepartments(service, country)`** - Départements par service/pays
- **`getCountryFlag(country)`** - Conversion pays → emoji drapeau
- **`createTopPlugsKeyboard()`** - Clavier principal adaptatif
- **`createDepartmentsKeyboard()`** - Clavier des départements

---

## 📊 Données d'Exemple Ajoutées

Le script `add-departments-data.js` a ajouté des départements d'exemple :

### **France :** 
`69, 75, 92, 93, 94, 95, 77, 78, 91, 13, 33, 59, 31`

### **Spain :** 
`28, 08, 41, 46, 48, 50`

### **Switzerland :** 
`GE, VD, VS, FR, NE, JU`

### **Autres pays :**
- Italy, Belgium, Germany avec leurs codes respectifs

---

## 🔄 Logique de Réinitialisation

Le bouton **"🔁 Réinitialiser les filtres"** :

1. Efface tous les filtres actifs
2. Retourne à l'affichage initial
3. Affiche tous les plugs triés par votes
4. Réaffiche les filtres dans leur état par défaut

---

## ✅ Tests Réalisés

- ✅ Récupération dynamique des pays (18 pays trouvés)
- ✅ Départements livraison (7 départements)
- ✅ Départements meetup (5 départements)
- ✅ Filtrage par pays spécifique (France)
- ✅ Combinaisons pays + service + département

---

## 🚀 Utilisation

Le nouveau système est **immédiatement opérationnel** ! 

Les utilisateurs peuvent :

1. **Parcourir** tous les plugs par défaut
2. **Filtrer par pays** en cliquant sur les drapeaux
3. **Filtrer par service** (Livraison/Meetup/Postal)
4. **Affiner par département** (si Livraison/Meetup)
5. **Combiner** plusieurs filtres
6. **Réinitialiser** à tout moment

Le système s'adapte automatiquement aux données disponibles dans la base.