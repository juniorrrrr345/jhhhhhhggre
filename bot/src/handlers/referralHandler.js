const User = require('../models/User');
const Plug = require('../models/Plug');
const Config = require('../models/Config');
const { ensureConnection } = require('../utils/database');
const { createMainKeyboard, createPlugKeyboard } = require('../utils/keyboards');
const { handlePlugDetails } = require('./plugsHandler');
const { getTranslation, translateDescription } = require('../utils/translations');

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
    // ÉTAPE 1: D'abord trouver la boutique
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

    // ÉTAPE 2: Vérifier l'utilisateur
    let user = await User.findOne({ telegramId: userId });
    
    if (user && user.invitedBy) {
      console.log('⚠️ Utilisateur déjà parrainé par:', user.invitedBy);
      console.log('🎯 Mais on va quand même afficher la boutique demandée');
      // Utilisateur déjà parrainé, mais on affiche quand même la boutique
      // Ne pas enregistrer de nouveau parrainage, juste rediriger
      await redirectToShopDetails(ctx, boutique);
      return true;
    }

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
    const { createPlugKeyboard } = require('../utils/keyboards');
    const { sendMessageWithImage } = require('../utils/messageHelper');
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;

    let message = `${boutique.isVip ? '⭐ ' : ''}**${boutique.name}**\n\n`;
    const translatedDescription = translateDescription(boutique.description, currentLang);
    message += `${getTranslation('shop_description_label', currentLang, customTranslations)} ${translatedDescription}\n\n`;

    // Services disponibles avec formatage amélioré et traductions
    const services = [];
    if (boutique.services?.delivery?.enabled) {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      const serviceDesc = boutique.services.delivery.description ? 
        `: ${translateDescription(boutique.services.delivery.description, currentLang)}` : '';
      services.push(`📦 **${serviceName}**${serviceDesc}`);
    }
    if (boutique.services?.meetup?.enabled) {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      const serviceDesc = boutique.services.meetup.description ? 
        `: ${translateDescription(boutique.services.meetup.description, currentLang)}` : '';
      services.push(`🤝 **${serviceName}**${serviceDesc}`);
    }
    if (boutique.services?.postal?.enabled) {
      const serviceName = getTranslation('service_postal', currentLang, customTranslations);
      const serviceDesc = boutique.services.postal.description ? 
        `: ${translateDescription(boutique.services.postal.description, currentLang)}` : '';
      services.push(`📬 **${serviceName}**${serviceDesc}`);
    }

    if (services.length > 0) {
      const servicesTitle = getTranslation('services_available', currentLang, customTranslations);
      message += `**🔧 ${servicesTitle} :**\n${services.join('\n')}\n\n`;
    }

    // Pays desservis
    if (boutique.countries && boutique.countries.length > 0) {
      message += `🌍 **Pays desservis :** ${boutique.countries.join(', ')}\n\n`;
    }

    // Likes supprimés de la description - affichés uniquement sur le bouton

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
    
    // 1. Vérifier d'abord si l'utilisateur a une boutique avec ownerId
    let userShop = await Plug.findOne({ ownerId: userId });
    
    // 2. Si pas trouvé, vérifier s'il a une demande approuvée
    if (!userShop) {
      const PlugApplication = require('../models/PlugApplication');
      const approvedApplication = await PlugApplication.findOne({ 
        userId: userId, 
        status: 'approved' 
      });
      
      if (approvedApplication) {
        // Chercher la boutique par nom (lien entre application et boutique)
        userShop = await Plug.findOne({ name: approvedApplication.name });
        
        // Si trouvée, associer l'utilisateur comme propriétaire
        if (userShop && !userShop.ownerId) {
          userShop.ownerId = userId;
          await userShop.save();
          console.log(`✅ Boutique ${userShop.name} associée au propriétaire ${userId}`);
        }
      }
    }

    if (!userShop) {
      return ctx.reply(`❌ **Aucune boutique trouvée**

Pour avoir accès au système de parrainage, vous devez :
1️⃣ Avoir une demande de boutique approuvée
2️⃣ Votre boutique doit être active

💡 Tapez /devenir pour faire une demande si ce n'est pas encore fait.`, { parse_mode: 'Markdown' });
    }

    // Générer le lien si pas encore fait
    if (!userShop.referralCode || !userShop.referralLink) {
      const botInfo = await ctx.telegram.getMe();
      userShop.referralCode = userShop.generateReferralCode();
      userShop.referralLink = userShop.generateReferralLink(botInfo.username);
      await userShop.save();
    }

    // Informations détaillées sur les personnes invitées
    const referredUsers = userShop.referredUsers || [];
    const lastInvites = referredUsers.slice(-3); // Les 3 dernières personnes invitées
    
    let inviteDetails = '';
    if (lastInvites.length > 0) {
      inviteDetails = '\n\n📋 **Dernières personnes invitées:**\n';
      lastInvites.forEach((user, index) => {
        const date = new Date(user.invitedAt).toLocaleDateString('fr-FR');
        const username = user.username ? `@${user.username}` : `Utilisateur ${user.telegramId}`;
        inviteDetails += `${index + 1}. ${username} - ${date}\n`;
      });
      
      if (referredUsers.length > 3) {
        inviteDetails += `... et ${referredUsers.length - 3} autre${referredUsers.length - 3 > 1 ? 's' : ''}\n`;
      }
    }

    const message = `🔗 **Votre lien de parrainage**

🏪 **${userShop.name}**
${userShop.isVip ? '👑 **Boutique VIP**' : ''}

📎 \`${userShop.referralLink}\`

📊 **Statistiques complètes:**
👥 Personnes invitées: **${userShop.totalReferred || 0}**
👍 Votes totaux: **${userShop.likes || 0}**
📈 Statut: **${userShop.isActive ? 'Actif ✅' : 'Inactif ❌'}**${inviteDetails}

💡 **Comment ça marche ?**
• Partagez votre lien sur Telegram, réseaux sociaux, etc.
• Quand quelqu'un clique, il arrive directement sur votre boutique
• Vous êtes notifié de chaque nouvelle visite
• Les statistiques se mettent à jour en temps réel !`;

    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📋 Copier le lien',
            url: userShop.referralLink
          }],
          [{
            text: '👁️ Voir ma boutique',
            callback_data: `plug_${userShop._id}`
          }],
          [{
            text: '📊 Stats détaillées',
            callback_data: `referral_stats_${userShop._id}`
          }, {
            text: '🔄 Actualiser',
            callback_data: `refresh_referral_${userShop._id}`
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
