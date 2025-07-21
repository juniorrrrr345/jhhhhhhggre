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
      default: 'Message d\'accueil personnalisé à configurer dans le panel admin.'
    },
    socialMedia: [{
      name: {
        type: String,
        required: true
      },
      emoji: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }]
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
  
  // Configuration de la boutique Vercel
  boutique: {
    name: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    backgroundImage: {
      type: String,
      default: ''
    },
    vipTitle: {
      type: String,
      default: ''
    },
    vipSubtitle: {
      type: String,
      default: ''
    },
    searchTitle: {
      type: String,
      default: ''
    },
    searchSubtitle: {
      type: String,
      default: ''
    }
  },

  // Configuration de l'interface
  interface: {
    title: {
      type: String,
      default: 'PLUGS FINDER'
    },
    tagline1: {
      type: String,
      default: 'JUSTE UNE'
    },
    taglineHighlight: {
      type: String,
      default: 'MINI-APP TELEGRAM'
    },
    tagline2: {
      type: String,
      default: 'CHILL'
    },
    backgroundImage: {
      type: String,
      default: ''
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