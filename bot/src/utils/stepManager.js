// Step Manager - Gère la numérotation dynamique des étapes
const stepOrder = [
  'name',                  // Étape 1
  'telegram',              // Étape 2
  'telegram_channel',      // Étape 2 (suite)
  'snapchat',             // Étape 3
  'potato',               // Étape 4
  'signal',               // Étape 5
  'whatsapp',             // Étape 6
  'threema',              // Étape 7
  'session',              // Étape 8
  'instagram',            // Étape 9
  'telegram_bot',         // Étape 10
  'photo',                // Étape 11
  'working_countries',    // Étape 12
  'service_selection',    // Étape 13
  'departments_delivery', // Étape 14 (si livraison)
  'countries_delivery',   // Étape 14b (si livraison)
  'departments_meetup',   // Étape 15 (si meetup)
  'countries_meetup',     // Étape 15b (si meetup)
  'shipping_service',     // Étape 16 (si envoi postal)
  'departments_shipping', // Étape 16b (si envoi postal)
  'confirmation'          // Dernière étape
];

// Mapping des étapes qui sont groupées ensemble (même numéro)
const stepGroups = {
  'telegram': 2,
  'telegram_channel': 2,
  'departments_delivery': 14,
  'countries_delivery': 14,
  'departments_meetup': 15,
  'countries_meetup': 15,
  'shipping_service': 16,
  'departments_shipping': 16
};

// Obtenir le numéro d'étape dynamique basé sur les étapes complétées
const getDynamicStepNumber = (currentStep, completedSteps = []) => {
  // Si l'étape a un groupe défini, utiliser ce numéro
  if (stepGroups[currentStep]) {
    // Compter combien d'étapes avant ce groupe ont été complétées
    let skippedBefore = 0;
    for (let i = 0; i < stepOrder.indexOf(currentStep); i++) {
      const step = stepOrder[i];
      // Si c'est une étape qui n'est pas dans un groupe et qu'elle a été passée
      if (!stepGroups[step] && completedSteps.includes(step) && completedSteps[completedSteps.indexOf(step)].skipped) {
        skippedBefore++;
      }
    }
    return stepGroups[currentStep] - skippedBefore;
  }

  // Pour les autres étapes, calculer dynamiquement
  let stepNumber = 1;
  let lastGroupNumber = 0;
  
  for (let i = 0; i < stepOrder.length; i++) {
    const step = stepOrder[i];
    
    // Si on a atteint l'étape actuelle
    if (step === currentStep) {
      return stepNumber;
    }
    
    // Si c'est une étape groupée
    if (stepGroups[step]) {
      // Si on n'a pas encore compté ce groupe
      if (stepGroups[step] !== lastGroupNumber) {
        // Vérifier si au moins une étape du groupe est active
        const groupSteps = Object.keys(stepGroups).filter(s => stepGroups[s] === stepGroups[step]);
        const groupIsActive = groupSteps.some(s => !completedSteps.find(cs => cs.step === s)?.skipped);
        
        if (groupIsActive) {
          stepNumber++;
          lastGroupNumber = stepGroups[step];
        }
      }
    } else {
      // Pour les étapes non groupées, incrémenter si elle n'est pas passée
      const stepData = completedSteps.find(cs => cs.step === step);
      if (!stepData || !stepData.skipped) {
        stepNumber++;
      }
    }
  }
  
  return stepNumber;
};

// Obtenir le label d'étape avec numéro dynamique
const getStepLabel = (step, lang = 'fr', completedSteps = []) => {
  const stepNumber = getDynamicStepNumber(step, completedSteps);
  const labels = {
    'name': {
      fr: `🟦 Étape ${stepNumber} : Nom de Plug`,
      en: `🟦 Step ${stepNumber}: Plug Name`
    },
    'telegram': {
      fr: `🟦 Étape ${stepNumber} : CONTACT TELEGRAM`,
      en: `🟦 Step ${stepNumber}: TELEGRAM CONTACT`
    },
    'telegram_channel': {
      fr: `🟦 Étape ${stepNumber} : CONTACT TELEGRAM - Canal`,
      en: `🟦 Step ${stepNumber}: TELEGRAM CONTACT - Channel`
    },
    'snapchat': {
      fr: `🟦 Étape ${stepNumber} : Snapchat`,
      en: `🟦 Step ${stepNumber}: Snapchat`
    },
    'potato': {
      fr: `🟦 Étape ${stepNumber} : Potato Chat 🏴‍☠️`,
      en: `🟦 Step ${stepNumber}: Potato Chat 🏴‍☠️`
    },
    'signal': {
      fr: `🟦 Étape ${stepNumber} : Signal`,
      en: `🟦 Step ${stepNumber}: Signal`
    },
    'whatsapp': {
      fr: `🟦 Étape ${stepNumber} : WhatsApp`,
      en: `🟦 Step ${stepNumber}: WhatsApp`
    },
    'threema': {
      fr: `🟦 Étape ${stepNumber} : Threema`,
      en: `🟦 Step ${stepNumber}: Threema`
    },
    'session': {
      fr: `🟦 Étape ${stepNumber} : Session`,
      en: `🟦 Step ${stepNumber}: Session`
    },
    'instagram': {
      fr: `🟦 Étape ${stepNumber} : Instagram`,
      en: `🟦 Step ${stepNumber}: Instagram`
    },
    'telegram_bot': {
      fr: `🟦 Étape ${stepNumber} : Bot Telegram`,
      en: `🟦 Step ${stepNumber}: Telegram Bot`
    },
    'photo': {
      fr: `🟦 Étape ${stepNumber} : Logo de boutique`,
      en: `🟦 Step ${stepNumber}: Shop logo`
    },
    'working_countries': {
      fr: `🟦 Étape ${stepNumber} : Pays de travail`,
      en: `🟦 Step ${stepNumber}: Working countries`
    },
    'service_selection': {
      fr: `🟦 Étape ${stepNumber} : Services`,
      en: `🟦 Step ${stepNumber}: Services`
    },
    'departments_delivery': {
      fr: `🟦 Étape ${stepNumber} : Départements Livraison`,
      en: `🟦 Step ${stepNumber}: Delivery Departments`
    },
    'countries_delivery': {
      fr: `🟦 Étape ${stepNumber}b : Pays de Livraison`,
      en: `🟦 Step ${stepNumber}b: Delivery Countries`
    },
    'departments_meetup': {
      fr: `🟦 Étape ${stepNumber} : Départements Meetup`,
      en: `🟦 Step ${stepNumber}: Meetup Departments`
    },
    'countries_meetup': {
      fr: `🟦 Étape ${stepNumber}b : Pays de Meetup`,
      en: `🟦 Step ${stepNumber}b: Meetup Countries`
    },
    'shipping_service': {
      fr: `🟦 Étape ${stepNumber} : Service Envoi Postal`,
      en: `🟦 Step ${stepNumber}: Postal Shipping Service`
    },
    'departments_shipping': {
      fr: `🟦 Étape ${stepNumber}b : Départements Envoi`,
      en: `🟦 Step ${stepNumber}b: Shipping Departments`
    },
    'confirmation': {
      fr: `🟦 Étape ${stepNumber} : Confirmation`,
      en: `🟦 Step ${stepNumber}: Confirmation`
    }
  };
  
  return labels[step]?.[lang] || `🟦 Étape ${stepNumber}`;
};

// Tracker pour suivre les étapes complétées/passées
class StepTracker {
  constructor() {
    this.userSteps = new Map(); // userId -> array of {step, skipped, timestamp}
  }
  
  addStep(userId, step, skipped = false) {
    if (!this.userSteps.has(userId)) {
      this.userSteps.set(userId, []);
    }
    
    const steps = this.userSteps.get(userId);
    // Éviter les doublons
    const existing = steps.find(s => s.step === step);
    if (!existing) {
      steps.push({
        step,
        skipped,
        timestamp: new Date()
      });
    }
  }
  
  getCompletedSteps(userId) {
    return this.userSteps.get(userId) || [];
  }
  
  clearUserSteps(userId) {
    this.userSteps.delete(userId);
  }
}

const stepTracker = new StepTracker();

module.exports = {
  stepOrder,
  getDynamicStepNumber,
  getStepLabel,
  stepTracker
};