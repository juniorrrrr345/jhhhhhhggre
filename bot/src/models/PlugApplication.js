const mongoose = require('mongoose');

const plugApplicationSchema = new mongoose.Schema({
  // Informations du demandeur
  userId: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  
  // Informations du plug
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    country: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Services proposés
  services: {
    delivery: {
      enabled: {
        type: Boolean,
        default: false
      }
    },
    postal: {
      enabled: {
        type: Boolean,
        default: false
      }
    },
    meetup: {
      enabled: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Contact
  contact: {
    telegram: {
      type: String,
      required: true,
      trim: true
    },
    other: {
      type: String,
      default: '',
      trim: true
    }
  },
  
  // Photo optionnelle
  photo: {
    type: String,
    default: ''
  },
  
  // URL de la photo pour l'admin panel
  photoUrl: {
    type: String,
    default: null
  },
  
  // Statut de la demande
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Notes de l'admin
  adminNotes: {
    type: String,
    default: ''
  },
  
  // Dates
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: String // ID de l'admin qui a traité la demande
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
plugApplicationSchema.index({ userId: 1 });
plugApplicationSchema.index({ status: 1 });
plugApplicationSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('PlugApplication', plugApplicationSchema);