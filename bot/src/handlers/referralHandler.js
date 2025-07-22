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

// Envoyer un message de bienvenue personnalisé pour la boutique
const sendWelcomeMessage = async (ctx, boutique) => {
  try {
    const welcomeMessage = `🎉 **Bienvenue !**

Vous avez été invité par **${boutique.name}** !

🏪 **${boutique.name}**
📍 ${boutique.location || 'Non spécifié'}
${boutique.description}

🌟 Découvrez maintenant toutes nos boutiques ou explorez directement celle-ci !`;

    // Créer un clavier avec bouton spécial pour la boutique
    const keyboard = {
      inline_keyboard: [
        [{
          text: `🏪 Voir ${boutique.name}`,
          callback_data: `plug_${boutique._id}_from_referral`
        }],
        [{
          text: '🌟 Toutes les boutiques',
          callback_data: 'top_plugs'
        }],
        [{
          text: '💎 Boutiques VIP',
          callback_data: 'plugs_vip'
        }],
        [{
          text: '📞 Contact',
          callback_data: 'contact'
        }]
      ]
    };

    if (boutique.image) {
      await ctx.replyWithPhoto(boutique.image, {
        caption: welcomeMessage,
        reply_markup: keyboard,
        parse_mode: 'Markdown'
      });
    } else {
      await ctx.reply(welcomeMessage, {
        reply_markup: keyboard,
        parse_mode: 'Markdown'
      });
    }

    console.log(`✅ Message de bienvenue envoyé pour ${boutique.name}`);

  } catch (error) {
    console.error('❌ Erreur envoi message de bienvenue:', error);
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
  sendWelcomeMessage
};
