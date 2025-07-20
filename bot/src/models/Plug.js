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