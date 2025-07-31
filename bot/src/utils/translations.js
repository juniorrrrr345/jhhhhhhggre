const translations = {
  // Configuration des langues
  languages: {
    fr: { name: 'Français', flag: '🇫🇷', code: 'fr' },
    en: { name: 'English', flag: '🇬🇧', code: 'en' },
    it: { name: 'Italiano', flag: '🇮🇹', code: 'it' },
    es: { name: 'Español', flag: '🇪🇸', code: 'es' },
    de: { name: 'Deutsch', flag: '🇩🇪', code: 'de' }
  },

  // Traductions par défaut
  defaultTranslations: {
    // === MENU PRINCIPAL ===
    'menu_topPlugs': {
      fr: 'VOTER POUR VOTRE PLUG 🗳️',
      en: 'VOTE FOR YOUR PLUG 🗳️',
      it: 'VOTA PER IL TUO PLUG 🗳️',
      es: 'VOTA POR TU PLUG 🗳️',
      de: 'STIMME FÜR DEINEN PLUG 🗳️'
    },
    'menu_contact': {
      fr: '📞 Contact',
      en: '📞 Contact',
      it: '📞 Contatto',
      es: '📞 Contacto',
      de: '📞 Kontakt'
    },
    'menu_info': {
      fr: 'ℹ️ Info',
      en: 'ℹ️ Info',
      it: 'ℹ️ Informazioni',
      es: 'ℹ️ Información',
      de: 'ℹ️ Information'
    },
    'menu_inscription': {
      fr: '📋 Inscription',
      en: '📋 Registration',
      it: '📋 Registrazione',
      es: '📋 Inscripción',
      de: '📋 Anmeldung'
    },
    'menu_changeLanguage': {
      fr: '🗣️ Changer de langue',
      en: '🗣️ Change language',
      it: '🗣️ Cambia lingua',
      es: '🗣️ Cambiar idioma',
      de: '🗣️ Sprache ändern'
    },
    'menu_refresh': {
      fr: '🔄 Actualiser',
      en: '🔄 Refresh',
      it: '🔄 Aggiorna',
      es: '🔄 Actualizar',
      de: '🔄 Aktualisieren'
    },
    'back_to_shops': {
      fr: '🔙 Retour aux boutiques',
      en: '🔙 Back to shops',
      it: '🔙 Torna ai negozi',
      es: '🔙 Volver a las tiendas',
      de: '🔙 Zurück zu den Geschäften'
    },
    'back_to_filters': {
      fr: '🔙 Retour aux boutiques',
      en: '🔙 Back to shops',
      it: '🔙 Torna ai negozi',
      es: '🔙 Volver a las tiendas',
      de: '🔙 Zurück zu den Geschäften'
    },
    'back_to_shops': {
      fr: 'Retour aux boutiques',
      en: 'Back to shops',
      it: 'Torna ai negozi',
      es: 'Volver a las tiendas',
      de: 'Zurück zu den Geschäften'
    },
    'menu_selectLanguage': {
      fr: 'Sélectionnez votre langue préférée :',
      en: 'Select your preferred language:',
      it: 'Seleziona la tua lingua preferita:',
      es: 'Selecciona tu idioma preferido:',
      de: 'Wählen Sie Ihre bevorzugte Sprache:'
    },
    'messages_topPlugsHelp': {
      fr: 'Comment ça marche ?',
      en: 'How does it work?',
      it: 'Come funziona?',
      es: '¿Cómo funciona?',
      de: 'Wie funktioniert es?'
    },
    'messages_selectCountry': {
      fr: 'Choisissez un pays 🌍',
      en: 'Choose a country 🌍',
      it: 'Scegli un paese 🌍',
      es: 'Elige un país 🌍',
      de: 'Wählen Sie ein Land 🌍'
    },
    'messages_selectService': {
      fr: 'Sélectionnez un service (Livraison, Meetup, Envoi)',
      en: 'Select a service (Delivery, Meetup, Shipping)',
      it: 'Seleziona un servizio (Consegna, Meetup, Spedizione)',
      es: 'Selecciona un servicio (Entrega, Meetup, Envío)',
      de: 'Wählen Sie einen Service (Lieferung, Meetup, Versand)'
    },
    'messages_selectPostalCode': {
      fr: 'Cliquez sur "Département" pour voir les codes postaux',
      en: 'Click "Department" to see postal codes',
      it: 'Clicca "Dipartimento" per vedere i codici postali',
      es: 'Haz clic en "Departamento" para ver códigos postales',
      de: 'Klicken Sie "Abteilung" für Postleitzahlen'
    },
    'messages_findShops': {
      fr: 'Trouvez les boutiques dans votre zone !',
      en: 'Find shops in your area!',
      it: 'Trova negozi nella tua zona!',
      es: '¡Encuentra tiendas en tu zona!',
      de: 'Finden Sie Geschäfte in Ihrer Nähe!'
    },
    'messages_noPlugsInPostalCode': {
      fr: 'Désolé Nous Avons Pas De Plugs 😕',
      en: 'Sorry We Have No Plugs 😕',
      it: 'Spiacenti Non Abbiamo Negozi 😕',
      es: 'Lo Siento No Tenemos Tiendas 😕',
      de: 'Entschuldigung Keine Shops 😕'
    },
    'contact_default_text': {
      fr: 'Contactez-nous pour plus d\'informations.\n@findyourplugsav',
      en: 'Contact us for more information.\n@findyourplugsav',
      it: 'Contattaci per maggiori informazioni.\n@findyourplugsav',
      es: 'Contáctanos para más información.\n@findyourplugsav',
      de: 'Kontaktieren Sie uns für weitere Informationen.\n@findyourplugsav'
    },
    'contact_us_text': {
      fr: 'Nous contacter',
      en: 'Contact us',
      it: 'Contattaci',
      es: 'Contáctanos',
      de: 'Kontakt'
    },
    'info_default_text': {
      fr: 'Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @findyourplugsav 📲',
      en: 'We list plugs worldwide by Country / City discover our mini-app 🌍🔌\n\nFor any specific request contact us @findyourplugsav 📲',
      it: 'Elenchiamo i plug di tutto il mondo per Paese / Città scopri la nostra mini-app 🌍🔌\n\nPer qualsiasi richiesta specifica contattaci @findyourplugsav 📲',
      es: 'Listamos plugs de todo el mundo por País / Ciudad descubre nuestra mini-app 🌍🔌\n\nPara cualquier solicitud específica contáctanos @findyourplugsav 📲',
      de: 'Wir listen Plugs weltweit nach Land / Stadt auf, entdecken Sie unsere Mini-App 🌍🔌\n\nFür spezielle Anfragen kontaktieren Sie uns @findyourplugsav 📲'
    },
    'menu_becomeDealer': {
      fr: '📋 Inscription',
      en: '📋 Inscription',
      it: '📋 Inscription',
      es: '📋 Inscription',
      de: '📋 Inscription'
    },
    'menu_language': {
      fr: '🌍 Langue',
      en: '🌍 Language',
      it: '🌍 Lingua',
      es: '🌍 Idioma',
      de: '🌍 Sprache'
    },
    'menu_translation': {
      fr: '🗣️ Change language',
      en: '🗣️ Change language',
      it: '🗣️ Change language',
      es: '🗣️ Change language',
      de: '🗣️ Change language'
    },
    'menu_main': {
      fr: '🏠 Menu principal',
      en: '🏠 Main menu',
      it: '🏠 Menu principale',
      es: '🏠 Menú principal',
      de: '🏠 Hauptmenü'
    },
    'menu_delivery': {
      fr: '🚚 Livraison',
      en: '🚚 Delivery',
      it: '🚚 Consegna',
      es: '🚚 Entrega',
      de: '🚚 Lieferung'
    },

    // === FILTRES TOP PLUGS ===
    'filters_delivery': {
      fr: '📦 Livraison',
      en: '📦 Delivery',
      it: '📦 Consegna',
      es: '📦 Entrega',
      de: '📦 Lieferung'
    },
    'filters_meetup': {
      fr: '🤝 Meetup',
      en: '🤝 Meetup',
      it: '🤝 Incontro',
      es: '🤝 Encuentro',
      de: '🤝 Treffen'
    },
    'filters_postal': {
      fr: '📬 Envoi Postal',
      en: '📬 Postal Shipping',
      it: '📬 Spedizione Postale',
      es: '📬 Envío Postal',
      de: '📬 Postversand'
    },
    'filters_department': {
      fr: '📍 Département 🔁',
      en: '📍 State/Region 🔁',
      it: '📍 Regione 🔁',
      es: '📍 Provincia 🔁',
      de: '📍 Bundesland 🔁'
    },
    'filters_reset': {
      fr: '🔁 Réinitialiser les filtres',
      en: '🔁 Reset Filters',
      it: '🔁 Reimposta Filtri',
      es: '🔁 Reiniciar Filtros',
      de: '🔁 Filter zurücksetzen'
    },
    'filters_back': {
      fr: '🔙 Retour',
      en: '🔙 Back',
      it: '🔙 Indietro',
      es: '🔙 Volver',
      de: '🔙 Zurück'
    },

    // === MESSAGES ===
    'messages_welcome': {
      fr: 'Bienvenue sur FindYourPlug! Explorez nos services.',
      en: 'Welcome to FindYourPlug! Explore our services.',
      it: 'Benvenuto su FindYourPlug! Esplora i nostri servizi.',
      es: 'Bienvenido a FindYourPlug! Explora nuestros servicios.',
      de: 'Willkommen bei FindYourPlug! Entdecken Sie unsere Services.'
    },
    'messages_contactUs': {
      fr: 'Contactez-nous pour plus d\'informations.',
      en: 'Contact us for more information.',
      it: 'Contattaci per maggiori informazioni.',
      es: 'Contáctanos para más información.',
      de: 'Kontaktieren Sie uns für weitere Informationen.'
    },
    'messages_contactSocial': {
      fr: '📱 Nous contacter :',
      en: '📱 Contact us:',
      it: '📱 Contattaci:',
      es: '📱 Contáctanos:',
      de: '📱 Kontaktiere uns:'
    },
    'messages_noPlugs': {
      fr: '❌ Aucun plug disponible pour le moment.',
      en: '❌ No plugs available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Keine Shops verfügbar im Moment.'
    },
    'messages_shopsAvailable': {
      fr: 'boutiques disponibles',
      en: 'shops available',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'Shops verfügbar'
    },
    'messages_activeUsers': {
      fr: 'utilisateurs actifs',
      en: 'active users',
      it: 'utenti attivi',
      es: 'usuarios activos',
      de: 'aktive Benutzer'
    },
    'messages_availableShops': {
      fr: 'boutiques disponibles',
      en: 'available shops',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'verfügbare Shops'
    },
    'messages_refreshedAt': {
      fr: 'Actualisé à',
      en: 'Updated at',
      it: 'Aggiornato alle',
      es: 'Actualizado a las',
      de: 'Aktualisiert um'
    },
    'messages_sortedByVotes': {
      fr: 'Triés par nombre de votes',
      en: 'Sorted by number of votes',
      it: 'Ordinati per numero di voti',
      es: 'Ordenados por número de votos',
      de: 'Sortiert nach Anzahl der Stimmen'
    },
    'messages_noShops': {
      fr: '❌ Aucun plug disponible pour le moment.',
      en: '❌ No plugs available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Momentan sind keine Shops verfügbar.'
    },

    // === INSCRIPTION ===
    'registration.title': {
      fr: '🛠️ FORMULAIRE D\'INSCRIPTION – FindYourPlug',
      en: '🛠️ REGISTRATION FORM – FindYourPlug',
      it: '🛠️ MODULO DI REGISTRAZIONE – FindYourPlug',
      es: '🛠️ FORMULARIO DE REGISTRO – FindYourPlug',
      de: '🛠️ ANMELDEFORMULAR – FindYourPlug'
    },
    'registration.step1': {
      fr: '🟦 Étape 1 : Nom de Plug',
      en: '🟦 Step 1: Plug Name',
      it: '🟦 Fase 1: Nome Negozio',
      es: '🟦 Paso 1: Nombre de Tienda',
      de: '🟦 Schritt 1: Shop-Name'
    },
    'registration.letsStart': {
      fr: '📝 Commençons ton inscription sur FindYourPlug !',
      en: '📝 Let\'s start your registration on FindYourPlug!',
      it: '📝 Iniziamo la tua registrazione su FindYourPlug!',
      es: '📝 ¡Comencemos tu registro en FindYourPlug!',
      de: '📝 Beginnen wir deine Anmeldung bei FindYourPlug!'
    },
    'registration.plugNameQuestion': {
      fr: 'Quel est ton **nom de Plug** ?',
      en: 'What is your **Plug name**?',
      it: 'Qual è il tuo **nome del negozio**?',
      es: '¿Cuál es tu **nombre de tienda**?',
      de: 'Wie lautet dein **Shop-Name**?'
    },
    'registration.nameQuestion': {
      fr: 'Quel est ton nom de Plug ?',
      en: 'What is your Plug name?',
      it: 'Qual è il tuo nome del negozio?',
      es: '¿Cuál es tu nombre de tienda?',
      de: 'Wie lautet dein Shop-Name?'
    },
    'registration.pendingTitle': {
      fr: '📝 **Demande en cours**',
      en: '📝 **Application in progress**',
      it: '📝 **Richiesta in corso**',
      es: '📝 **Solicitud en curso**',
      de: '📝 **Antrag in Bearbeitung**'
    },
    'registration.pendingMessage': {
      fr: 'Tu as déjà une demande d\'inscription en cours de traitement.',
      en: 'You already have a registration request being processed.',
      it: 'Hai già una richiesta di registrazione in elaborazione.',
      es: 'Ya tienes una solicitud de registro en proceso.',
      de: 'Du hast bereits eine Registrierungsanfrage in Bearbeitung.'
    },
    'registration.pendingStatus': {
      fr: 'Statut: ⏳ En attente',
      en: 'Status: ⏳ Pending',
      it: 'Stato: ⏳ In attesa',
      es: 'Estado: ⏳ Pendiente',
      de: 'Status: ⏳ Ausstehend'
    },
    'registration.pendingWait': {
      fr: 'Merci de patienter pendant que nos équipes examinent ta demande !',
      en: 'Please wait while our teams review your request!',
      it: 'Attendi mentre i nostri team esaminano la tua richiesta!',
      es: '¡Por favor espera mientras nuestros equipos revisan tu solicitud!',
      de: 'Bitte warte, während unsere Teams deine Anfrage prüfen!'
    },
    'registration.cancel': {
      fr: '❌ Annuler',
      en: '❌ Cancel',
      it: '❌ Annulla',
      es: '❌ Cancelar',
      de: '❌ Abbrechen'
    },
    'registration.backToMenu': {
      fr: '🔙 Retour au menu',
      en: '🔙 Back to menu',
      it: '🔙 Torna al menu',
      es: '🔙 Volver al menú',
      de: '🔙 Zurück zum Menü'
    },
    'registration.goBack': {
      fr: '⬅️ Retour',
      en: '⬅️ Go back',
      it: '⬅️ Indietro',
      es: '⬅️ Volver',
      de: '⬅️ Zurück'
    },
    'registration.finalSummaryTitle': {
      fr: '📋 RÉCAPITULATIF FINAL',
      en: '📋 FINAL SUMMARY',
      it: '📋 RIEPILOGO FINALE',
      es: '📋 RESUMEN FINAL',
      de: '📋 ABSCHLUSSZUSAMMENFASSUNG'
    },
    'registration.photoReceived': {
      fr: '✅ Logo de boutique reçu !',
      en: '✅ Shop logo received!',
      it: '✅ Logo del negozio ricevuto!',
      es: '✅ Logo de la tienda recibido!',
      de: '✅ Shop-Logo erhalten!'
    },
    'registration.error.photoProcessing': {
      fr: '❌ Erreur lors du traitement de la photo. Réessaie.',
      en: '❌ Error processing photo. Try again.',
      it: '❌ Errore nell\'elaborazione della foto. Riprova.',
      es: '❌ Error al procesar la foto. Inténtalo de nuevo.',
      de: '❌ Fehler bei der Fotobearbeitung. Versuchen Sie es erneut.'
    },
    'registration.error.invalidPhoto': {
      fr: '❌ Merci d\'envoyer une photo valide.',
      en: '❌ Please send a valid photo.',
      it: '❌ Si prega di inviare una foto valida.',
      es: '❌ Por favor envía una foto válida.',
      de: '❌ Bitte senden Sie ein gültiges Foto.'
    },

    // === FORMULAIRE ÉTAPES DÉTAILLÉES ===
    'registration.step2': {
      fr: '🟦 Étape 2 : CONTACT TELEGRAM',
      en: '🟦 Step 2: TELEGRAM CONTACT',
      it: '🟦 Fase 2: CONTATTO TELEGRAM',
      es: '🟦 Paso 2: CONTACTO TELEGRAM',
      de: '🟦 Schritt 2: TELEGRAM KONTAKT'
    },
    'registration.step2Channel': {
      fr: '🟦 Étape 2 : CONTACT TELEGRAM - Canal',
      en: '🟦 Step 2: TELEGRAM CONTACT - Channel',
      it: '🟦 Fase 2: CONTATTO TELEGRAM - Canale',
      es: '🟦 Paso 2: CONTACTO TELEGRAM - Canal',
      de: '🟦 Schritt 2: TELEGRAM KONTAKT - Kanal'
    },
    'registration.step3': {
      fr: '🟦 Étape 3 : Snapchat',
      en: '🟦 Step 3: Snapchat',
      it: '🟦 Fase 3: Snapchat',
      es: '🟦 Paso 3: Snapchat',
      de: '🟦 Schritt 3: Snapchat'
    },
    'registration.step4': {
      fr: '🟦 Étape 4 : Potato Chat 🏴‍☠️',
      en: '🟦 Step 4: Potato Chat 🏴‍☠️',
      it: '🟦 Fase 4: Potato Chat 🏴‍☠️',
      es: '🟦 Paso 4: Potato Chat 🏴‍☠️',
      de: '🟦 Schritt 4: Potato Chat 🏴‍☠️'
    },
    'registration.telegramQuestion': {
      fr: '🔗 Entrez votre lien Telegram (format : @username ou https://t.me/username)',
      en: '🔗 Enter your Telegram link (format: @username or https://t.me/username)',
      it: '🔗 Inserisci il tuo link Telegram (formato: @username o https://t.me/username)',
      es: '🔗 Introduce tu enlace de Telegram (formato: @username o https://t.me/username)',
      de: '🔗 Geben Sie Ihren Telegram-Link ein (Format: @username oder https://t.me/username)'
    },
    'registration.telegramChannelQuestion': {
      fr: '🔗 Entrez le lien de votre canal Telegram (format : @channel ou https://t.me/channel)',
      en: '🔗 Enter your Telegram channel link (format: @channel or https://t.me/channel)',
      it: '🔗 Inserisci il link del tuo canale Telegram (formato: @channel o https://t.me/channel)',
      es: '🔗 Introduce el enlace de tu canal de Telegram (formato: @channel o https://t.me/channel)',
      de: '🔗 Geben Sie den Link zu Ihrem Telegram-Kanal ein (Format: @channel oder https://t.me/channel)'
    },
    'channel': {
      fr: 'Canal',
      en: 'Channel',
      it: 'Canale',
      es: 'Canal',
      de: 'Kanal'
    },
    'registration.instagramQuestion': {
      fr: '📸 Entrez votre lien Instagram',
      en: '📸 Enter your Instagram link',
      it: '📸 Inserisci il tuo link Instagram',
      es: '📸 Introduce tu enlace de Instagram',
      de: '📸 Geben Sie Ihren Instagram-Link ein'
    },
    'registration.skipStep': {
      fr: '⏭️ Passer cette étape',
      en: '⏭️ Skip this step',
      it: '⏭️ Salta questo passaggio',
      es: '⏭️ Saltar este paso',
      de: '⏭️ Diesen Schritt überspringen'
    },
    'registration.canSkip': {
      fr: '⚠️ Tu peux aussi passer cette étape.',
      en: '⚠️ You can also skip this step.',
      it: '⚠️ Puoi anche saltare questo passaggio.',
      es: '⚠️ También puedes saltar este paso.',
      de: '⚠️ Sie können diesen Schritt auch überspringen.'
    },
    'registration.additionalNetworks': {
      fr: '🟦 Étapes Réseaux supplémentaires :',
      en: '🟦 Additional Networks Steps:',
      it: '🟦 Passaggi Reti Aggiuntive:',
      es: '🟦 Pasos de Redes Adicionales:',
      de: '🟦 Zusätzliche Netzwerk-Schritte:'
    },
    'registration.platforms': {
      fr: 'Plateformes :',
      en: 'Platforms:',
      it: 'Piattaforme:',
      es: 'Plataformas:',
      de: 'Plattformen:'
    },

    // === ERREURS DE VALIDATION ===
    'registration.error.nameLength': {
      fr: '❌ Le nom doit faire au moins 2 caractères. Réessaie :',
      en: '❌ Name must be at least 2 characters. Try again:',
      it: '❌ Il nome deve essere di almeno 2 caratteri. Riprova:',
      es: '❌ El nombre debe tener al menos 2 caracteres. Inténtalo de nuevo:',
      de: '❌ Name muss mindestens 2 Zeichen haben. Versuchen Sie es erneut:'
    },
    'registration.error.telegramFormat': {
      fr: '❌ Merci de fournir un username Telegram (ex: @tonusername) ou un lien Telegram. Réessaie :',
      en: '❌ Please provide a Telegram username (ex: @yourusername) or Telegram link. Try again:',
      it: '❌ Fornisci un username Telegram (es: @tuousername) o un link Telegram. Riprova:',
      es: '❌ Proporciona un nombre de usuario de Telegram (ej: @tuusuario) o un enlace de Telegram. Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen Telegram-Benutzernamen (z.B.: @ihrname) oder einen Telegram-Link an. Versuchen Sie es erneut:'
    },
    'registration.error.telegramChannelFormat': {
      fr: '❌ Merci de fournir un lien de canal Telegram valide (ex: https://t.me/username). Réessaie :',
      en: '❌ Please provide a valid Telegram channel link (ex: https://t.me/username). Try again:',
      it: '❌ Fornisci un link di canale Telegram valido (es: https://t.me/username). Riprova:',
      es: '❌ Proporciona un enlace de canal de Telegram válido (ej: https://t.me/username). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Telegram-Kanal-Link an (z.B.: https://t.me/username). Versuchen Sie es erneut:'
    },
    'registration.error.instagramFormat': {
      fr: '❌ Merci de fournir un lien Instagram valide (ex: https://www.instagram.com/username ou @username). Réessaie :',
      en: '❌ Please provide a valid Instagram link (ex: https://www.instagram.com/username or @username). Try again:',
      it: '❌ Fornisci un link Instagram valido (es: https://www.instagram.com/username o @username). Riprova:',
      es: '❌ Proporciona un enlace de Instagram válido (ej: https://www.instagram.com/username o @username). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Instagram-Link an (z.B.: https://www.instagram.com/username oder @username). Versuchen Sie es erneut:'
    },
    'registration.error.urlFormat': {
      fr: '❌ Merci de fournir un lien valide commençant par https://. Réessaie :',
      en: '❌ Please provide a valid link starting with https://. Try again:',
      it: '❌ Fornisci un link valido che inizia con https://. Riprova:',
      es: '❌ Proporciona un enlace válido que comience con https://. Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Link an, der mit https:// beginnt. Versuchen Sie es erneut:'
    },
    'registration.error.telegramBotFormat': {
      fr: '❌ Merci de fournir un bot Telegram valide (@username ou t.me/botname). Réessaie :',
      en: '❌ Please provide a valid Telegram bot (@username or t.me/botname). Try again:',
      it: '❌ Fornisci un bot Telegram valido (@username o t.me/botname). Riprova:',
      es: '❌ Proporciona un bot de Telegram válido (@username o t.me/botname). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Telegram-Bot an (@username oder t.me/botname). Versuchen Sie es erneut:'
    },
    'registration.error.general': {
      fr: '❌ Une erreur est survenue. Réessaie ou tape /start pour recommencer.',
      en: '❌ An error occurred. Try again or type /start to restart.',
      it: '❌ Si è verificato un errore. Riprova o digita /start per ricominciare.',
      es: '❌ Ocurrió un error. Inténtalo de nuevo o escribe /start para reiniciar.',
      de: '❌ Ein Fehler ist aufgetreten. Versuchen Sie es erneut oder geben Sie /start ein, um neu zu beginnen.'
    },

    // === MESSAGES D'ANNULATION ===
    'registration.cancelTitle': {
      fr: '❌ Demande annulée',
      en: '❌ Request cancelled',
      it: '❌ Richiesta annullata',
      es: '❌ Solicitud cancelada',
      de: '❌ Anfrage abgebrochen'
    },
    'registration.cancelMessage': {
      fr: 'Ta demande d\'inscription a été annulée.',
      en: 'Your registration request has been cancelled.',
      it: 'La tua richiesta di registrazione è stata annullata.',
      es: 'Tu solicitud de registro ha sido cancelada.',
      de: 'Ihre Registrierungsanfrage wurde abgebrochen.'
    },
    'registration.canRestart': {
      fr: 'Tu peux recommencer quand tu veux !',
      en: 'You can restart whenever you want!',
      it: 'Puoi ricominciare quando vuoi!',
      es: '¡Puedes reiniciar cuando quieras!',
      de: 'Sie können jederzeit neu beginnen!'
    },
    'registration.cancelledShort': {
      fr: 'Demande annulée',
      en: 'Request cancelled',
      it: 'Richiesta annullata',
      es: 'Solicitud cancelada',
      de: 'Anfrage abgebrochen'
    },

    // === ÉTAPES RÉSEAUX SOCIAUX COMPLETS ===
    'registration.step5': {
      fr: '🟦 Étape 5 : Signal',
      en: '🟦 Step 5: Signal',
      it: '🟦 Fase 5: Signal',
      es: '🟦 Paso 5: Signal',
      de: '🟦 Schritt 5: Signal'
    },
    'registration.step6': {
      fr: '🟦 Étape 6 : WhatsApp',
      en: '🟦 Step 6: WhatsApp',
      it: '🟦 Fase 6: WhatsApp',
      es: '🟦 Paso 6: WhatsApp',
      de: '🟦 Schritt 6: WhatsApp'
    },
    'registration.step7': {
      fr: '🟦 Étape 7 : Threema',
      en: '🟦 Step 7: Threema',
      it: '🟦 Fase 7: Threema',
      es: '🟦 Paso 7: Threema',
      de: '🟦 Schritt 7: Threema'
    },
    'registration.step8': {
      fr: '🟦 Étape 8 : Session',
      en: '🟦 Step 8: Session',
      it: '🟦 Fase 8: Session',
      es: '🟦 Paso 8: Session',
      de: '🟦 Schritt 8: Session'
    },
    'registration.step9': {
      fr: '🟦 Étape 9 : Instagram',
      en: '🟦 Step 9: Instagram',
      it: '🟦 Fase 9: Instagram',
      es: '🟦 Paso 9: Instagram',
      de: '🟦 Schritt 9: Instagram'
    },
    'registration.step10': {
      fr: '🟦 Étape 10 : Bot Telegram',
      en: '🟦 Step 10: Telegram Bot',
      it: '🟦 Fase 10: Bot Telegram',
      es: '🟦 Paso 10: Bot Telegram',
      de: '🟦 Schritt 10: Telegram Bot'
    },
    'registration.step11': {
      fr: '🟦 Étape 11 : Logo de boutique',
      en: '🟦 Step 11: Shop logo',
      it: '🟦 Fase 11: Logo del negozio',
      es: '🟦 Paso 11: Logo de la tienda',
      de: '🟦 Schritt 11: Shop-Logo'
    },
    'registration.step12': {
      fr: '🟦 Étape 12 : Services',
      en: '🟦 Step 12: Services',
      it: '🟦 Fase 12: Servizi',
      es: '🟦 Paso 12: Servicios',
      de: '🟦 Schritt 12: Services'
    },
    'registration.step13': {
      fr: '🟦 Étape 13 : Départements Livraison',
      en: '🟦 Step 13: Delivery Departments',
      it: '🟦 Fase 13: Dipartimenti Consegna',
      es: '🟦 Paso 13: Departamentos Entrega',
      de: '🟦 Schritt 13: Lieferung Departements'
    },
    'registration.step14Meetup': {
      fr: '🟦 Étape 14 : Départements Meetup',
      en: '🟦 Step 14: Meetup Departments',
      it: '🟦 Fase 14: Dipartimenti Meetup',
      es: '🟦 Paso 14: Departamentos Meetup',
      de: '🟦 Schritt 14: Meetup Departements'
    },
    'registration.step15Shipping': {
      fr: '🟦 Étape 15 : Départements Envoi',
      en: '🟦 Step 15: Shipping Departments',
      it: '🟦 Fase 15: Dipartimenti Spedizione',
      es: '🟦 Paso 15: Departamentos Envío',
      de: '🟦 Schritt 15: Versand Departements'
    },
    'registration.step16Confirmation': {
      fr: '🟦 Étape 16 : Confirmation',
      en: '🟦 Step 16: Confirmation',
      it: '🟦 Fase 16: Conferma',
      es: '🟦 Paso 16: Confirmación',
      de: '🟦 Schritt 16: Bestätigung'
    },

    'registration.countryQuestion': {
      fr: 'Choisissez un ou plusieurs pays depuis lesquels vous travaillez ou où le service est disponible.',
      en: 'Choose one or more countries from which you work or where the service is available.',
      it: 'Scegli uno o più paesi da cui lavori o dove il servizio è disponibile.',
      es: 'Elija uno o más países desde los cuales trabaja o donde el servicio está disponible.',
      de: 'Wählen Sie ein oder mehrere Länder aus, von denen aus Sie arbeiten oder wo der Service verfügbar ist.'
    },
    'registration.countryExamples': {
      fr: '💡 Exemples :\n• Si vous êtes en France → Choisissez France\n• Si vous êtes en France et en Espagne → Choisissez France & Espagne',
      en: '💡 Examples:\n• If you are in France → Choose France\n• If you are in France and Spain → Choose France & Spain',
      it: '💡 Esempi:\n• Se sei in Francia → Scegli Francia\n• Se sei in Francia e Spagna → Scegli Francia & Spagna',
      es: '💡 Ejemplos:\n• Si estás en Francia → Elige Francia\n• Si estás en Francia y España → Elige Francia & España',
      de: '💡 Beispiele:\n• Wenn Sie in Frankreich sind → Wählen Sie Frankreich\n• Wenn Sie in Frankreich und Spanien sind → Wählen Sie Frankreich & Spanien'
    },
    'registration.noCountrySelected': {
      fr: '⚪ Aucun pays sélectionné',
      en: '⚪ No country selected',
      it: '⚪ Nessun paese selezionato',
      es: '⚪ Ningún país seleccionado',
      de: '⚪ Kein Land ausgewählt'
    },
    'registration.selectedCountries': {
      fr: '✅ Pays sélectionnés',
      en: '✅ Selected countries',
      it: '✅ Paesi selezionati',
      es: '✅ Países seleccionados',
      de: '✅ Ausgewählte Länder'
    },
    'registration.selectWorkingCountries': {
      fr: '👆 Sélectionnez vos pays de travail :',
      en: '👆 Select your working countries:',
      it: '👆 Seleziona i tuoi paesi di lavoro:',
      es: '👆 Seleccione sus países de trabajo:',
      de: '👆 Wählen Sie Ihre Arbeitsländer:'
    },
    'registration.meetupPostalTitle': {
      fr: '🤝 Service "Meet Up" - Codes postaux',
      en: '🤝 "Meet Up" Service - Postal codes',
      it: '🤝 Servizio "Meet Up" - Codici postali',
      es: '🤝 Servicio "Meet Up" - Códigos postales',
      de: '🤝 "Meet Up" Service - Postleitzahlen'
    },
    'registration.currentCountry': {
      fr: '📍 Pays actuel',
      en: '📍 Current country',
      it: '📍 Paese attuale',
      es: '📍 País actual',
      de: '📍 Aktuelles Land'
    },
    'registration.progression': {
      fr: '📊 Progression',
      en: '📊 Progress',
      it: '📊 Progresso',
      es: '📊 Progreso',
      de: '📊 Fortschritt'
    },
    'registration.enterPostalCode': {
      fr: 'Entrez le code postal pour',
      en: 'Enter the postal code for',
      it: 'Inserisci il codice postale per',
      es: 'Ingrese el código postal para',
      de: 'Geben Sie die Postleitzahl für ein'
    },
    'registration.postalCodeExample': {
      fr: '💡 Exemple',
      en: '💡 Example',
      it: '💡 Esempio',
      es: '💡 Ejemplo',
      de: '💡 Beispiel'
    },
    'registration.deliveryPostalTitle': {
      fr: '🚚 Service "Livraison" - Codes postaux',
      en: '🚚 "Delivery" Service - Postal codes',
      it: '🚚 Servizio "Consegna" - Codici postali',
      es: '🚚 Servicio "Entrega" - Códigos postales',
      de: '🚚 "Lieferung" Service - Postleitzahlen'
    },
    'registration.backToServices': {
      fr: '🔙 Retour aux services',
      en: '🔙 Back to services',
      it: '🔙 Torna ai servizi',
      es: '🔙 Volver a los servicios',
      de: '🔙 Zurück zu den Diensten'
    },
    'registration.backToPreviousCountry': {
      fr: '🔙 Retour au pays précédent',
      en: '🔙 Back to previous country',
      it: '🔙 Torna al paese precedente',
      es: '🔙 Volver al país anterior',
      de: '🔙 Zurück zum vorherigen Land'
    },
    'registration.step13': {
      fr: '🟦 Étape 13 : Ville',
      en: '🟦 Step 13: City',
      it: '🟦 Fase 13: Città',
      es: '🟦 Paso 13: Ciudad',
      de: '🟦 Schritt 13: Stadt'
    },
    'registration.step14': {
      fr: '🟦 Étape 14 : Services',
      en: '🟦 Step 14: Services',
      it: '🟦 Fase 14: Servizi',
      es: '🟦 Paso 14: Servicios',
      de: '🟦 Schritt 14: Dienstleistungen'
    },
    'registration.step15': {
      fr: '🟦 Étape 15 : Logo de boutique',
      en: '🟦 Step 15: Shop logo',
      it: '🟦 Fase 15: Logo del negozio',
      es: '🟦 Paso 15: Logo de la tienda',
      de: '🟦 Schritt 15: Shop-Logo'
    },
    'registration.step16': {
      fr: '🟦 Étape 16 : Photo de boutique',
      en: '🟦 Step 16: Shop photo',
      it: '🟦 Fase 16: Foto del negozio',
      es: '🟦 Paso 16: Foto de la tienda',
      de: '🟦 Schritt 16: Shop-Foto'
    },
    'registration.step17': {
      fr: '🟦 Étape 17 : Confirmation',
      en: '🟦 Step 17: Confirmation',
      it: '🟦 Fase 17: Conferma',
      es: '🟦 Paso 17: Confirmación',
      de: '🟦 Schritt 17: Bestätigung'
    },

    // === QUESTIONS DÉTAILLÉES ===
      'registration.potatoQuestion': {
    fr: '🥔 Entrez votre lien Potato Chat',
    en: '🥔 Enter your Potato Chat link',
    it: '🥔 Inserisci il tuo link Potato Chat',
    es: '🥔 Introduce tu enlace de Potato Chat',
    de: '🥔 Geben Sie Ihren Potato Chat-Link ein'
  },
    'registration.snapchatQuestion': {
      fr: '👻 Entrez votre lien Snapchat',
      en: '👻 Enter your Snapchat link',
      it: '👻 Inserisci il tuo link Snapchat',
      es: '👻 Introduce tu enlace de Snapchat',
      de: '👻 Geben Sie Ihren Snapchat-Link ein'
    },
    'registration.whatsappQuestion': {
      fr: '💬 Entrez votre lien WhatsApp',
      en: '💬 Enter your WhatsApp link',
      it: '💬 Inserisci il tuo link WhatsApp',
      es: '💬 Introduce tu enlace de WhatsApp',
      de: '💬 Geben Sie Ihren WhatsApp-Link ein'
    },
    'registration.signalQuestion': {
      fr: '🔒 Entrez votre lien Signal ou nom d\'utilisateur Signal',
      en: '🔒 Enter your Signal link or Signal username',
      it: '🔒 Inserisci il tuo link Signal o nome utente Signal',
      es: '🔒 Introduce tu enlace de Signal o nombre de usuario de Signal',
      de: '🔒 Geben Sie Ihren Signal-Link oder Signal-Benutzernamen ein'
    },
    'registration.sessionQuestion': {
      fr: '🛡️ Entrez votre identifiant Session',
      en: '🛡️ Enter your Session ID',
      it: '🛡️ Inserisci il tuo ID Session',
      es: '🛡️ Introduce tu ID de Session',
      de: '🛡️ Geben Sie Ihre Session-ID ein'
    },
    'registration.threemaQuestion': {
      fr: '🔐 Entrez votre lien Threema',
      en: '🔐 Enter your Threema link',
      it: '🔐 Inserisci il tuo link Threema',
      es: '🔐 Introduce tu enlace de Threema',
      de: '🔐 Geben Sie Ihren Threema-Link ein'
    },
    'registration.telegramBotQuestion': {
      fr: '🤖 Entrez votre bot Telegram (@username ou t.me/botname)',
      en: '🤖 Enter your Telegram bot (@username or t.me/botname)',
      it: '🤖 Inserisci il tuo bot Telegram (@username o t.me/botname)',
      es: '🤖 Introduce tu bot de Telegram (@username o t.me/botname)',
      de: '🤖 Geben Sie Ihren Telegram-Bot ein (@username oder t.me/botname)'
    },
    'registration.telegramBotExample': {
      fr: '(Ex: @monbotshop_bot ou lien du bot)',
      en: '(Ex: @myshopbot_bot or bot link)',
      it: '(Es: @mionegoziobot_bot o link del bot)',
      es: '(Ej: @mibottienda_bot o enlace del bot)',
      de: '(Z.B.: @meinshopbot_bot oder Bot-Link)'
    },
    'registration.logoQuestion': {
      fr: '🖼️ Envoie ton logo de boutique (obligatoire)',
      en: '🖼️ Send your shop logo (required)',
      it: '🖼️ Invia il logo del tuo negozio (obbligatorio)',
      es: '🖼️ Envía el logo de tu tienda (obligatorio)',
      de: '🖼️ Senden Sie Ihr Shop-Logo (erforderlich)'
    },
    'registration.logoInstruction': {
      fr: '⚠️ Tu peux envoyer une image ici.',
      en: '⚠️ You can send an image here.',
      it: '⚠️ Puoi inviare un\'immagine qui.',
      es: '⚠️ Puedes enviar una imagen aquí.',
      de: '⚠️ Sie können hier ein Bild senden.'
    },
    'registration.shopPhotoQuestion': {
      fr: '📸 Envoie le logo de ta boutique',
      en: '📸 Send your shop logo',
      it: '📸 Invia il logo del tuo negozio',
      es: '📸 Envía el logo de tu tienda',
      de: '📸 Senden Sie Ihr Shop-Logo'
    },
    'registration.shopPhotoInstruction': {
      fr: '(Photo de présentation de tes produits ou de ton espace de vente)',
      en: '(Presentation photo of your products or sales space)',
      it: '(Foto di presentazione dei tuoi prodotti o spazio vendita)',
      es: '(Foto de presentación de tus productos o espacio de venta)',
      de: '(Präsentationsfoto Ihrer Produkte oder Verkaufsraum)'
    },
    'registration.countryQuestion': {
      fr: '🌍 Dans quel pays exerces-tu principalement ?',
      en: '🌍 In which country do you mainly operate?',
      it: '🌍 In che paese operi principalmente?',
      es: '🌍 ¿En qué país operas principalmente?',
      de: '🌍 In welchem Land sind Sie hauptsächlich tätig?'
    },
    'registration.cityQuestion': {
      fr: '🏙️ Dans quelle ville exerces-tu principalement ?',
      en: '🏙️ In which city do you mainly operate?',
      it: '🏙️ In che città operi principalmente?',
      es: '🏙️ ¿En qué ciudad operas principalmente?',
      de: '🏙️ In welcher Stadt sind Sie hauptsächlich tätig?'
    },
    'registration.servicesQuestion': {
      fr: '🚚 Quels services proposes-tu ?',
      en: '🚚 What services do you offer?',
      it: '🚚 Quali servizi offri?',
      es: '🚚 ¿Qué servicios ofreces?',
      de: '🚚 Welche Services bieten Sie an?'
    },
    'registration.serviceDelivery': {
      fr: '🚚 Livraison',
      en: '🚚 Delivery',
      it: '🚚 Consegna',
      es: '🚚 Entrega',
      de: '🚚 Lieferung'
    },
    'registration.serviceMeetup': {
      fr: '🤝 Meetup',
      en: '🤝 Meetup',
      it: '🤝 Meetup',
      es: '🤝 Meetup',
      de: '🤝 Meetup'
    },
    'registration.serviceShipping': {
      fr: '📦 Envoi',
      en: '📦 Shipping',
      it: '📦 Spedizione',
      es: '📦 Envío',
      de: '📦 Versand'
    },
    'registration.servicesInstruction': {
      fr: 'Sélectionne tous les services que tu proposes :',
      en: 'Select all services you offer:',
      it: 'Seleziona tutti i servizi che offri:',
      es: 'Selecciona todos los servicios que ofreces:',
      de: 'Wählen Sie alle Services aus, die Sie anbieten:'
    },
    'registration.departmentsDeliveryQuestion': {
      fr: '🚚 Dans quels NUMÉROS de départements fais-tu de la LIVRAISON ?',
      en: '🚚 In which department NUMBERS do you do DELIVERY?',
      it: '🚚 In quali NUMERI di dipartimenti fai CONSEGNA?',
      es: '🚚 ¿En qué NÚMEROS de departamentos haces ENTREGA?',
      de: '🚚 In welchen Departement-NUMMERN machen Sie LIEFERUNG?'
    },
    'registration.departmentsMeetupQuestion': {
      fr: '🤝 Dans quels NUMÉROS de départements fais-tu du MEETUP ?',
      en: '🤝 In which department NUMBERS do you do MEETUP?',
      it: '🤝 In quali NUMERI di dipartimenti fai MEETUP?',
      es: '🤝 ¿En qué NÚMEROS de departamentos haces MEETUP?',
      de: '🤝 In welchen Departement-NUMMERN machen Sie MEETUP?'
    },
    'registration.departmentsShippingQuestion': {
      fr: '📦 Dans quels NUMÉROS de départements fais-tu de l\'ENVOI ?',
      en: '📦 In which department NUMBERS do you do SHIPPING?',
      it: '📦 In quali NUMERI di dipartimenti fai SPEDIZIONE?',
      es: '📦 ¿En qué NÚMEROS de departamentos haces ENVÍO?',
      de: '📦 In welchen Departement-NUMMERN machen Sie VERSAND?'
    },
    'registration.departmentsInstruction': {
      fr: 'Écris les NUMÉROS de départements séparés par des virgules (exemple: 75, 92, 93, 94)',
      en: 'Write the department NUMBERS separated by commas (example: 75, 92, 93, 94)',
      it: 'Scrivi i NUMERI dei dipartimenti separati da virgole (esempio: 75, 92, 93, 94)',
      es: 'Escribe los NÚMEROS de departamentos separados por comas (ejemplo: 75, 92, 93, 94)',
      de: 'Schreiben Sie die Departement-NUMMERN getrennt durch Kommas (Beispiel: 75, 92, 93, 94)'
    },
    'registration.shippingCountriesQuestion': {
      fr: '📦 Dans quels PAYS fais-tu de l\'ENVOI ?',
      en: '📦 In which COUNTRIES do you do SHIPPING?',
      it: '📦 In quali PAESI fai SPEDIZIONE?',
      es: '📦 ¿En qué PAÍSES haces ENVÍO?',
      de: '📦 In welchen LÄNDERN machen Sie VERSAND?'
    },
    'registration.shippingCountriesInstruction': {
      fr: 'Écris les noms des pays séparés par des virgules (exemple: France, Espagne, Italie)',
      en: 'Write the country names separated by commas (example: France, Spain, Italy)',
      it: 'Scrivi i nomi dei paesi separati da virgole (esempio: Francia, Spagna, Italia)',
      es: 'Escribe los nombres de los países separados por comas (ejemplo: Francia, España, Italia)',
      de: 'Schreiben Sie die Ländernamen getrennt durch Kommas (Beispiel: Frankreich, Spanien, Italien)'
    },
    'registration.error.departmentsNumbers': {
      fr: '❌ Veuillez saisir uniquement des chiffres et des virgules (exemple: 75, 92, 93)',
      en: '❌ Please enter only numbers and commas (example: 75, 92, 93)',
      it: '❌ Inserisci solo numeri e virgole (esempio: 75, 92, 93)',
      es: '❌ Ingresa solo números y comas (ejemplo: 75, 92, 93)',
      de: '❌ Bitte geben Sie nur Zahlen und Kommas ein (Beispiel: 75, 92, 93)'
    },
    'no_postal_codes_for_country': {
      fr: 'Aucun code postal trouvé pour',
      en: 'No postal codes found for',
      it: 'Nessun codice postale trovato per',
      es: 'No se encontraron códigos postales para',
      de: 'Keine Postleitzahlen gefunden für'
    },
    'registration.continueToNext': {
      fr: '➡️ Continuer',
      en: '➡️ Continue',
      it: '➡️ Continua',
      es: '➡️ Continuar',
      de: '➡️ Weiter'
    },

    // === ERREURS SPÉCIFIQUES RÉSEAUX ===
      'registration.error.potatoFormat': {
    fr: '❌ Merci de fournir un lien Potato Chat 🥔 valide (ex: https://potato.chat/username). Réessaie :',
    en: '❌ Please provide a valid Potato Chat 🥔 link (ex: https://potato.chat/username). Try again:',
    it: '❌ Fornisci un link Potato Chat 🥔 valido (es: https://potato.chat/username). Riprova:',
    es: '❌ Proporciona un enlace de Potato Chat 🥔 válido (ej: https://potato.chat/username). Inténtalo de nuevo:',
    de: '❌ Bitte geben Sie einen gültigen Potato Chat 🥔-Link an (z.B.: https://potato.chat/username). Versuchen Sie es erneut:'
  },
    'registration.error.snapchatFormat': {
      fr: '❌ Merci de fournir un lien Snapchat valide (ex: https://www.snapchat.com/add/username). Réessaie :',
      en: '❌ Please provide a valid Snapchat link (ex: https://www.snapchat.com/add/username). Try again:',
      it: '❌ Fornisci un link Snapchat valido (es: https://www.snapchat.com/add/username). Riprova:',
      es: '❌ Proporciona un enlace de Snapchat válido (ej: https://www.snapchat.com/add/username). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Snapchat-Link an (z.B.: https://www.snapchat.com/add/username). Versuchen Sie es erneut:'
    },
    'registration.error.whatsappFormat': {
      fr: '❌ Merci de fournir un lien WhatsApp valide (ex: https://wa.me/33123456789). Réessaie :',
      en: '❌ Please provide a valid WhatsApp link (ex: https://wa.me/33123456789). Try again:',
      it: '❌ Fornisci un link WhatsApp valido (es: https://wa.me/33123456789). Riprova:',
      es: '❌ Proporciona un enlace de WhatsApp válido (ej: https://wa.me/33123456789). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen WhatsApp-Link an (z.B.: https://wa.me/33123456789). Versuchen Sie es erneut:'
    },
    'registration.error.signalFormat': {
      fr: '❌ Merci de fournir un identifiant Signal valide ou un lien. Réessaie :',
      en: '❌ Please provide a valid Signal ID or link. Try again:',
      it: '❌ Fornisci un ID Signal valido o un link. Riprova:',
      es: '❌ Proporciona un ID de Signal válido o un enlace. Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie eine gültige Signal-ID oder einen Link an. Versuchen Sie es erneut:'
    },
    'registration.error.sessionFormat': {
      fr: '❌ L\'identifiant Session doit faire au moins 2 caractères. Réessaie :',
      en: '❌ Session ID must be at least 2 characters. Try again:',
      it: '❌ L\'ID Session deve essere di almeno 2 caratteri. Riprova:',
      es: '❌ El ID de Session debe tener al menos 2 caracteres. Inténtalo de nuevo:',
      de: '❌ Session-ID muss mindestens 2 Zeichen haben. Versuchen Sie es erneut:'
    },
    'registration.error.threemaFormat': {
      fr: '❌ Merci de fournir un lien Threema valide (ex: https://threema.id/VOTRID). Réessaie :',
      en: '❌ Please provide a valid Threema link (ex: https://threema.id/YOURID). Try again:',
      it: '❌ Fornisci un link Threema valido (es: https://threema.id/TUOID). Riprova:',
      es: '❌ Proporciona un enlace de Threema válido (ej: https://threema.id/TUID). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Threema-Link an (z.B.: https://threema.id/IHREID). Versuchen Sie es erneut:'
    },
    'registration.error.technical': {
      fr: 'Erreur technique',
      en: 'Technical error',
      it: 'Errore tecnico',
      es: 'Error técnico',
      de: 'Technischer Fehler'
    },
    'registration.error.submissionFailed': {
      fr: 'Une erreur s\'est produite lors de l\'envoi de ta demande.',
      en: 'An error occurred while sending your request.',
      it: 'Si è verificato un errore durante l\'invio della richiesta.',
      es: 'Se produjo un error al enviar tu solicitud.',
      de: 'Beim Senden Ihrer Anfrage ist ein Fehler aufgetreten.'
    },
    'registration.error.tryAgainLater': {
      fr: 'Tu peux réessayer dans quelques minutes.',
      en: 'You can try again in a few minutes.',
      it: 'Puoi riprovare tra qualche minuto.',
      es: 'Puedes intentarlo de nuevo en unos minutos.',
      de: 'Sie können es in ein paar Minuten erneut versuchen.'
    },
    'registration.error.contactSupport': {
      fr: 'Si le problème persiste, contacte le support.',
      en: 'If the problem persists, contact support.',
      it: 'Se il problema persiste, contatta il supporto.',
      es: 'Si el problema persiste, contacta al soporte.',
      de: 'Wenn das Problem weiterhin besteht, wenden Sie sich an den Support.'
    },
    'registration.error.telegramBotFormat': {
      fr: '❌ Merci de fournir un nom ou lien de bot Telegram valide (ex: @monbot_bot). Réessaie :',
      en: '❌ Please provide a valid Telegram bot name or link (ex: @mybot_bot). Try again:',
      it: '❌ Fornisci un nome o link bot Telegram valido (es: @miobot_bot). Riprova:',
      es: '❌ Proporciona un nombre o enlace de bot Telegram válido (ej: @mibot_bot). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Telegram-Bot-Namen oder -Link an (z.B.: @meinbot_bot). Versuchen Sie es erneut:'
    },
    'registration.error.cityLength': {
      fr: '❌ La ville doit faire au moins 2 caractères. Réessaie :',
      en: '❌ City must be at least 2 characters. Try again:',
      it: '❌ La città deve essere di almeno 2 caratteri. Riprova:',
      es: '❌ La ciudad debe tener al menos 2 caracteres. Inténtalo de nuevo:',
      de: '❌ Stadt muss mindestens 2 Zeichen haben. Versuchen Sie es erneut:'
    },
    'registration.error.departmentsLength': {
      fr: '❌ Les départements doivent faire au moins 2 caractères. Réessaie :',
      en: '❌ Departments must be at least 2 characters. Try again:',
      it: '❌ I dipartimenti devono essere di almeno 2 caratteri. Riprova:',
      es: '❌ Los departamentos deben tener al menos 2 caracteres. Inténtalo de nuevo:',
      de: '❌ Departements müssen mindestens 2 Zeichen haben. Versuchen Sie es erneut:'
    },

    // === SÉLECTION ET FINALISATION ===
    'registration.finishSelection': {
      fr: 'Terminer la sélection',
      en: 'Finish selection',
      it: 'Termina selezione',
      es: 'Terminar selección',
      de: 'Auswahl abschließen'
    },
    'registration.allCountries': {
      fr: 'Tous les pays',
      en: 'All countries',
      it: 'Tutti i paesi',
      es: 'Todos los países',
      de: 'Alle Länder'
    },
    'registration.selectServices': {
      fr: '(Sélectionne tous ceux qui s\'appliquent)',
      en: '(Select all that apply)',
      it: '(Seleziona tutto ciò che si applica)',
      es: '(Selecciona todo lo que corresponda)',
      de: '(Wählen Sie alles Zutreffende aus)'
    },
    'registration.servicesAvailable': {
      fr: '☑️ Services disponibles',
      en: '☑️ Available services',
      it: '☑️ Servizi disponibili',
      es: '☑️ Servicios disponibles',
      de: '☑️ Verfügbare Services'
    },

    // === MESSAGES D'ERREUR GÉNÉRIQUES ===
    'registration.error.formError': {
      fr: '❌ Erreur de formulaire',
      en: '❌ Form error',
      it: '❌ Errore del modulo',
      es: '❌ Error de formulario',
      de: '❌ Formular-Fehler'
    },
    'registration.error.genericError': {
      fr: '❌ Erreur',
      en: '❌ Error',
      it: '❌ Errore',
      es: '❌ Error',
      de: '❌ Fehler'
    },
    'registration.error.technicalError': {
      fr: '❌ Erreur technique',
      en: '❌ Technical error',
      it: '❌ Errore tecnico',
      es: '❌ Error técnico',
      de: '❌ Technischer Fehler'
    },
    'registration.error.photoError': {
      fr: '❌ Erreur lors du traitement de la photo. Réessaie.',
      en: '❌ Error processing photo. Try again.',
      it: '❌ Errore nell\'elaborazione della foto. Riprova.',
      es: '❌ Error al procesar la foto. Inténtalo de nuevo.',
      de: '❌ Fehler beim Verarbeiten des Fotos. Versuchen Sie es erneut.'
    },
    'registration.error.startupError': {
      fr: '❌ Erreur lors du démarrage',
      en: '❌ Startup error',
      it: '❌ Errore di avvio',
      es: '❌ Error de inicio',
      de: '❌ Startfehler'
    },

    // === MESSAGES DE CONFIRMATION ===
    'registration.countrySelected': {
      fr: 'Pays sélectionné :',
      en: 'Country selected:',
      it: 'Paese selezionato:',
      es: 'País seleccionado:',
      de: 'Land ausgewählt:'
    },
    'registration.invalidCountry': {
      fr: '❌ Pays invalide',
      en: '❌ Invalid country',
      it: '❌ Paese non valido',
      es: '❌ País inválido',
      de: '❌ Ungültiges Land'
    },

    // === CONFIRMATION ===
    'registration.finalSummary': {
      fr: '✅ Voici le récapitulatif final :',
      en: '✅ Here is the final summary:',
      it: '✅ Ecco il riepilogo finale:',
      es: '✅ Aquí está el resumen final:',
      de: '✅ Hier ist die finale Zusammenfassung:'
    },
    'registration.plugName': {
      fr: 'Nom de Plug',
      en: 'Plug Name',
      it: 'Nome Negozio',
      es: 'Nombre de Tienda',
      de: 'Shop-Name'
    },
    'registration.photoReceived': {
      fr: 'Photo de boutique : ✔️ Reçu',
      en: 'Shop photo: ✔️ Received',
      it: 'Foto negozio: ✔️ Ricevuta',
      es: 'Foto de tienda: ✔️ Recibida',
      de: 'Shop-Foto: ✔️ Erhalten'
    },
    'registration.confirmInscription': {
      fr: 'Confirmer l\'inscription ?',
      en: 'Confirm registration?',
      it: 'Confermare la registrazione?',
      es: '¿Confirmar registro?',
      de: 'Registrierung bestätigen?'
    },
    'registration.confirm': {
      fr: '✅ Confirmer',
      en: '✅ Confirm',
      it: '✅ Conferma',
      es: '✅ Confirmar',
      de: '✅ Bestätigen'
    },

    // === SOUMISSION FINALE ===
    'registration.finalStep': {
      fr: '🟩 ÉTAPE FINALE',
      en: '🟩 FINAL STEP',
      it: '🟩 FASE FINALE',
      es: '🟩 PASO FINAL',
      de: '🟩 LETZTER SCHRITT'
    },
    'registration.formReceived': {
      fr: '🎉 Formulaire reçu !',
      en: '🎉 Form received!',
      it: '🎉 Modulo ricevuto!',
      es: '🎉 ¡Formulario recibido!',
      de: '🎉 Formular erhalten!'
    },
    'registration.validationInstructions': {
      fr: '📌 Pour valider ton inscription :',
      en: '📌 To validate your registration:',
      it: '📌 Per convalidare la tua registrazione:',
      es: '📌 Para validar tu registro:',
      de: '📌 Um deine Registrierung zu bestätigen:'
    },
    'registration.step1Validation': {
      fr: '1️⃣ Poste le logo FindYourPlug sur un de tes réseaux renseignés avec le texte :\n"Inscription en cours chez FindYourPlug"\net identifie findyourplug',
      en: '1️⃣ Post the FindYourPlug logo on one of your registered networks with the text:\n"Registration in progress at FindYourPlug"\nand tag findyourplug',
      it: '1️⃣ Pubblica il logo FindYourPlug su uno dei tuoi social registrati con il testo:\n"Registrazione in corso presso FindYourPlug"\ne tagga findyourplug',
      es: '1️⃣ Publica el logo FindYourPlug en una de tus redes registradas con el texto:\n"Registro en curso en FindYourPlug"\ny etiqueta findyourplug',
      de: '1️⃣ Poste das FindYourPlug-Logo in einem deiner registrierten Netzwerke mit dem Text:\n"Registrierung läuft bei FindYourPlug"\nund tagge findyourplug'
    },
    'registration.step2Validation': {
      fr: 'Envoie une photo de ton stock avec\nFindYourPlug et la date du jour écrits sur papier\nà l\'admin : findyourplug_admin',
      en: 'Send a photo of your stock with\nFindYourPlug and today\'s date written on paper\nto admin: findyourplug_admin',
      it: 'Invia una foto del tuo stock con\nFindYourPlug e la data di oggi scritti su carta\nall\'admin: findyourplug_admin',
      es: 'Envía una foto de tu stock con\nFindYourPlug y la fecha de hoy escritos en papel\nal admin: findyourplug_admin',
      de: 'Sende ein Foto deines Lagers mit\nFindYourPlug und dem heutigen Datum auf Papier geschrieben\nan Admin: findyourplug_admin'
    },
    'registration.timeLimit': {
      fr: '⏰ Tu as 24h pour faire cette étape.',
      en: '⏰ You have 24h to complete this step.',
      it: '⏰ Hai 24 ore per completare questo passaggio.',
      es: '⏰ Tienes 24h para completar este paso.',
      de: '⏰ Du hast 24 Stunden, um diesen Schritt zu erledigen.'
    },
    'registration.approvalTime': {
      fr: 'ℹ️ La pré-approbation peut prendre 24 à 72h.\nTu seras notifié automatiquement de la décision.',
      en: 'ℹ️ Pre-approval may take 24 to 72h.\nYou will be automatically notified of the decision.',
      it: 'ℹ️ La pre-approvazione può richiedere da 24 a 72 ore.\nSarai notificato automaticamente della decisione.',
      es: 'ℹ️ La pre-aprobación puede tomar de 24 a 72h.\nSerás notificado automáticamente de la decisión.',
      de: 'ℹ️ Die Vorabgenehmigung kann 24 bis 72 Stunden dauern.\nDu wirst automatisch über die Entscheidung benachrichtigt.'
    },

    // === DÉPARTEMENTS ===
    'registration.departmentsMeetupQuestion': {
      fr: '📍 Indique les départements pour le **Meetup** (ex: 75, 92, 93) :',
      en: '📍 Indicate the departments for **Meetup** (ex: 75, 92, 93):',
      it: '📍 Indica i dipartimenti per **Meetup** (es: 75, 92, 93):',
      es: '📍 Indica los departamentos para **Meetup** (ej: 75, 92, 93):',
      de: '📍 Geben Sie die Departements für **Meetup** an (z.B.: 75, 92, 93):'
    },
    'registration.departmentsDeliveryQuestion': {
      fr: '🚚 Indique les départements pour la **Livraison** (ex: 75, 94...) :',
      en: '🚚 Indicate the departments for **Delivery** (ex: 75, 94...):',
      it: '🚚 Indica i dipartimenti per la **Consegna** (es: 75, 94...):',
      es: '🚚 Indica los departamentos para **Entrega** (ej: 75, 94...):',
      de: '🚚 Geben Sie die Departements für **Lieferung** an (z.B.: 75, 94...):'
    },

    // === SERVICES ===
    'service_delivery': {
      fr: 'Livraison',
      en: 'Delivery',
      it: 'Consegna',
      es: 'Entrega',
      de: 'Lieferung'
    },
    'service_meetup': {
      fr: 'Meetup',
      en: 'Meetup',
      it: 'Incontro',
      es: 'Encuentro',
      de: 'Treffen'
    },
    'service_postal': {
      fr: 'Envoi postal',
      en: 'Postal shipping',
      it: 'Spedizione postale',
      es: 'Envío postal',
      de: 'Postversand'
    },
    'services_available': {
      fr: 'Services disponibles',
      en: 'Available services',
      it: 'Servizi disponibili',
      es: 'Servicios disponibles',
      de: 'Verfügbare Services'
    },
    'service_choose_type': {
      fr: 'Choisissez le type de service :',
      en: 'Choose the type of service:',
      it: 'Scegli il tipo di servizio:',
      es: 'Elige el tipo de servicio:',
      de: 'Wählen Sie den Servicetyp:'
    },
    'shops_count': {
      fr: 'boutiques',
      en: 'shops',
      it: 'negozi',
      es: 'tiendas',
      de: 'Shops'
    },
    'countries_served': {
      fr: 'Pays desservis',
      en: 'Countries served',
      it: 'Paesi serviti',
      es: 'Países servidos',
      de: 'Bediente Länder'
    },

    // === BOUTIQUES ===
    'shop_details': {
      fr: 'Détails de la boutique',
      en: 'Shop details',
      it: 'Dettagli del negozio',
      es: 'Detalles de la tienda',
      de: 'Shop-Details'
    },
    'shop_description_label': {
      fr: '📝',
      en: '📝',
      it: '📝',
      es: '📝',
      de: '📝'
    },
    'vote_for_shop': {
      fr: 'Voter Pour ce Plug',
      en: 'Vote for this Plug',
      it: 'Vota per questo negozio',
      es: 'Votar por esta tienda',
      de: 'Für diesen Shop stimmen'
    },
    'already_voted': {
      fr: 'Déjà voté',
      en: 'Already voted',
      it: 'Già votato',
      es: 'Ya votado',
      de: 'Bereits abgestimmt'
    },
    'vote_count_singular': {
      fr: 'vote',
      en: 'vote',
      it: 'voto',
      es: 'voto',
      de: 'Stimme'
    },
    'vote_count_plural': {
      fr: 'votes',
      en: 'votes',
      it: 'voti',
      es: 'votos',
      de: 'Stimmen'
    },
    'vote_cooldown_message': {
      fr: 'Déjà voté - 2h restant',
      en: 'Already voted - 2h remaining',
      it: 'Già votato - 2h rimanenti',
      es: 'Ya votado - 2h restantes',
      de: 'Bereits abgestimmt - 2h verbleibend'
    },
    'vote_cooldown_time': {
      fr: 'Déjà voté ({votes}) - {hours}h{minutes}m',
      en: 'Already voted ({votes}) - {hours}h{minutes}m',
      it: 'Già votato ({votes}) - {hours}h{minutes}m',
      es: 'Ya votado ({votes}) - {hours}h{minutes}m',
      de: 'Bereits abgestimmt ({votes}) - {hours}h{minutes}m'
    },
    'vote_success_message': {
      fr: '👍 Vous avez voté pour {plugName} ! ({likes} votes)',
      en: '👍 You voted for {plugName}! ({likes} votes)',
      it: '👍 Hai votato per {plugName}! ({likes} voti)',
      es: '👍 ¡Has votado por {plugName}! ({likes} votos)',
      de: '👍 Sie haben für {plugName} gestimmt! ({likes} Stimmen)'
    },
    'vote_cooldown_alert': {
      fr: '⏰ Vous avez déjà voté pour cette boutique ! Vous pourrez voter à nouveau dans {remainingTime}.',
      en: '⏰ You have already voted for this shop! You can vote again in {remainingTime}.',
      it: '⏰ Hai già votato per questo negozio! Potrai votare di nuovo tra {remainingTime}.',
      es: '⏰ ¡Ya has votado por esta tienda! Podrás votar de nuevo en {remainingTime}.',
      de: '⏰ Sie haben bereits für diesen Shop gestimmt! Sie können in {remainingTime} erneut abstimmen.'
    },

    // === NAVIGATION ===
    'back_to_filters': {
      fr: 'Retour aux boutiques',
      en: 'Back to shops',
      it: 'Torna ai negozi',
      es: 'Volver a las tiendas',
      de: 'Zurück zu den Geschäften'
    },
    'back_to_menu': {
      fr: 'Retour au menu',
      en: 'Back to menu',
      it: 'Torna al menu',
      es: 'Volver al menú',
      de: 'Zurück zum Menü'
    },
    'back_to_departments': {
      fr: 'Retour aux départements',
      en: 'Back to departments',
      it: 'Torna ai dipartimenti',
      es: 'Volver a departamentos',
      de: 'Zurück zu den Abteilungen'
    },
    'main_menu': {
      fr: 'Menu principal',
      en: 'Main menu',
      it: 'Menu principale',
      es: 'Menú principal',
      de: 'Hauptmenü'
    },
    'page_info': {
      fr: 'Page',
      en: 'Page',
      it: 'Pagina',
      es: 'Página',
      de: 'Seite'
    },

    // === MESSAGES D'ÉTAT ===
    'loading': {
      fr: 'Chargement...',
      en: 'Loading...',
      it: 'Caricamento...',
      es: 'Cargando...',
      de: 'Laden...'
    },
    'error_loading': {
      fr: 'Erreur lors du chargement',
      en: 'Error loading',
      it: 'Errore durante il caricamento',
      es: 'Error al cargar',
      de: 'Fehler beim Laden'
    },
    'shop_not_found': {
      fr: 'Boutique non trouvée ou inactive',
      en: 'Shop not found or inactive',
      it: 'Negozio non trovato o inattivo',
      es: 'Tienda no encontrada o inactiva',
      de: 'Shop nicht gefunden oder inaktiv'
    },

    // === FILTRES ===
    'filter_by_service': {
      fr: 'Filtrer par service',
      en: 'Filter by service',
      it: 'Filtra per servizio',
      es: 'Filtrar por servicio',
      de: 'Nach Service filtern'
    },
    'filter_by_country': {
      fr: 'Filtrer par pays',
      en: 'Filter by country',
      it: 'Filtra per paese',
      es: 'Filtrar por país',
      de: 'Nach Land filtern'
    },
    'all_shops': {
      fr: 'Toutes les boutiques',
      en: 'All shops',
      it: 'Tutti i negozi',
      es: 'Todas las tiendas',
      de: 'Alle Shops'
    },
    'messages_shopsAvailable': {
      fr: 'boutiques disponibles',
      en: 'shops available',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'Shops verfügbar'
    },
    'messages_activeUsers': {
      fr: 'utilisateurs actifs',
      en: 'active users',
      it: 'utenti attivi',
      es: 'usuarios activos',
      de: 'aktive Benutzer'
    },
    'messages_availableShops': {
      fr: 'boutiques disponibles',
      en: 'available shops',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'verfügbare Shops'
    },
    'messages_refreshedAt': {
      fr: 'Actualisé à',
      en: 'Updated at',
      it: 'Aggiornato alle',
      es: 'Actualizado a las',
      de: 'Aktualisiert um'
    },
    'messages_sortedByVotes': {
      fr: 'Triés par nombre de votes',
      en: 'Sorted by number of votes',
      it: 'Ordinati per numero di voti',
      es: 'Ordenados por número de votos',
      de: 'Sortiert nach Anzahl der Stimmen'
    },
    'messages_noShops': {
      fr: '❌ Aucune boutique disponible pour le moment.',
      en: '❌ No shops available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Momentan sind keine Shops verfügbar.'
    },
    
    // === FILTRES AVANCÉS ===
    'filter_delivery_message': {
      fr: '📦 Afficher les boutiques disponibles pour livraison',
      en: '📦 Show shops available for delivery',
      it: '📦 Mostra negozi disponibili per consegna',
      es: '📦 Mostrar tiendas disponibles para entrega',
      de: '📦 Shops für Lieferung anzeigen'
    },
    'filter_meetup_message': {
      fr: '🤝 Afficher les boutiques disponibles pour meetup',
      en: '🤝 Show shops available for meetup',
      it: '🤝 Mostra negozi disponibili per incontro',
      es: '🤝 Mostrar tiendas disponibles para encuentro',
      de: '🤝 Shops für Treffen anzeigen'
    },
    'filter_postal_message': {
      fr: '📬 Boutiques qui font des envois postaux',
      en: '📬 Shops that do postal shipping',
      it: '📬 Negozi che fanno spedizioni postali',
      es: '📬 Tiendas que hacen envíos postales',
      de: '📬 Shops mit Postversand'
    },
    'filter_department_available': {
      fr: 'Départements disponibles pour',
      en: 'Available departments for',
      it: 'Dipartimenti disponibili per',
      es: 'Departamentos disponibles para',
      de: 'Verfügbare Bundesländer für'
    },
    'filter_shops_in_department': {
      fr: 'Boutiques en',
      en: 'Shops in',
      it: 'Negozi in',
      es: 'Tiendas en',
      de: 'Shops in'
    },

    // === ERREURS ET STATUTS ===
    'error_filtering': {
      fr: '❌ Erreur lors du filtrage',
      en: '❌ Error filtering',
      it: '❌ Errore nel filtraggio',
      es: '❌ Error al filtrar',
      de: '❌ Fehler beim Filtern'
    },
    'error_departments': {
      fr: '❌ Erreur lors du chargement des départements',
      en: '❌ Error loading departments',
      it: '❌ Errore nel caricamento dei dipartimenti',
      es: '❌ Error al cargar departamentos',
      de: '❌ Fehler beim Laden der Bundesländer'
    },
    'error_reset': {
      fr: '❌ Erreur lors de la réinitialisation',
      en: '❌ Error resetting',
      it: '❌ Errore nel reset',
      es: '❌ Error al reiniciar',
      de: '❌ Fehler beim Zurücksetzen'
    },
    'no_departments': {
      fr: '❌ Aucun département disponible',
      en: '❌ No departments available',
      it: '❌ Nessun dipartimento disponibile',
      es: '❌ No hay departamentos disponibles',
      de: '❌ Keine Bundesländer verfügbar'
    },
    'filters_reset': {
      fr: '🔄 Filtres réinitialisés',
      en: '🔄 Filters reset',
      it: '🔄 Filtri ripristinati',
      es: '🔄 Filtros reiniciados',
      de: '🔄 Filter zurückgesetzt'
    },
    'filters_reset_button': {
      fr: '🔁 Réinitialiser les filtres',
      en: '🔁 Reset filters',
      it: '🔁 Ripristina filtri',
      es: '🔁 Reiniciar filtros',
      de: '🔁 Filter zurücksetzen'
    },
    'messages_shopsAvailable': {
      fr: 'boutiques disponibles',
      en: 'shops available',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'Shops verfügbar'
    },

    // === FILTRES SPÉCIFIQUES ===
    'filter_country_selected': {
      fr: 'Pays sélectionné',
      en: 'Selected country',
      it: 'Paese selezionato',
      es: 'País seleccionado',
      de: 'Ausgewähltes Land'
    },
    'shops_found_postal': {
      fr: 'boutiques avec envoi postal',
      en: 'shops with postal shipping',
      it: 'negozi con spedizione postale',
      es: 'tiendas con envío postal',
      de: 'Shops mit Postversand'
    },
    'no_shops_postal': {
      fr: 'Aucune boutique avec envoi postal.',
      en: 'No shops with postal shipping.',
      it: 'Nessun negozio con spedizione postale.',
      es: 'No hay tiendas con envío postal.',
      de: 'Keine Shops mit Postversand.'
    },
    'click_department_instruction': {
      fr: 'Cliquez sur "📍 Département 🔁" pour sélectionner votre zone.',
      en: 'Click on "📍 Department 🔁" to select your area.',
      it: 'Clicca su "📍 Regione 🔁" per selezionare la tua zona.',
      es: 'Haz clic en "📍 Provincia 🔁" para seleccionar tu zona.',
      de: 'Klicken Sie auf "📍 Bundesland 🔁", um Ihr Gebiet auszuwählen.'
    },
    'shops_found_delivery': {
      fr: 'boutiques avec livraison',
      en: 'shops with delivery',
      it: 'negozi con consegna',
      es: 'tiendas con entrega',
      de: 'Shops mit Lieferung'
    },
    'shops_found_meetup': {
      fr: 'boutiques avec meetup',
      en: 'shops with meetup',
      it: 'negozi con incontro',
      es: 'tiendas con encuentro',
      de: 'Shops mit Treffen'
    },
    'no_shops_delivery': {
      fr: 'Aucune boutique avec livraison.',
      en: 'No shops with delivery.',
      it: 'Nessun negozio con consegna.',
      es: 'No hay tiendas con entrega.',
      de: 'Keine Shops mit Lieferung.'
    },
    'no_shops_meetup': {
      fr: 'Aucune boutique avec meetup.',
      en: 'No shops with meetup.',
      it: 'Nessun negozio con incontro.',
      es: 'No hay tiendas con encuentro.',
      de: 'Keine Shops mit Treffen.'
    },
    'department_instruction': {
      fr: 'Choisissez votre département',
      en: 'Choose your department',
      it: 'Scegli la tua regione',
      es: 'Elige tu provincia',
      de: 'Wählen Sie Ihr Bundesland'
    },
    'select_department': {
      fr: 'Sélectionnez un département :',
      en: 'Select a department:',
      it: 'Seleziona una regione:',
      es: 'Selecciona una provincia:',
      de: 'Wählen Sie ein Bundesland:'
    },
    'service_label': {
      fr: 'Service',
      en: 'Service',
      it: 'Servizio',
      es: 'Servicio',
      de: 'Service'
    },
    'country_label': {
      fr: 'Pays',
      en: 'Country',
      it: 'Paese',
      es: 'País',
      de: 'Land'
    },
    'department_label': {
      fr: 'Département',
      en: 'Department',
      it: 'Regione',
      es: 'Provincia',
      de: 'Bundesland'
    },
    'shops_in_department': {
      fr: 'boutiques dans',
      en: 'shops in',
      it: 'negozi in',
      es: 'tiendas en',
      de: 'Shops in'
    },
    'no_shops_in_department': {
      fr: 'Aucune boutique disponible dans ce département.',
      en: 'No shops available in this department.',
      it: 'Nessun negozio disponibile in questa regione.',
      es: 'No hay tiendas disponibles en esta provincia.',
      de: 'Keine Shops in diesem Bundesland verfügbar.'
    },
    'shops_found_country': {
      fr: 'boutiques trouvées',
      en: 'shops found',
      it: 'negozi trovati',
      es: 'tiendas encontradas',
      de: 'Shops gefunden'
    },
    'no_shops_country': {
      fr: 'Aucune boutique disponible pour',
      en: 'No shops available for',
      it: 'Nessun negozio disponibile per',
      es: 'No hay tiendas disponibles para',
      de: 'Keine Shops verfügbar für'
    },

    // === NOUVELLES TRADUCTIONS DÉPARTEMENTS ===
    'country_required_title': {
      fr: '🚫 Pays requis',
      en: '🚫 Country Required',
      it: '🚫 Paese Richiesto',
      es: '🚫 País Requerido',
      de: '🚫 Land Erforderlich'
    },
    'country_required_message': {
      fr: 'Vous devez d\'abord sélectionner un pays !',
      en: 'You must first select a country!',
      it: 'Devi prima selezionare un paese!',
      es: '¡Primero debes seleccionar un país!',
      de: 'Sie müssen zuerst ein Land auswählen!'
    },
    'country_required_instruction': {
      fr: 'Retournez au menu et choisissez un pays avant de sélectionner',
      en: 'Go back to the menu and choose a country before selecting',
      it: 'Torna al menu e scegli un paese prima di selezionare',
      es: 'Vuelve al menú y elige un país antes de seleccionar',
      de: 'Gehen Sie zurück zum Menü und wählen Sie ein Land vor der Auswahl'
    },
    'departments_available_title': {
      fr: '📍 DÉPARTEMENTS DISPONIBLES',
      en: '📍 AVAILABLE DEPARTMENTS',
      it: '📍 REGIONI DISPONIBILI',
      es: '📍 PROVINCIAS DISPONIBLES',
      de: '📍 VERFÜGBARE BUNDESLÄNDER'
    },
    'departments_click_instruction': {
      fr: 'Cliquez sur un département:',
      en: 'Click on a department:',
      it: 'Clicca su una regione:',
      es: 'Haz clic en una provincia:',
      de: 'Klicken Sie auf ein Bundesland:'
    },
    'service_delivery_name': {
      fr: 'Livraison',
      en: 'Delivery',
      it: 'Consegna',
      es: 'Entrega',
      de: 'Lieferung'
    },
    'service_meetup_name': {
      fr: 'Meetup',
      en: 'Meetup',
      it: 'Incontro',
      es: 'Encuentro',
      de: 'Treffen'
    },

    // === TITRES SYSTÈME ===
    'list_plugs_title': {
      fr: '🔌 Liste des Plugs',
      en: '🔌 Plugs List',
      it: '🔌 Lista Negozi',
      es: '🔌 Lista de Tiendas',
      de: '🔌 Shop-Liste'
    },
    'sorted_by_votes_subtitle': {
      fr: '(Triés par nombre de votes)',
      en: '(Sorted by number of votes)',
      it: '(Ordinati per numero di voti)',
      es: '(Ordenados por número de votos)',
      de: '(Sortiert nach Anzahl der Stimmen)'
    },

    // === BOUTIQUE WEB ===
    'shop.title': {
      fr: 'FINDYOURPLUG',
      en: 'FINDYOURPLUG',
      it: 'FINDYOURPLUG',
      es: 'FINDYOURPLUG',
      de: 'FINDYOURPLUG'
    },
    'shop.loading': {
      fr: 'Chargement...',
      en: 'Loading...',
      it: 'Caricamento...',
      es: 'Cargando...',
      de: 'Laden...'
    },
    'shop.search': {
      fr: 'Rechercher',
      en: 'Search',
      it: 'Cerca',
      es: 'Buscar',
      de: 'Suchen'
    },
    'shop.home': {
      fr: 'Accueil',
      en: 'Home',
      it: 'Casa',
      es: 'Inicio',
      de: 'Startseite'
    },
    'shop.vip': {
      fr: 'VIP',
      en: 'VIP',
      it: 'VIP',
      es: 'VIP',
      de: 'VIP'
    },
    'shop.likes': {
      fr: 'votes',
      en: 'votes',
      it: 'voti',
      es: 'votos',
      de: 'Stimmen'
    }
  }
};

// Fonction pour obtenir la traduction
const getTranslation = (key, language = 'fr', customTranslations = null) => {
  // Vérifier d'abord les traductions personnalisées
  if (customTranslations && customTranslations.has && customTranslations.has(key)) {
    const customTrans = customTranslations.get(key);
    if (customTrans && customTrans.get && customTrans.get(language)) {
      return customTrans.get(language);
    }
  }
  
  // Fallback vers les traductions par défaut
  const defaultTrans = translations.defaultTranslations[key];
  if (defaultTrans && defaultTrans[language]) {
    return defaultTrans[language];
  }
  
  // Fallback vers français si langue pas trouvée
  if (defaultTrans && defaultTrans.fr) {
    return defaultTrans.fr;
  }
  
  // Fallback final : retourner la clé
  return key;
};

// Fonction pour créer le clavier de sélection de langue
const createLanguageKeyboard = (currentLanguage = 'fr') => {
  try {
    const { Markup } = require('telegraf');
    const buttons = [];
    
    // Vérifier que les traductions existent
    if (!translations || !translations.languages) {
      console.error('❌ Traductions non disponibles pour le clavier de langue');
      // Retourner un clavier minimal en cas d'erreur
      return Markup.inlineKeyboard([
        [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
        [Markup.button.callback('🇬🇧 English', 'lang_en')]
      ]);
    }
    
    console.log(`🌍 Création clavier langue, langue actuelle: ${currentLanguage}`);
    
    // Première ligne : drapeaux des langues
    const flagRow = [];
    Object.entries(translations.languages).forEach(([code, lang]) => {
      if (lang && lang.flag && lang.name) {
        const isSelected = code === currentLanguage;
        // Format: ✅ 🇫🇷 Français ou 🇫🇷 Français
        const buttonText = isSelected ? `✅ ${lang.flag} ${lang.name}` : `${lang.flag} ${lang.name}`;
        flagRow.push(Markup.button.callback(buttonText, `lang_${code}`));
        console.log(`🔤 Langue ${code}: ${buttonText} (sélectionnée: ${isSelected})`);
      }
    });
    
    // Vérifier qu'on a au moins un bouton
    if (flagRow.length === 0) {
      console.error('❌ Aucune langue disponible pour le clavier');
      // Retourner un clavier minimal en cas d'erreur
      return Markup.inlineKeyboard([
        [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
        [Markup.button.callback('🇬🇧 English', 'lang_en')]
      ]);
    }
    
    // Grouper par 2 boutons par ligne pour plus de lisibilité
    for (let i = 0; i < flagRow.length; i += 2) {
      buttons.push(flagRow.slice(i, i + 2));
    }
    
    // PLUS DE BOUTONS DE NAVIGATION - seulement les langues
    
    console.log(`✅ Clavier langue créé avec ${flagRow.length} langues`);
    return Markup.inlineKeyboard(buttons);
    
  } catch (error) {
    console.error('❌ Erreur création clavier langue:', error);
    // Retourner un clavier minimal en cas d'erreur
    return Markup.inlineKeyboard([
      [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
      [Markup.button.callback('🇬🇧 English', 'lang_en')]
    ]);
  }
};

// Fonction pour initialiser les traductions par défaut
const initializeDefaultTranslations = async (Config) => {
  try {
    console.log('🌍 Initialisation des traductions...');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Config non trouvée pour initialiser traductions');
      return;
    }

    // Initialiser la structure languages si elle n'existe pas
    if (!config.languages) {
      config.languages = {
        enabled: true, // Activer par défaut
        currentLanguage: 'fr',
        availableLanguages: Object.entries(translations.languages).map(([code, lang]) => ({
          code,
          name: lang.name,
          flag: lang.flag,
          enabled: true
        })),
        translations: new Map()
      };
    }
    
    // Ajouter toutes les traductions par défaut - SANS POINTS DANS LES CLÉS
    Object.entries(translations.defaultTranslations).forEach(([key, langs]) => {
      // Convertir les clés avec points en clés avec underscores si nécessaire
      const cleanKey = key.replace(/\./g, '_');
      
      if (!config.languages.translations.has(cleanKey)) {
        const langMap = new Map();
        Object.entries(langs).forEach(([langCode, text]) => {
          langMap.set(langCode, text);
        });
        config.languages.translations.set(cleanKey, langMap);
      }
    });
    
    await config.save();
    console.log('✅ Traductions par défaut initialisées');
    
  } catch (error) {
    console.error('❌ Erreur initialisation traductions:', error);
    console.log('✅ Traductions initialisées'); // Continuer même en cas d'erreur
  }
};

// Fonction pour traduire automatiquement les descriptions en utilisant les traductions de la DB
const translateDescription = (description, language = 'fr', translations = null) => {
  if (!description || language === 'fr') {
    return description; // Retourner tel quel si français ou vide
  }

  // Si des traductions automatiques sont disponibles, les utiliser
  if (translations && translations.description && translations.description[language]) {
    return translations.description[language];
  }

  // Fallback : dictionnaire de traductions pour mots/phrases communes
  const fallbackTranslations = {
    en: {
      'livraison': 'delivery',
      'meetup': 'meetup', 
      'envoi postal': 'postal shipping',
      'rapide': 'fast',
      'qualité': 'quality',
      'service': 'service',
      'disponible': 'available',
      'partout': 'everywhere',
      'partout en': 'everywhere in',
      'en france': 'in france',
      'et belgique': 'and belgium',
      'vers la': 'to',
      'france': 'france',
      'belgique': 'belgium',
      'suisse': 'switzerland',
      'luxembourg': 'luxembourg',
      'boutique': 'shop',
      'produits': 'products',
      'commande': 'order',
      'professionnel': 'professional'
    },
    it: {
      'livraison': 'consegna',
      'meetup': 'incontro',
      'envoi postal': 'spedizione postale',
      'rapide': 'veloce',
      'qualité': 'qualità',
      'service': 'servizio',
      'disponible': 'disponibile',
      'partout': 'ovunque',
      'partout en': 'ovunque in',
      'en france': 'in francia',
      'et belgique': 'e belgio',
      'vers la': 'verso la',
      'france': 'francia',
      'belgique': 'belgio',
      'suisse': 'svizzera',
      'luxembourg': 'lussemburgo',
      'boutique': 'negozio',
      'prodotti': 'prodotti',
      'commande': 'ordine',
      'professionnel': 'professionale'
    },
    es: {
      'livraison': 'entrega',
      'meetup': 'encuentro',
      'envoi postal': 'envío postal',
      'rapide': 'rápido',
      'qualité': 'calidad',
      'service': 'servicio',
      'disponible': 'disponible',
      'partout': 'en todas partes',
      'partout en': 'en todas partes de',
      'en france': 'en francia',
      'et belgique': 'y bélgica',
      'vers la': 'hacia',
      'france': 'francia',
      'belgique': 'bélgica',
      'suisse': 'suiza',
      'luxembourg': 'luxemburgo',
      'boutique': 'tienda',
      'produits': 'productos',
      'commande': 'pedido',
      'professionnel': 'profesional'
    },
    de: {
      'livraison': 'lieferung',
      'meetup': 'treffen',
      'envoi postal': 'postversand',
      'rapide': 'schnell',
      'qualité': 'qualität',
      'service': 'service',
      'disponible': 'verfügbar',
      'partout': 'überall',
      'partout en': 'überall in',
      'en france': 'in frankreich',
      'et belgique': 'und belgien',
      'vers la': 'nach',
      'france': 'frankreich',
      'belgique': 'belgien',
      'suisse': 'schweiz',
      'luxembourg': 'luxemburg',
      'boutique': 'shop',
      'produits': 'produkte',
      'commande': 'bestellung',
      'professionnel': 'professionell'
    }
  };

  if (!fallbackTranslations[language]) {
    return description; // Langue non supportée
  }

  let translatedText = description.toLowerCase();
  const langDict = fallbackTranslations[language];

  // Remplacer chaque mot/phrase
  Object.entries(langDict).forEach(([french, translated]) => {
    const regex = new RegExp(`\\b${french}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translated);
  });

  // Capitaliser la première lettre
  return translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
};

// Fonction pour traduire les noms de boutiques
const translateShopName = (name, language = 'fr', translations = null) => {
  if (!name || language === 'fr') {
    return name;
  }

  // Si des traductions automatiques sont disponibles, les utiliser
  if (translations && translations.name && translations.name[language]) {
    return translations.name[language];
  }

  // Fallback sur le nom original
  return name;
};

// Fonction pour traduire les descriptions de services
const translateServiceDescription = (description, language = 'fr', translations = null, serviceType = 'delivery') => {
  if (!description || language === 'fr') {
    return description;
  }

  // Si des traductions automatiques sont disponibles, les utiliser
  if (translations && translations.services && translations.services[serviceType] && 
      translations.services[serviceType].description && translations.services[serviceType].description[language]) {
    return translations.services[serviceType].description[language];
  }

  // Fallback sur translateDescription
  return translateDescription(description, language);
};

// Export
module.exports = {
  translations,
  getTranslation,
  createLanguageKeyboard,
  initializeDefaultTranslations,
  translateDescription,
  translateShopName,
  translateServiceDescription
};