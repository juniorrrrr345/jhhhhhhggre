const User = require('../models/User');
const Plug = require('../models/Plug');
const { ensureConnection } = require('../utils/database');
const { createMainKeyboard, createPlugKeyboard } = require('../utils/keyboards');
const { handlePlugDetails } = require('./plugsHandler');

// Gestionnaire pour les liens de parrainage
const handleReferral = async (ctx, referralCode) => {
  try {
    console.log('🔗 Traitement du parrainage avec code:', referralCode);
    
    await ensureConnection();
    
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ telegramId: userId });
    
    if (user && user.invitedBy) {
      console.log('⚠️ Utilisateur déjà parrainé par:', user.invitedBy);
      // Utilisateur déjà parrainé, continuer normalement
      return false;
    }

    // Extraire l'ID de la boutique du code de parrainage
    const boutique = await Plug.findOne({ referralCode: referralCode });
    
    if (!boutique) {
      console.log('❌ Code de parrainage invalide:', referralCode);
      return false;
    }

    console.log('✅ Boutique trouvée:', boutique.name);

    // Créer ou mettre à jour l'utilisateur
    if (!user) {
      user = new User({
        telegramId: userId,
        username: username,
        firstName: firstName,
        lastName: lastName
      });
    }

    // Associer l'utilisateur à la boutique
    user.invitedBy = boutique._id; // ID de la boutique
    user.invitedAt = new Date();
    user.associatedShop = boutique._id;
    user.lastActivity = new Date();

    await user.save();

    // Ajouter l'utilisateur à la liste des parrainés de la boutique
    if (!boutique.referredUsers.some(ref => ref.telegramId === userId)) {
      boutique.referredUsers.push({
        telegramId: userId,
        username: username,
        invitedAt: new Date()
      });
      boutique.totalReferred = boutique.referredUsers.length;
      await boutique.save();
    }

    console.log(`✅ Parrainage réussi: ${username} → ${boutique.name}`);

    // Rediriger directement vers les détails de la boutique
    await redirectToShopDetails(ctx, boutique);
    
    return true;

  } catch (error) {
    console.error('❌ Erreur dans handleReferral:', error);
    return false;
  }
};

// Rediriger directement vers les détails de la boutique
const redirectToShopDetails = async (ctx, boutique) => {
  try {
    console.log(`🎯 Redirection directe vers ${boutique.name}`);
    
    // Utiliser handlePlugDetails pour afficher directement les détails de la boutique
    await handlePlugDetails(ctx, boutique._id, 'referral');
    
    console.log(`✅ Redirection réussie vers ${boutique.name}`);

  } catch (error) {
    console.error('❌ Erreur redirection vers boutique:', error);
    
    // Fallback : message simple si la redirection échoue
    try {
      const fallbackMessage = `🎉 **Bienvenue !**

Vous avez été invité par **${boutique.name}** !

Cliquez sur le bouton ci-dessous pour voir cette boutique :`;

      const keyboard = {
        inline_keyboard: [
          [{
            text: `🏪 Voir ${boutique.name}`,
            callback_data: `plug_${boutique._id}_from_referral`
          }],
          [{
            text: '🌟 Toutes les boutiques',
            callback_data: 'top_plugs'
          }]
        ]
      };

      await ctx.reply(fallbackMessage, {
        reply_markup: keyboard,
        parse_mode: 'Markdown'
      });
    } catch (fallbackError) {
      console.error('❌ Erreur fallback:', fallbackError);
    }
  }
};

// Commande /parrainage pour afficher les statistiques
const handleParrainageCommand = async (ctx) => {
  try {
    await ensureConnection();
    
    const userId = ctx.from.id;
    
    // Vérifier si l'utilisateur a une boutique associée (propriétaire)
    const userShop = await Plug.findOne({ 
      $or: [
        { 'socialMedia.url': { $regex: ctx.from.username, $options: 'i' } },
        // Ou autre logique pour identifier le propriétaire
      ]
    });

    if (!userShop) {
      return ctx.reply('❌ Vous n\'avez pas de boutique enregistrée pour le parrainage.');
    }

    // Générer le lien si pas encore fait
    if (!userShop.referralCode || !userShop.referralLink) {
      const botInfo = await ctx.telegram.getMe();
      userShop.referralCode = userShop.generateReferralCode();
      userShop.referralLink = userShop.generateReferralLink(botInfo.username);
      await userShop.save();
    }

    const message = `🔗 **Votre lien de parrainage**

🏪 **${userShop.name}**

📎 \`${userShop.referralLink}\`

📊 **Statistiques:**
👥 Personnes invitées: **${userShop.totalReferred}**
❤️ Likes totaux: **${userShop.likes}**

💡 Partagez ce lien pour que les nouveaux utilisateurs découvrent directement votre boutique !`;

    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📋 Copier le lien',
            url: userShop.referralLink
          }]
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans handleParrainageCommand:', error);
    await ctx.reply('❌ Erreur lors de la récupération des informations de parrainage.');
  }
};

module.exports = {
  handleReferral,
  handleParrainageCommand,
  redirectToShopDetails
};
