const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  // Configuration unique
  _id: {
    type: String,
    default: 'main'
  },
  
  // Page d'accueil
  welcome: {
    image: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: '🌟 Bienvenue sur notre plateforme !\n\nDécouvrez nos meilleurs plugs et services.'
    }
  },
  
  // Boutons principaux
  buttons: {
    topPlugs: {
      text: {
        type: String,
        default: '🔌 Top Des Plugs'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    contact: {
      text: {
        type: String,
        default: '📞 Contact'
      },
      content: {
        type: String,
        default: 'Contactez-nous pour plus d\'informations.'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    info: {
      text: {
        type: String,
        default: 'ℹ️ Info'
      },
      content: {
        type: String,
        default: 'Informations sur notre plateforme.'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Réseaux sociaux globaux
  socialMedia: {
    telegram: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    }
  },
  
  // Configuration VIP
  vip: {
    enabled: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '🌟 SECTION VIP'
    },
    description: {
      type: String,
      default: 'Nos plugs premium sélectionnés pour vous'
    },
    position: {
      type: String,
      enum: ['top', 'bottom'],
      default: 'top'
    }
  },
  
  // Textes des filtres
  filters: {
    byService: {
      type: String,
      default: '🔍 Filtrer par service'
    },
    byCountry: {
      type: String,
      default: '🌍 Filtrer par pays'
    },
    all: {
      type: String,
      default: '📋 Tous les plugs'
    }
  },
  
  // Messages système
  messages: {
    noPlugsFound: {
      type: String,
      default: '😅 Aucun plug trouvé pour ces critères.'
    },
    errorOccurred: {
      type: String,
      default: '❌ Une erreur est survenue, veuillez réessayer.'
    }
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour automatique du timestamp
configSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Config', configSchema);