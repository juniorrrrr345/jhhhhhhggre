# Correction - Erreur BUTTON_URL_INVALID

## Problème résolu

**Erreur rencontrée :** `TelegramError: 400: Bad Request: BUTTON_URL_INVALID`

## Cause du problème

L'erreur était causée par une adresse email (`support@swissquality.ch`) utilisée comme URL pour un bouton Telegram. Les boutons Telegram n'acceptent que des URLs valides (http/https), pas les adresses email.

## Solution appliquée

### 1. Identification du problème
- L'URL invalide était configurée dans `config.welcome.socialMedia`
- Type de bouton : `🆘 Support -> support@swissquality.ch`

### 2. Script de correction créé
- **Fichier :** `bot/scripts/fix-invalid-button-urls.js`
- **Fonction :** Supprime automatiquement les URLs invalides (adresses email, URLs malformées)
- **Sécurité :** Valide toutes les URLs avant de les conserver

### 3. Commandes disponibles
```bash
# Corriger les URLs invalides
npm run fix-urls

# Diagnostic rapide
npm run diagnostic
```

## Tests effectués

✅ **Test de validation des URLs :** Toutes les URLs sont maintenant valides
✅ **Test de création du clavier :** Le clavier principal se génère sans erreur
✅ **Test de configuration :** MongoDB connecté et configuration récupérée avec succès

## Résultat

- ❌ **Avant :** Erreur `BUTTON_URL_INVALID` à chaque `/start`
- ✅ **Après :** Bot fonctionnel, tous les boutons avec URLs valides

## Configuration finale

**Réseaux sociaux d'accueil conservés :**
- 📱 Telegram: https://t.me/swissqualitysupport

**URLs supprimées :**
- 🆘 Support: support@swissquality.ch (adresse email invalide)

## Pour l'avenir

- Toujours utiliser des URLs complètes pour les boutons Telegram
- Les adresses email peuvent être utilisées dans du texte, mais pas comme URLs de boutons
- Utiliser le script `fix-urls` en cas de problème similaire