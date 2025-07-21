const API_BASE_URL = process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JuniorAdmon123';

const restoreNormalConfig = async () => {
  console.log('🔄 Restauration de la configuration normale...\n');

  try {
    const normalConfig = {
      welcome: { 
        text: '🎉 Bienvenue sur notre bot premium !\n\n🔌 Découvrez nos boutiques sélectionnées avec des produits de qualité.\n\n👇 Utilisez les boutons ci-dessous pour naviguer :', 
        image: 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=🏪+Boutique+Premium'
      },
      boutique: {
        name: 'SwissQuality',
        subtitle: 'Votre boutique premium de confiance',
        logo: '',
        vipTitle: 'Boutiques VIP Premium',
        vipSubtitle: 'Sélection exclusive de nos meilleures boutiques',
        searchTitle: 'Rechercher une boutique',
        searchSubtitle: 'Trouvez la boutique parfaite pour vous',
        backgroundImage: ''
      },
      messages: {
        welcome: '🎉 Bienvenue ! Découvrez nos boutiques premium.',
        noPlugsFound: '😅 Aucune boutique trouvée pour cette recherche.',
        error: '❌ Une erreur est survenue, veuillez réessayer.'
      },
      socialMedia: {
        telegram: '',
        whatsapp: '',
        website: ''
      },
      buttons: {
        topPlugs: { text: '🔌 Top Des Plugs' },
        vipPlugs: { text: '👑 Boutiques VIP' },
        contact: { text: '📞 Contact', content: 'Contactez-nous pour toute question ou assistance.' },
        info: { text: 'ℹ️ Info', content: '🏪 SwissQuality - Votre boutique premium de confiance\n\n✨ Nous proposons une sélection rigoureuse de boutiques certifiées.\n\n🛡️ Qualité et sécurité garanties.' }
      },
      filters: {
        all: '📋 Tous les plugs',
        byService: '🔧 Par service',
        byCountry: '🌍 Par pays'
      },
      botTexts: {
        topPlugsTitle: '🔌 Top Des Plugs Certifiés',
        topPlugsDescription: 'Découvrez nos boutiques les mieux notées',
        vipTitle: '👑 Boutiques VIP Premium',
        vipDescription: 'Sélection exclusive de nos meilleures boutiques',
        allPlugsTitle: '📋 Toutes Nos Boutiques',
        filterServiceTitle: '🔧 Filtrer par Service',
        filterServiceDescription: 'Choisissez le type de service souhaité',
        filterCountryTitle: '🌍 Filtrer par Pays',
        filterCountryDescription: 'Sélectionnez votre pays',
        backButtonText: '🔙 Retour',
        deliveryServiceText: '🚚 Livraison',
        postalServiceText: '✈️ Envoi postal',
        meetupServiceText: '🏠 Meetup',
        paginationFormat: '📄 Page {page}/{total}',
        totalCountFormat: '📊 Total: {count} boutiques'
      }
    };

    console.log('📤 Envoi de la configuration normale...');
    const response = await fetch(`${API_BASE_URL}/api/config`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_PASSWORD}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(normalConfig)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Configuration normale restaurée avec succès');
      console.log('📊 Nouvelles données:', Object.keys(result));

      // Recharger le bot
      console.log('\n🔄 Rechargement du bot...');
      const reloadResponse = await fetch(`${API_BASE_URL}/api/bot/reload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`,
          'Content-Type': 'application/json'
        }
      });

      if (reloadResponse.ok) {
        console.log('✅ Bot rechargé avec succès');
      } else {
        console.log('⚠️ Erreur rechargement bot, mais config sauvegardée');
      }

    } else {
      const errorText = await response.text();
      console.log('❌ Erreur restauration:', response.status, errorText);
    }

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('\n🏁 Restauration terminée!');
};

// Exporter pour utilisation
if (require.main === module) {
  restoreNormalConfig().catch(console.error);
}

module.exports = restoreNormalConfig;