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
      console.log('🎯 Mais on va quand même afficher la boutique demandée');
      // Utilisateur déjà parrainé, mais on affiche quand même la boutique
      // Ne pas enregistrer de nouveau parrainage, juste rediriger
      await redirectToShopDetails(ctx, boutique);
      return true;
    }

    // Extraire l'ID de la boutique du code de parrainage
    console.log('🔍 Recherche boutique avec code:', referralCode);
    
    // Essayer d'abord par code exact
    let boutique = await Plug.findOne({ referralCode: referralCode });
    
    // Si pas trouvé, extraire l'ID du code (format: ref_ID_timestamp)
    if (!boutique && referralCode.startsWith('ref_')) {
      const parts = referralCode.split('_');
      if (parts.length >= 2) {
        const boutiqueId = parts[1]; // L'ID est après "ref_"
        console.log('🔍 Recherche par ID extrait:', boutiqueId);
        
        // Vérifier si c'est un ID MongoDB valide
        if (boutiqueId.match(/^[a-f\d]{24}$/)) {
          boutique = await Plug.findById(boutiqueId);
        }
      }
    }
    
    if (!boutique) {
      console.log('❌ Code de parrainage invalide:', referralCode);
      console.log('❌ Aucune boutique trouvée pour ce code');
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
    console.log('📝 Vérification utilisateur déjà parrainé...');
    const isAlreadyReferred = boutique.referredUsers.some(ref => ref.telegramId === userId);
    console.log(`🔍 Utilisateur ${userId} déjà dans la liste: ${isAlreadyReferred}`);
    
    if (!isAlreadyReferred) {
      console.log('➕ Ajout nouvel utilisateur parrainé...');
      boutique.referredUsers.push({
        telegramId: userId,
        username: username,
        invitedAt: new Date()
      });
      boutique.totalReferred = boutique.referredUsers.length;
      console.log(`📊 Nouveau total parrainés: ${boutique.totalReferred}`);
      await boutique.save();
      console.log('✅ Boutique sauvegardée avec nouveau parrainé');
    } else {
      console.log('⚠️ Utilisateur déjà parrainé, pas d\'ajout');
    }

    console.log(`✅ Parrainage réussi: ${username} → ${boutique.name}`);

    // Rediriger directement vers les détails de la boutique
    console.log('🎯 Appel redirectToShopDetails...');
    await redirectToShopDetails(ctx, boutique);
    console.log('✅ redirectToShopDetails terminé');
    
    return true;

  } catch (error) {
    console.error('❌ Erreur dans handleReferral:', error);
    return false;
  }
};

// Rediriger directement vers les détails de la boutique
const redirectToShopDetails = async (ctx, boutique) => {
  try {
    console.log(`🎯 DÉBUT redirectToShopDetails pour ${boutique.name}`);
    console.log('🔍 Boutique ID:', boutique._id);
    console.log('🔍 Boutique VIP:', boutique.isVip);
    
    // Afficher directement les détails de la boutique avec bouton de retour approprié
    const Config = require('../models/Config');
    const { createPlugKeyboard } = require('../utils/keyboards');
    const { sendMessageWithImage } = require('../utils/messageHelper');
    
    const config = await Config.findById('main');

    let message = `${boutique.isVip ? '⭐ ' : ''}**${boutique.name}**\n\n`;
    message += `📝 ${boutique.description}\n\n`;

    // Services disponibles
    const services = [];
    if (boutique.services?.delivery?.enabled) {
      services.push(`🚚 **Livraison**${boutique.services.delivery.description ? `: ${boutique.services.delivery.description}` : ''}`);
    }
    if (boutique.services?.postal?.enabled) {
      services.push(`✈️ **Envoi postal**${boutique.services.postal.description ? `: ${boutique.services.postal.description}` : ''}`);
    }
    if (boutique.services?.meetup?.enabled) {
      services.push(`🏠 **Meetup**${boutique.services.meetup.description ? `: ${boutique.services.meetup.description}` : ''}`);
    }

    if (services.length > 0) {
      message += `🔧 **Services :**\n${services.join('\n')}\n\n`;
    }

    // Pays desservis
    if (boutique.countries && boutique.countries.length > 0) {
      message += `🌍 **Pays desservis :** ${boutique.countries.join(', ')}\n\n`;
    }

    // Afficher les likes avec la bonne icône
    const likesCount = boutique.likes || 0;
    message += `🖤 ${likesCount} like${likesCount !== 1 ? 's' : ''}\n\n`;

    // Créer le clavier avec le contexte 'referral'
    const keyboard = createPlugKeyboard(boutique, 'referral', ctx.from?.id);

    console.log('📤 Envoi du message de détails...');
    console.log('📝 Message à envoyer:', message.substring(0, 100) + '...');
    
    // Envoyer avec image si disponible
    if (boutique.image) {
      console.log('🖼️ Envoi avec image:', boutique.image);
      await ctx.replyWithPhoto(boutique.image, {
        caption: message,
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    } else {
      console.log('📝 Envoi sans image');
      await ctx.reply(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }
    
    console.log(`✅ FIN redirectToShopDetails - Message envoyé pour ${boutique.name}`);

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
