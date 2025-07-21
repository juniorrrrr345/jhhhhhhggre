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
      }
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
      }
    }
  },
  telegramLink: {
    type: String, // Pour compatibilité avec l'admin panel
    default: ''
  },
  socialMedia: {
    type: mongoose.Schema.Types.Mixed, // Permet objet ou array
    default: {
      telegram: '',
      instagram: '',
      whatsapp: '',
      website: ''
    }
  },
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

// Index pour optimiser les recherches
plugSchema.index({ isVip: 1, vipOrder: 1 });
plugSchema.index({ countries: 1 });
plugSchema.index({ 'services.delivery.enabled': 1 });
plugSchema.index({ 'services.postal.enabled': 1 });
plugSchema.index({ 'services.meetup.enabled': 1 });

module.exports = mongoose.model('Plug', plugSchema);