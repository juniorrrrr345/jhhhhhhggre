# 🧪 CHECKLIST DE VÉRIFICATION MANUELLE COMPLÈTE

## ✅ **CORRECTIONS RÉCENTES IMPLÉMENTÉES**

### 🔧 **Bot Telegram**
- [x] **Reset des filtres** : Modification du message existant (pas de nouveau message)
- [x] **Traductions complètes** : Tous les textes, menus, formulaires, erreurs
- [x] **Sélection de langue** : Pas d'erreur, retour au menu principal avec ✅
- [x] **Filtres Top Plugs** : Pays et services en haut de la liste
- [x] **Prévention spam** : Gestion des clics répétés avec emoji 🔄
- [x] **Image d'accueil** : FindYourPlug (DD5OU6o.jpeg)

### 🔧 **Panel Admin Vercel**
- [x] **Centrage des textes** : Services (Livraison, Meetup, Envoi) centrés
- [x] **Suppression du vote** : Affichage seulement (👍 + nombre)
- [x] **Synchronisation** : CORS proxy pointe vers https://safepluglink-6hzr.onrender.com
- [x] **Robustesse** : Gestion des erreurs, vérifications plug?.

---

## 🤖 **1. TESTS BOT TELEGRAM**

### **A. Sélection de langue**
- [ ] Aller dans "Sélectionner votre langue préférée"
- [ ] Choisir une langue (ex: English, Español, Italiano, Deutsch)
- [ ] **Vérifier** : ✅ apparaît sur la langue choisie
- [ ] **Vérifier** : Pas de message d'erreur "Erreur lors du chargement du menu"
- [ ] **Vérifier** : Retour automatique au menu principal
- [ ] **Vérifier** : Interface traduite dans la nouvelle langue

### **B. Navigation Top Plugs**
- [ ] Cliquer sur "🏆 Top des Plugs"
- [ ] **Vérifier** : Titre "Liste des Plugs (Triés par nombre de votes)" (traduit)
- [ ] **Vérifier** : Boutons pays en haut : 🇫🇷 🇧🇪 🇨🇭 etc.
- [ ] **Vérifier** : Boutons services : 📦 Livraison | 🤝 Meetup | 📬 Envoi Postal
- [ ] **Vérifier** : Bouton 🔁 Réinitialiser les filtres
- [ ] **Vérifier** : Liste des boutiques en bas

### **C. Filtres pays**
- [ ] Cliquer sur un pays (ex: 🇫🇷)
- [ ] **Vérifier** : Liste filtrée par pays
- [ ] **Vérifier** : Boutons filtres restent visibles
- [ ] **Cliquer plusieurs fois sur le même pays**
- [ ] **Vérifier** : Pas de spam de messages (emoji 🔄 seulement)

### **D. Filtres services**
- [ ] **Test Livraison** : Cliquer sur 📦 Livraison
  - [ ] **Vérifier** : "Afficher les boutiques disponibles pour livraison"
  - [ ] **Vérifier** : Bouton "📍 Département 🔁" apparaît
  - [ ] **Vérifier** : Liste des boutiques de livraison
- [ ] **Test Meetup** : Cliquer sur 🤝 Meetup  
  - [ ] **Vérifier** : "Afficher les boutiques disponibles pour meetup"
  - [ ] **Vérifier** : Bouton "📍 Département 🔁" apparaît
- [ ] **Test Envoi Postal** : Cliquer sur 📬 Envoi Postal
  - [ ] **Vérifier** : "Boutiques qui font des envois postaux"
  - [ ] **Vérifier** : Liste directe (pas de département)

### **E. Reset des filtres**
- [ ] Appliquer un filtre (pays ou service)
- [ ] Cliquer sur "🔁 Réinitialiser les filtres"
- [ ] **VÉRIFIER CRITIQUE** : Le message existant est modifié (pas nouveau message)
- [ ] **Vérifier** : Retour à la vue initiale complète
- [ ] **Vérifier** : Tous les filtres supprimés

### **F. Formulaire "Devenir Plug"**
- [ ] Cliquer sur "Devenir Plug"
- [ ] **Vérifier** : Toutes les questions traduites dans la langue choisie
- [ ] **Vérifier** : Messages d'erreur traduits si champs vides
- [ ] **Tester annulation** : Cliquer "❌ Annuler"
- [ ] **Vérifier** : Message d'annulation traduit

### **G. Info et Contact**
- [ ] Cliquer sur "Info"
- [ ] **Vérifier** : Titre et contenu traduits
- [ ] Cliquer sur "Contact"  
- [ ] **Vérifier** : Titre et contenu traduits

---

## 🌐 **2. TESTS PANEL ADMIN VERCEL**

### **A. Accès et navigation**
- [ ] Ouvrir http://localhost:3000/shop (ou Vercel URL)
- [ ] **Vérifier** : Liste des boutiques s'affiche
- [ ] **Vérifier** : Boutique "teste" visible (synchronisée avec bot)

### **B. Détails boutique**
- [ ] Cliquer sur une boutique (ex: "teste")
- [ ] **Vérifier** : Page de détails se charge sans erreur
- [ ] **Vérifier** : Image et informations s'affichent

### **C. Services (centrage et vote)**
- [ ] **Vérifier Livraison** : Texte "Livraison" bien centré
- [ ] **Vérifier Meetup** : Texte "Meetup" bien centré  
- [ ] **Vérifier Envoi postal** : Texte "Envoi postal" bien centré
- [ ] **Vérifier Vote** : 👍 affiché mais PAS cliquable
- [ ] **Vérifier** : Nombre de likes affiché (ex: 4)

### **D. Responsive et langues longues**
- [ ] Changer la langue vers Allemand ou une langue avec mots longs
- [ ] **Vérifier** : Textes des services restent bien centrés
- [ ] **Vérifier** : Pas de débordement ou mauvais alignement

---

## 🔄 **3. TESTS DE SYNCHRONISATION**

### **A. Bot → Vercel**
- [ ] **Via Bot** : Ajouter une nouvelle boutique (Devenir Plug)
- [ ] **Via Admin** : Aller sur /admin/plugs/new et ajouter une boutique
- [ ] **Vérifier** : Nouvelle boutique apparaît dans la liste Vercel
- [ ] **Vérifier** : Données cohérentes (nom, services, pays)

### **B. Votes synchronisés**
- [ ] **Via Bot** : Voter pour une boutique (👍)
- [ ] **Via Vercel** : Vérifier que le nombre de likes est mis à jour
- [ ] **Vérifier** : Compteur cohérent entre bot et Vercel

---

## 🌍 **4. TESTS MULTI-LANGUES APPROFONDIS**

### **A. Test de chaque langue**
- [ ] **Français** : Interface complète
- [ ] **English** : Menus, filtres, formulaires
- [ ] **Español** : Navigation, messages d'erreur
- [ ] **Italiano** : Top Plugs, services
- [ ] **Deutsch** : Textes longs, responsive

### **B. Persistance**
- [ ] Changer de langue
- [ ] Naviguer dans plusieurs menus
- [ ] **Vérifier** : Langue reste constante
- [ ] Redémarrer conversation (/start)
- [ ] **Vérifier** : Langue par défaut (français)

---

## 🐛 **5. RECHERCHE DE BUGS**

### **A. Navigation intensive**
- [ ] Cliquer rapidement sur plusieurs filtres
- [ ] Alterner entre pays et services
- [ ] **Vérifier** : Pas de messages dupliqués
- [ ] **Vérifier** : Pas d'erreurs JavaScript

### **B. Cas limites**
- [ ] Tester avec 0 boutique dans un filtre
- [ ] Tester avec des noms de boutiques très longs
- [ ] **Vérifier** : Gestion gracieuse des erreurs

### **C. Performance**
- [ ] Ouvrir plusieurs onglets Vercel
- [ ] Utiliser le bot simultanément
- [ ] **Vérifier** : Pas de ralentissement notable

---

## 📊 **6. VÉRIFICATION FINALE**

### **Statut actuel détecté** :
- ✅ Bot Telegram : Fonctionnel (port 3025)
- ✅ Base de données : 1 boutique "teste" avec 4 likes
- ✅ API publique : Réponse correcte
- ⚠️ Panel Admin : À vérifier manuellement
- ✅ Synchronisation : MongoDB partagé (Render)

### **Points critiques à confirmer** :
1. **Reset filtres** : Modification message (pas nouveau)
2. **Centrage services** : Livraison/Meetup/Envoi sur Vercel
3. **Vote désactivé** : Affichage seulement sur Vercel
4. **Traductions** : Formulaires et erreurs complètement traduits
5. **Spam prevention** : Gestion clics répétés

---

## ✅ **VALIDATION COMPLÈTE**

**Le système est considéré comme validé si** :
- [ ] Tous les tests Bot Telegram passent
- [ ] Panel Vercel fonctionne sans bugs
- [ ] Synchronisation bot ↔ Vercel opérationnelle  
- [ ] Toutes les langues fonctionnelles
- [ ] Aucun spam de messages
- [ ] Performance acceptable

**🎯 Prêt pour production après validation de cette checklist !**