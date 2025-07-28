const mongoose = require('mongoose');

const plugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL de l'image
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  countries: [{
    type: String, // Liste des pays desservis
    trim: true
  }],
  services: {
    delivery: {
      enabled: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        default: ''
      },
      departments: [{
        type: String,
        trim: true
      }]
    },
    postal: {
      enabled: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        default: ''
      }
    },
    meetup: {
      enabled: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        default: ''
      },
      departments: [{
        type: String,
        trim: true
      }]
    }
  },
  telegramLink: {
    type: String, // Lien Telegram optionnel
    default: ''
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
    }
  }],
  isVip: {
    type: Boolean,
    default: false
  },
  vipOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Number, // Telegram user ID
    required: false
  }],
  likeHistory: [{
    userId: {
      type: Number, // Telegram user ID
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['like', 'unlike'],
      required: true
    }
  }],
  // Propriétaire de la boutique
  ownerId: {
    type: Number, // Telegram user ID du propriétaire
    required: false
  },
  
  // Système de parrainage par boutique
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Permet null/undefined
  },
  referralLink: {
    type: String,
    default: ''
  },
  referredUsers: [{
    telegramId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      default: null
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalReferred: {
    type: Number,
    default: 0
  },
  // Traductions automatiques
  translations: {
    name: {
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
      it: { type: String, default: '' },
      es: { type: String, default: '' },
      de: { type: String, default: '' }
    },
    description: {
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
      it: { type: String, default: '' },
      es: { type: String, default: '' },
      de: { type: String, default: '' }
    },
    services: {
      delivery: {
        description: {
          fr: { type: String, default: '' },
          en: { type: String, default: '' },
          it: { type: String, default: '' },
          es: { type: String, default: '' },
          de: { type: String, default: '' }
        }
      },
      postal: {
        description: {
          fr: { type: String, default: '' },
          en: { type: String, default: '' },
          it: { type: String, default: '' },
          es: { type: String, default: '' },
          de: { type: String, default: '' }
        }
      },
      meetup: {
        description: {
          fr: { type: String, default: '' },
          en: { type: String, default: '' },
          it: { type: String, default: '' },
          es: { type: String, default: '' },
          de: { type: String, default: '' }
        }
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour automatique du timestamp
plugSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthodes pour le système de parrainage
plugSchema.methods.generateReferralCode = function() {
  return `ref_${this._id}_${Date.now().toString(36)}`;
};

plugSchema.methods.generateReferralLink = function(botUsername) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  return `https://t.me/${botUsername}?start=${this.referralCode}`;
};

// Index pour optimiser les recherches (referralCode a déjà unique: true)
plugSchema.index({ isVip: 1, vipOrder: 1 });
plugSchema.index({ countries: 1 });
plugSchema.index({ 'services.delivery.enabled': 1 });
plugSchema.index({ 'services.postal.enabled': 1 });
plugSchema.index({ 'services.meetup.enabled': 1 });

module.exports = mongoose.model('Plug', plugSchema);