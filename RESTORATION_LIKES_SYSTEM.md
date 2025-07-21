# Restauration - Ancien Système de Likes

## Problème résolu

**Problème :** Le système de likes continue de bugger malgré les corrections précédentes

## Solution appliquée

**Retour à l'ancien système qui fonctionnait (commit `008bb80`)**

### Ancien gestionnaire restauré

```javascript
// Liker une boutique
bot.action(/^like_([a-f\d]{24})$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const userId = ctx.from.id;
    
    console.log(`User ${userId} wants to like plug ${plugId}`);
    
    // Vérifier si la boutique existe
    const Plug = require('./src/models/Plug');
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      return ctx.answerCbQuery('❌ Boutique non trouvée');
    }
    
    const hasLiked = plug.likedBy.includes(userId);
    const action = hasLiked ? 'unlike' : 'like';
    
    // Mettre à jour les likes
    if (action === 'like') {
      plug.likedBy.push(userId);
      plug.likes += 1;
      await plug.save();
      await ctx.answerCbQuery(`❤️ Vous avez liké ${plug.name} ! (${plug.likes} likes)`);
    } else {
      plug.likedBy = plug.likedBy.filter(id => id !== userId);
      plug.likes -= 1;
      await plug.save();
      await ctx.answerCbQuery(`💔 Like retiré de ${plug.name} (${plug.likes} likes)`);
    }
    
    // Mettre à jour le clavier avec le nouveau statut
    const { createPlugKeyboard } = require('./src/utils/keyboards');
    const newKeyboard = createPlugKeyboard(plug, 'top_plugs');
    
    try {
      await ctx.editMessageReplyMarkup(newKeyboard.reply_markup);
    } catch (error) {
      // Ignore si le message n'a pas changé
      console.log('Keyboard update skipped');
    }
    
  } catch (error) {
    console.error('Erreur like boutique:', error);
    await ctx.answerCbQuery('❌ Erreur lors du like');
  }
});
```

## Pourquoi l'ancien système fonctionne mieux

### 1. **Simplicité**
- Code direct et facile à comprendre
- Moins de vérifications complexes
- Logique straightforward

### 2. **Fiabilité prouvée**
- Système qui a déjà fonctionné en production
- Testé et validé par l'usage
- Pas de sur-engineering

### 3. **Gestion d'erreurs appropriée**
- Gestion d'erreurs simple mais efficace
- Messages clairs pour l'utilisateur
- Fallback silencieux pour la mise à jour du clavier

## Tests de validation

✅ **Test de cohérence :** likes = likedBy.length  
✅ **Test like/unlike :** Ajout et retrait fonctionnels  
✅ **Test de sauvegarde :** Données persistées correctement  
✅ **Test des boutons :** Génération et mise à jour OK  

## Leçon apprise

**"Si ça marche, ne le cassez pas"**

L'ancien système était déjà optimal pour les besoins. Les tentatives d'amélioration ont introduit de la complexité inutile et des bugs.

## Actions réalisées

1. ❌ **Supprimé :** Système complexe avec sessions et fallbacks multiples
2. ✅ **Restauré :** Ancien gestionnaire simple et éprouvé
3. 🧹 **Nettoyé :** Code dupliqué et orphelin supprimé
4. ✅ **Testé :** Validation complète du système restauré

## Résultat final

- ❌ **Avant :** Système bogué malgré les corrections
- ✅ **Après :** Retour au système fiable et fonctionnel

Le système de likes fonctionne maintenant exactement comme avant, quand il était stable.