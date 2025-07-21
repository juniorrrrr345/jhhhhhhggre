#!/usr/bin/env node

/**
 * Version simplifiée et robuste du gestionnaire de likes
 * Remplace le système actuel qui bug
 */

const fs = require('fs');
const path = require('path');

function createSimpleLikesHandler() {
  return `
// Gestionnaire de likes SIMPLIFIÉ ET ROBUSTE
bot.action(/^like_([a-f\\d]{24})$/, async (ctx) => {
  const plugId = ctx.match[1];
  const userId = ctx.from.id;
  
  console.log(\`👤 Like action: User \${userId} -> Plug \${plugId}\`);
  
  try {
    // 1. Répondre immédiatement pour éviter les timeouts
    await ctx.answerCbQuery('⏳ Traitement...').catch(() => {});
    
    // 2. Récupérer le plug
    const Plug = require('./src/models/Plug');
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      console.log(\`❌ Plug non trouvé: \${plugId}\`);
      return await ctx.answerCbQuery('❌ Boutique introuvable').catch(() => {});
    }
    
    // 3. Initialiser les champs si nécessaire
    if (!plug.likedBy) plug.likedBy = [];
    if (!plug.likes) plug.likes = 0;
    
    // 4. Vérifier si l'utilisateur a déjà liké
    const userIndex = plug.likedBy.indexOf(userId);
    const hasLiked = userIndex !== -1;
    
    let message;
    
    if (hasLiked) {
      // Retirer le like
      plug.likedBy.splice(userIndex, 1);
      plug.likes = plug.likedBy.length;
      message = \`💔 Like retiré (\${plug.likes} like\${plug.likes !== 1 ? 's' : ''})\`;
      console.log(\`💔 Like retiré de \${plug.name}: \${plug.likes} total\`);
    } else {
      // Ajouter le like
      plug.likedBy.push(userId);
      plug.likes = plug.likedBy.length;
      message = \`❤️ Merci ! (\${plug.likes} like\${plug.likes !== 1 ? 's' : ''})\`;
      console.log(\`❤️ Like ajouté à \${plug.name}: \${plug.likes} total\`);
    }
    
    // 5. Sauvegarder en base
    await plug.save();
    
    // 6. Notifier l'utilisateur
    await ctx.answerCbQuery(message).catch(() => {});
    
    // 7. Mettre à jour le clavier (optionnel, peut échouer silencieusement)
    try {
      const { createPlugKeyboard } = require('./src/utils/keyboards');
      const keyboard = createPlugKeyboard(plug, ctx.session?.lastContext || 'top_plugs');
      await ctx.editMessageReplyMarkup(keyboard.reply_markup);
      console.log(\`✅ Clavier mis à jour avec succès\`);
    } catch (keyboardError) {
      console.log(\`⚠️ Mise à jour clavier échouée (pas grave): \${keyboardError.message}\`);
      // On ignore cette erreur car le like a été enregistré
    }
    
  } catch (error) {
    console.error(\`❌ Erreur système like:\`, {
      error: error.message,
      plugId,
      userId
    });
    
    // Notifier l'utilisateur de l'erreur
    await ctx.answerCbQuery('❌ Erreur technique, réessayez').catch(() => {});
  }
});`;
}

async function replaceLikesHandler() {
  console.log('🔧 Remplacement du gestionnaire de likes bogué...\n');
  
  try {
    const indexPath = path.join(__dirname, 'index.js');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // 1. Chercher et supprimer l'ancien gestionnaire de likes
    const likesRegex = /\/\/ Liker une boutique\s*bot\.action\(\/\^like_.*?\}\);\s*(?=\/\/|bot\.)/s;
    
    if (likesRegex.test(content)) {
      console.log('✅ Ancien gestionnaire de likes trouvé');
      
      // Remplacer par le nouveau
      content = content.replace(likesRegex, createSimpleLikesHandler() + '\n\n');
      
      // Écrire le fichier
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log('✅ Nouveau gestionnaire de likes installé');
      
      // Afficher un aperçu des changements
      console.log('\n📋 Améliorations apportées:');
      console.log('- ✅ Gestion d\'erreurs simplifiée mais robuste');
      console.log('- ✅ Réponse immédiate pour éviter les timeouts');
      console.log('- ✅ Logique de like/unlike claire et directe');
      console.log('- ✅ Synchronisation automatique likes/likedBy');
      console.log('- ✅ Mise à jour du clavier non-bloquante');
      console.log('- ✅ Logs détaillés pour le debugging');
      
    } else {
      console.log('❌ Gestionnaire de likes non trouvé dans le format attendu');
      console.log('💡 Recherche manuelle nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du remplacement:', error.message);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  replaceLikesHandler();
}

module.exports = { replaceLikesHandler };