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
      fr: '🔝 Top Des Plugs',
      en: '🔝 Top Plugs',
      it: '🔝 Top Negozi',
      es: '🔝 Top Tiendas',
      de: '🔝 Top Shops'
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
      de: 'ℹ️ Informationen'
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
      fr: 'Contactez-nous pour plus d\'informations !\n\nNotre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans vos démarches.',
      en: 'Contact us for more information!\n\nOur team is available to answer all your questions and assist you with your needs.',
      it: 'Contattaci per maggiori informazioni!\n\nIl nostro team è disponibile per rispondere a tutte le tue domande e assisterti nelle tue necessità.',
      es: '¡Contáctanos para más información!\n\nNuestro equipo está disponible para responder todas tus preguntas y ayudarte con tus necesidades.',
      de: 'Kontaktieren Sie uns für weitere Informationen!\n\nUnser Team steht zur Verfügung, um alle Ihre Fragen zu beantworten und Sie bei Ihren Bedürfnissen zu unterstützen.'
    },
    'contact_us_text': {
      fr: 'Nous contacter',
      en: 'Contact us',
      it: 'Contattaci',
      es: 'Contáctanos',
      de: 'Kontakt'
    },
    'info_default_text': {
      fr: 'Découvrez notre plateforme premium.\n\nNous proposons des services de qualité avec une interface moderne et intuitive. Rejoignez notre communauté pour accéder à des fonctionnalités exclusives.',
      en: 'Discover our premium platform.\n\nWe offer quality services with a modern and intuitive interface. Join our community to access exclusive features.',
      it: 'Scopri la nostra piattaforma premium.\n\nOffriamo servizi di qualità con un\'interfaccia moderna e intuitiva. Unisciti alla nostra comunità per accedere a funzionalità esclusive.',
      es: 'Descubre nuestra plataforma premium.\n\nOfrecemos servicios de calidad con una interfaz moderna e intuitiva. Únete a nuestra comunidad para acceder a funciones exclusivas.',
      de: 'Entdecken Sie unsere Premium-Plattform.\n\nWir bieten qualitativ hochwertige Dienstleistungen mit einer modernen und intuitiven Benutzeroberfläche. Treten Sie unserer Community bei, um auf exklusive Funktionen zuzugreifen.'
    },
    'menu_becomeDealer': {
      fr: '📋 Inscription',
      en: '📋 Registration',
      it: '📋 Registrazione',
      es: '📋 Registro',
      de: '📋 Registrierung'
    },
    'menu_language': {
      fr: '🌍 Langue',
      en: '🌍 Language',
      it: '🌍 Lingua',
      es: '🌍 Idioma',
      de: '🌍 Sprache'
    },
    'menu_translation': {
      fr: '🗣️ Changer de langue',
      en: '🗣️ Change language',
      it: '🗣️ Cambia lingua',
      es: '🗣️ Cambiar idioma',
      de: '🗣️ Sprache ändern'
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
      fr: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      en: 'FINDYOURPLUG\nTELEGRAM MINI-APP\nCHILL',
      it: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      es: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      de: 'FINDYOURPLUG\nTELEGRAM MINI-APP\nCHILL'
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

    // === FORMULAIRE ÉTAPES DÉTAILLÉES ===
    'registration.step2': {
      fr: '🟦 Étape 2 : Lien Telegram',
      en: '🟦 Step 2: Telegram Link',
      it: '🟦 Fase 2: Link Telegram',
      es: '🟦 Paso 2: Enlace de Telegram',
      de: '🟦 Schritt 2: Telegram-Link'
    },
    'registration.step3': {
      fr: '🟦 Étape 3 : Lien Canal Telegram',
      en: '🟦 Step 3: Telegram Channel Link',
      it: '🟦 Fase 3: Link Canale Telegram',
      es: '🟦 Paso 3: Enlace del Canal de Telegram',
      de: '🟦 Schritt 3: Telegram-Kanal-Link'
    },
    'registration.step4': {
      fr: '🟦 Étape 4 : Lien Instagram',
      en: '🟦 Step 4: Instagram Link',
      it: '🟦 Fase 4: Link Instagram',
      es: '🟦 Paso 4: Enlace de Instagram',
      de: '🟦 Schritt 4: Instagram-Link'
    },
    'registration.telegramQuestion': {
      fr: '🔗 Entrez votre lien Telegram (format : @username ou https://t.me/username)',
      en: '🔗 Enter your Telegram link (format: @username or https://t.me/username)',
      it: '🔗 Inserisci il tuo link Telegram (formato: @username o https://t.me/username)',
      es: '🔗 Introduce tu enlace de Telegram (formato: @username o https://t.me/username)',
      de: '🔗 Geben Sie Ihren Telegram-Link ein (Format: @username oder https://t.me/username)'
    },
    'registration.telegramChannelQuestion': {
      fr: '🔗 Entrez le lien de votre **canal Telegram** (format : https://t.me/username)',
      en: '🔗 Enter your **Telegram channel** link (format: https://t.me/username)',
      it: '🔗 Inserisci il link del tuo **canale Telegram** (formato: https://t.me/username)',
      es: '🔗 Introduce el enlace de tu **canal de Telegram** (formato: https://t.me/username)',
      de: '🔗 Geben Sie den Link zu Ihrem **Telegram-Kanal** ein (Format: https://t.me/username)'
    },
    'registration.instagramQuestion': {
      fr: '📸 Entrez votre lien Instagram (https://www.instagram.com/username)',
      en: '📸 Enter your Instagram link (https://www.instagram.com/username)',
      it: '📸 Inserisci il tuo link Instagram (https://www.instagram.com/username)',
      es: '📸 Introduce tu enlace de Instagram (https://www.instagram.com/username)',
      de: '📸 Geben Sie Ihren Instagram-Link ein (https://www.instagram.com/username)'
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
      fr: '🟦 Étape 5 : Potato Chat',
      en: '🟦 Step 5: Potato Chat',
      it: '🟦 Fase 5: Potato Chat',
      es: '🟦 Paso 5: Potato Chat',
      de: '🟦 Schritt 5: Potato Chat'
    },
    'registration.step6': {
      fr: '🟦 Étape 6 : Snapchat',
      en: '🟦 Step 6: Snapchat',
      it: '🟦 Fase 6: Snapchat',
      es: '🟦 Paso 6: Snapchat',
      de: '🟦 Schritt 6: Snapchat'
    },
    'registration.step7': {
      fr: '🟦 Étape 7 : WhatsApp',
      en: '🟦 Step 7: WhatsApp',
      it: '🟦 Fase 7: WhatsApp',
      es: '🟦 Paso 7: WhatsApp',
      de: '🟦 Schritt 7: WhatsApp'
    },
    'registration.step8': {
      fr: '🟦 Étape 8 : Signal',
      en: '🟦 Step 8: Signal',
      it: '🟦 Fase 8: Signal',
      es: '🟦 Paso 8: Signal',
      de: '🟦 Schritt 8: Signal'
    },
    'registration.step9': {
      fr: '🟦 Étape 9 : Session',
      en: '🟦 Step 9: Session',
      it: '🟦 Fase 9: Session',
      es: '🟦 Paso 9: Session',
      de: '🟦 Schritt 9: Session'
    },
    'registration.step10': {
      fr: '🟦 Étape 10 : Threema',
      en: '🟦 Step 10: Threema',
      it: '🟦 Fase 10: Threema',
      es: '🟦 Paso 10: Threema',
      de: '🟦 Schritt 10: Threema'
    },
    'registration.step11': {
      fr: '🟦 Étape 11 : Bot Telegram',
      en: '🟦 Step 11: Telegram Bot',
      it: '🟦 Fase 11: Bot Telegram',
      es: '🟦 Paso 11: Bot Telegram',
      de: '🟦 Schritt 11: Telegram Bot'
    },
    'registration.step12': {
      fr: '🟦 Étape 12 : Pays de service',
      en: '🟦 Step 12: Service country',
      it: '🟦 Fase 12: Paese di servizio',
      es: '🟦 Paso 12: País de servicio',
      de: '🟦 Schritt 12: Service-Land'
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
      fr: '🥔 Entrez votre lien Potato Chat (https://potato.chat/username)',
      en: '🥔 Enter your Potato Chat link (https://potato.chat/username)',
      it: '🥔 Inserisci il tuo link Potato Chat (https://potato.chat/username)',
      es: '🥔 Introduce tu enlace de Potato Chat (https://potato.chat/username)',
      de: '🥔 Geben Sie Ihren Potato Chat-Link ein (https://potato.chat/username)'
    },
    'registration.snapchatQuestion': {
      fr: '👻 Entrez votre lien Snapchat (https://www.snapchat.com/add/username)',
      en: '👻 Enter your Snapchat link (https://www.snapchat.com/add/username)',
      it: '👻 Inserisci il tuo link Snapchat (https://www.snapchat.com/add/username)',
      es: '👻 Introduce tu enlace de Snapchat (https://www.snapchat.com/add/username)',
      de: '👻 Geben Sie Ihren Snapchat-Link ein (https://www.snapchat.com/add/username)'
    },
    'registration.whatsappQuestion': {
      fr: '💬 Entrez votre lien WhatsApp (https://wa.me/votre_numero)',
      en: '💬 Enter your WhatsApp link (https://wa.me/your_number)',
      it: '💬 Inserisci il tuo link WhatsApp (https://wa.me/tuo_numero)',
      es: '💬 Introduce tu enlace de WhatsApp (https://wa.me/tu_numero)',
      de: '💬 Geben Sie Ihren WhatsApp-Link ein (https://wa.me/ihre_nummer)'
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
      fr: '🔐 Entrez votre lien Threema (https://threema.id/votre_id)',
      en: '🔐 Enter your Threema link (https://threema.id/your_id)',
      it: '🔐 Inserisci il tuo link Threema (https://threema.id/tuo_id)',
      es: '🔐 Introduce tu enlace de Threema (https://threema.id/tu_id)',
      de: '🔐 Geben Sie Ihren Threema-Link ein (https://threema.id/ihre_id)'
    },
    'registration.telegramBotQuestion': {
      fr: '🤖 As-tu un bot Telegram pour ta boutique ?',
      en: '🤖 Do you have a Telegram bot for your shop?',
      it: '🤖 Hai un bot Telegram per il tuo negozio?',
      es: '🤖 ¿Tienes un bot de Telegram para tu tienda?',
      de: '🤖 Haben Sie einen Telegram-Bot für Ihren Shop?'
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
      fr: '📸 Envoie une photo de ta boutique',
      en: '📸 Send a photo of your shop',
      it: '📸 Invia una foto del tuo negozio',
      es: '📸 Envía una foto de tu tienda',
      de: '📸 Senden Sie ein Foto Ihres Shops'
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

    // === ERREURS SPÉCIFIQUES RÉSEAUX ===
    'registration.error.potatoFormat': {
      fr: '❌ Merci de fournir un lien Potato Chat valide (ex: https://potato.chat/username). Réessaie :',
      en: '❌ Please provide a valid Potato Chat link (ex: https://potato.chat/username). Try again:',
      it: '❌ Fornisci un link Potato Chat valido (es: https://potato.chat/username). Riprova:',
      es: '❌ Proporciona un enlace de Potato Chat válido (ej: https://potato.chat/username). Inténtalo de nuevo:',
      de: '❌ Bitte geben Sie einen gültigen Potato Chat-Link an (z.B.: https://potato.chat/username). Versuchen Sie es erneut:'
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

    // === NAVIGATION ===
    'back_to_filters': {
      fr: 'Retour aux filtres',
      en: 'Back to filters',
      it: 'Torna ai filtri',
      es: 'Volver a filtros',
      de: 'Zurück zu Filtern'
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
    'total_shops': {
      fr: 'Total',
      en: 'Total',
      it: 'Totale',
      es: 'Total',
      de: 'Gesamt'
    },
    'shops_word': {
      fr: 'boutiques',
      en: 'shops',
      it: 'negozi',
      es: 'tiendas',
      de: 'Shops'
    },

    // === MESSAGES TOP PLUGS ===
    'messages_sortedByVotes': {
      fr: 'Triés par nombre de votes',
      en: 'Sorted by number of votes',
      it: 'Ordinati per numero di voti',
      es: 'Ordenados por número de votos',
      de: 'Sortiert nach Anzahl der Stimmen'
    },
    'messages_welcome': {
      fr: '👋 Bienvenue sur FindYourPlug !',
      en: '👋 Welcome to FindYourPlug!',
      it: '👋 Benvenuto su FindYourPlug!',
      es: '👋 ¡Bienvenido a FindYourPlug!',
      de: '👋 Willkommen bei FindYourPlug!'
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

// Fonction pour traduire automatiquement les descriptions
const translateDescription = (description, language = 'fr') => {
  if (!description || language === 'fr') {
    return description; // Retourner tel quel si français ou vide
  }

  // Dictionnaire de traductions pour mots/phrases communes
  const translations = {
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

  if (!translations[language]) {
    return description; // Langue non supportée
  }

  let translatedText = description.toLowerCase();
  const langDict = translations[language];

  // Remplacer chaque mot/phrase
  Object.entries(langDict).forEach(([french, translated]) => {
    const regex = new RegExp(`\\b${french}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translated);
  });

  // Capitaliser la première lettre
  return translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
};

// Export
module.exports = {
  translations,
  getTranslation,
  createLanguageKeyboard,
  initializeDefaultTranslations,
  translateDescription
};