const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    trim: true,
    default: null
  },
  firstName: {
    type: String,
    trim: true,
    default: null
  },
  lastName: {
    type: String,
    trim: true,
    default: null
  },
  // Système de parrainage
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId, // ID de la boutique qui a parrainé
    ref: 'Plug',
    default: null
  },
  invitedAt: {
    type: Date,
    default: null
  },
  // Boutique associée au parrain (redirection automatique)
  associatedShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    default: null
  },
  // Parrainage actif
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Permet null/undefined
  },
  referredUsers: [{
    telegramId: {
      type: Number,
      required: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Statistiques
  totalReferred: {
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
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les recherches (telegramId et referralCode ont déjà unique: true)
userSchema.index({ invitedBy: 1 });

// Méthode pour générer un code de parrainage unique
userSchema.methods.generateReferralCode = function() {
  return `ref_${this.telegramId}_${Date.now().toString(36)}`;
};

// Méthode pour obtenir le lien de parrainage
userSchema.methods.getReferralLink = function(botUsername) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  return `https://t.me/${botUsername}?start=${this.referralCode}`;
};

module.exports = mongoose.model('User', userSchema);
