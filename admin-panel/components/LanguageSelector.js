import { useState, useEffect, useCallback } from 'react'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
}

const translations = {
  fr: {
    title: 'Langue',
    home: 'Accueil',
    search: 'Recherche...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votes',
    delivery: 'Livraison',
    postal: 'Postal',
    meetup: 'Meetup',
    loading: 'Chargement',
    loading_shop: 'Chargement de la boutique',
    loading_vip: 'Chargement des boutiques VIP',
    shop_not_found: 'Boutique non trouvée',
    shop_not_found_desc: 'Cette boutique n\'existe pas ou a été supprimée.',
    back_to_shops: 'Retour aux boutiques',
    back: 'Retour',
    countries: 'Pays',
    type: 'Type',
    location: 'Localisation',
    available_services: 'Services disponibles',
    available: 'Disponible',
    not_available: 'Non disponible',
    social_media: 'Réseaux sociaux',
    additional_info: 'Informations complémentaires',
    vip_desc: 'Boutiques VIP exclusives',
    no_vip_shops: 'Aucune boutique VIP',
    no_vip_shops_desc: 'Aucune boutique VIP n\'est disponible pour le moment.',
    vip_shops_available: 'Boutiques VIP disponibles',
    vote_added: 'Vote ajouté',
    has_now: 'a maintenant',
    likes: 'likes',
    error_voting: 'Erreur lors du vote',
    error_connection: 'Erreur de connexion',
    no_shops_found: 'Aucune boutique trouvée',
    all_countries: 'Tous les pays',
    all_services: 'Tous les services',
    all_types: 'Tous les types',
    standard: 'Standard',
    found: 'trouvée(s)',
    shops: 'boutiques',
    search_desc: 'Recherchez vos boutiques préférées par nom, pays ou service',
    search_placeholder: 'Rechercher une boutique',
    only: 'uniquement',
    reset: 'Réinitialiser',
    searching: 'Recherche en cours',
    try_different_criteria: 'Essayez de modifier vos critères de recherche',
    // Traductions manquantes importantes
    noShops: 'Aucune boutique trouvée',
    refreshing: 'Actualisation des données...',
    updated_at: 'Actualisé à',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'INSCRIPTION',
    inscription_join_title: 'Rejoignez FindYourPlug',
    inscription_description: 'Inscrivez-vous directement via notre bot Telegram pour accéder à toutes les boutiques',
    inscription_button: 'S\'inscrire maintenant',
    services_title: 'SERVICES',
    services_frustrated_title: 'T\'en as marre que ton canal saute ?',
    services_solution_text: 'On a LA solution !',
    services_discover_text: 'Découvre notre offre exclusive',
    services_order_button: 'Commander maintenant',
    telegram_links_title: 'Gestion des Liens Telegram',
    telegram_links_description: 'Configurez les liens Telegram utilisés sur les pages d\'inscription et de services.',
    telegram_links_inscription_label: 'Lien Telegram - Page d\'inscription',
    telegram_links_services_label: 'Lien Telegram - Page de services',
    telegram_links_inscription_desc: 'Ce lien sera utilisé sur la page d\'inscription pour rediriger vers le bot Telegram.',
    telegram_links_services_desc: 'Ce lien sera utilisé sur la page de services pour rediriger vers le bot Telegram.',
    telegram_links_test: 'Tester',
    telegram_links_save: 'Sauvegarder',
    telegram_links_saving: 'Sauvegarde...',
    telegram_links_refresh: 'Actualiser',
    telegram_links_info_title: 'Informations',
    telegram_links_info_1: 'Les liens doivent être des URLs Telegram valides (format: https://t.me/username)',
    telegram_links_info_2: 'Les modifications sont appliquées immédiatement sur les pages publiques',
    telegram_links_info_3: 'Utilisez le bouton "Tester" pour vérifier que les liens fonctionnent',
    telegram_links_info_4: 'Les liens par défaut pointent vers @FindYourPlugBot',
    // Traductions pour les sections d'inscription
    inscription_why_title: 'Pourquoi s\'inscrire ?',
    inscription_why_access: 'Accès à toutes les boutiques',
    inscription_why_votes: 'Système de votes et avis',
    inscription_why_location: 'Recherche par localisation',
    inscription_why_delivery: 'Services de livraison',
    inscription_why_interface: 'Interface simple et rapide',
    inscription_why_notifications: 'Notifications en temps réel',
    inscription_why_visibility: 'Ça offre + de visibilité',
    // Traductions pour la page shop - textes de bienvenue
    shop_welcome_title: '👋 Bienvenue sur FindYourPlug',
    shop_welcome_search: '🔍 Utilisez la barre de recherche pour trouver un plug près de chez vous ou en envoi postal',
    shop_welcome_vote: '⭐ N\'hésitez pas à voter pour votre Plug préféré',
    shop_social_title: 'Rejoins nous sur tous nos réseaux 🔒🛜',
    // Traductions pour les pages VIP et autres
    no_vip_shops: 'Aucune boutique VIP',
    no_vip_shops_desc: 'Aucune boutique VIP n\'est disponible pour le moment.',
    inscription_how_title: 'Comment ça marche ?',
    inscription_how_step1: 'Cliquez sur "S\'inscrire maintenant"',
    inscription_how_step2: 'Vous serez redirigé vers Telegram',
    inscription_how_step3: 'Tapez /start dans le bot',
    inscription_how_step4: 'Suivez les instructions d\'inscription',
    inscription_how_step5: 'Profitez de FindYourPlug !',
    // Traductions pour les services
    services_bot_title: 'Bot Telegram + MiniApp',
    services_bot_price: '500€',
    services_bot_subtitle: 'Solution complète clé en main',
    services_bot_menu: 'Menu boutique intégré',
    services_bot_menu_desc: 'Tes clients consultent ton menu directement sur ton bot',
    services_bot_clients: 'Conserve tes clients',
    services_bot_clients_desc: 'Plus de perte de clients lors de fermetures de canaux',
    services_bot_miniapp: 'MiniApp moderne',
    services_bot_miniapp_desc: 'Interface web intégrée dans Telegram',
    services_bot_secure: '100% sécurisé',
    services_bot_secure_desc: 'Ton bot t\'appartient, personne peut te le supprimer',
    services_bot_fast: 'Installation rapide',
    services_bot_fast_desc: 'Livré en 48-72h maximum - Voir + en cas de demande spéciale',
    services_bot_design: 'Design personnalisé',
    services_bot_design_desc: 'Couleurs et style adaptés à ton image',
    services_bot_order: 'Commander maintenant',
    services_web_title: 'Site Web Professionnel',
    services_web_price: '800€',
    services_web_subtitle: 'Site web complet et responsive',
    services_web_responsive: 'Responsive design',
    services_web_responsive_desc: 'Site optimisé mobile, tablette et desktop',
    services_web_performance: 'Performance optimisée',
    services_web_performance_desc: 'Chargement rapide et SEO friendly',
    services_web_design: 'Design moderne',
    services_web_design_desc: 'Interface élégante et professionnelle',
    services_web_maintenance: 'Maintenance incluse',
    services_web_maintenance_desc: 'Mises à jour et support technique',
    services_web_analytics: 'Analytics intégrés',
    services_web_analytics_desc: 'Suivi des visiteurs et statistiques',
    services_web_secure: 'Sécurisé',
    services_web_secure_desc: 'Certificat SSL et protection des données',
    services_web_order: 'Commander maintenant',
    // Traductions pour la page recherche
    search_loading: 'Chargement de la recherche...',
    search_select_country_first: 'Sélectionnez un pays d\'abord',
    search_department: 'Département',
    search_all_countries: 'Tous pays',
    search_all_services: 'Tous services',
    search_all_types: 'Tous types',
    search_vip_only: 'VIP uniquement',
    search_standard_only: 'Standard uniquement',
    search_reset_filters: 'Réinitialiser',
    search_no_results: 'Aucun résultat trouvé',
    search_no_results_desc: 'Essayez de modifier vos critères de recherche',
    search_results_count: 'résultats trouvés',
    search_loading_results: 'Chargement des résultats...',
    // Traductions pour la navigation
    nav_inscription: 'S\'inscrire',
    nav_services: 'Services',
    // Traductions pour la page détail boutique
    detail_available_services: 'Services disponibles',
    detail_available: 'Disponible',
    detail_not_available: 'Non disponible'
  },
  en: {
    title: 'Language',
    home: 'Home',
    search: 'Search...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votes',
    delivery: 'Delivery',
    postal: 'Postal',
    meetup: 'Meetup',
    loading: 'Loading',
    loading_shop: 'Loading shop',
    loading_vip: 'Loading VIP shops',
    shop_not_found: 'Shop not found',
    shop_not_found_desc: 'This shop does not exist or has been deleted.',
    back_to_shops: 'Back to shops',
    back: 'Back',
    countries: 'Countries',
    type: 'Type',
    location: 'Location',
    available_services: 'Available services',
    available: 'Available',
    not_available: 'Not available',
    social_media: 'Social media',
    additional_info: 'Additional information',
    vip_desc: 'Exclusive VIP shops',
    no_vip_shops: 'No VIP shops',
    no_vip_shops_desc: 'No VIP shops are available at the moment.',
    vip_shops_available: 'VIP shops available',
    vote_added: 'Vote added',
    has_now: 'now has',
    likes: 'likes',
    error_voting: 'Error voting',
    error_connection: 'Connection error',
    no_shops_found: 'No shops found',
    all_countries: 'All countries',
    all_services: 'All services',
    all_types: 'All types',
    standard: 'Standard',
    found: 'found',
    shops: 'shops',
    search_desc: 'Search your favorite shops by name, country or service',
    search_placeholder: 'Search for a shop',
    only: 'only',
    reset: 'Reset',
    searching: 'Searching',
    try_different_criteria: 'Try modifying your search criteria',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRATION',
    inscription_join_title: 'Join FindYourPlug',
    inscription_description: 'Register directly via our Telegram bot to access all shops',
    inscription_button: 'Register now',
    services_title: 'SERVICES',
    services_frustrated_title: 'Tired of your channel getting banned?',
    services_solution_text: 'We have THE solution!',
    services_discover_text: 'Discover our exclusive offer',
    services_order_button: 'Order now',
    telegram_links_title: 'Telegram Links Management',
    telegram_links_description: 'Configure Telegram links used on registration and services pages.',
    telegram_links_inscription_label: 'Telegram Link - Registration Page',
    telegram_links_services_label: 'Telegram Link - Services Page',
    telegram_links_inscription_desc: 'This link will be used on the registration page to redirect to the Telegram bot.',
    telegram_links_services_desc: 'This link will be used on the services page to redirect to the Telegram bot.',
    telegram_links_test: 'Test',
    telegram_links_save: 'Save',
    telegram_links_saving: 'Saving...',
    telegram_links_refresh: 'Refresh',
    telegram_links_info_title: 'Information',
    telegram_links_info_1: 'Links must be valid Telegram URLs (format: https://t.me/username)',
    telegram_links_info_2: 'Changes are applied immediately on public pages',
    telegram_links_info_3: 'Use the "Test" button to verify that links work',
    telegram_links_info_4: 'Default links point to @FindYourPlugBot',
    // Traductions pour les sections d'inscription
    inscription_why_title: 'Why register?',
    inscription_why_access: 'Access to all shops',
    inscription_why_votes: 'Voting and review system',
    inscription_why_location: 'Location-based search',
    inscription_why_delivery: 'Delivery services',
    inscription_why_interface: 'Simple and fast interface',
    inscription_why_notifications: 'Real-time notifications',
    inscription_why_visibility: 'Offers + visibility',
    // Traductions pour la page shop - textes de bienvenue
    shop_welcome_title: '👋 Welcome to FindYourPlug',
    shop_welcome_search: '🔍 Use the search bar to find a plug near you or for postal delivery',
    shop_welcome_vote: '⭐ Don\'t hesitate to vote for your favorite Plug',
    shop_social_title: 'Join us on all our networks 🔒🛜',
    // Traductions pour les pages VIP et autres
    no_vip_shops: 'No VIP shops',
    no_vip_shops_desc: 'No VIP shops are available at the moment.',
    inscription_how_title: 'How does it work?',
    inscription_how_step1: 'Click on "Register now"',
    inscription_how_step2: 'You will be redirected to Telegram',
    inscription_how_step3: 'Type /start in the bot',
    inscription_how_step4: 'Follow the registration instructions',
    inscription_how_step5: 'Enjoy FindYourPlug!',
    // Traductions pour les services
    services_bot_title: 'Telegram Bot + MiniApp',
    services_bot_price: '500€',
    services_bot_subtitle: 'Complete turnkey solution',
    services_bot_menu: 'Integrated shop menu',
    services_bot_menu_desc: 'Your customers consult your menu directly on your bot',
    services_bot_clients: 'Keep your customers',
    services_bot_clients_desc: 'No customer loss due to channel closures',
    services_bot_miniapp: 'Modern MiniApp',
    services_bot_miniapp_desc: 'Web interface integrated in Telegram',
    services_bot_secure: '100% secure',
    services_bot_secure_desc: 'Your bot belongs to you, no one can delete it',
    services_bot_fast: 'Quick installation',
    services_bot_fast_desc: 'Delivered in 48-72h maximum - See + for special request',
    services_bot_design: 'Custom design',
    services_bot_design_desc: 'Colors and style adapted to your image',
    services_bot_order: 'Order now',
    services_web_title: 'Professional Website',
    services_web_price: '800€',
    services_web_subtitle: 'Complete and responsive website',
    services_web_responsive: 'Responsive design',
    services_web_responsive_desc: 'Site optimized for mobile, tablet and desktop',
    services_web_performance: 'Optimized performance',
    services_web_performance_desc: 'Fast loading and SEO friendly',
    services_web_design: 'Modern design',
    services_web_design_desc: 'Elegant and professional interface',
    services_web_maintenance: 'Maintenance included',
    services_web_maintenance_desc: 'Updates and technical support',
    services_web_analytics: 'Integrated analytics',
    services_web_analytics_desc: 'Visitor tracking and statistics',
    services_web_secure: 'Secure',
    services_web_secure_desc: 'SSL certificate and data protection',
    services_web_order: 'Order now',
    // Traductions pour la page recherche
    search_loading: 'Loading search...',
    search_select_country_first: 'Select a country first',
    search_department: 'Department',
    search_all_countries: 'All countries',
    search_all_services: 'All services',
    search_all_types: 'All types',
    search_vip_only: 'VIP only',
    search_standard_only: 'Standard only',
    search_reset_filters: 'Reset',
    search_no_results: 'No results found',
    search_no_results_desc: 'Try modifying your search criteria',
    search_results_count: 'results found',
    search_loading_results: 'Loading results...',
    // Traductions pour la navigation
    nav_inscription: 'Register',
    nav_services: 'Services',
    // Traductions pour la page détail boutique
    detail_available_services: 'Available services',
    detail_available: 'Available',
    detail_not_available: 'Not available',
    // Traductions manquantes importantes
    noShops: 'No shops found',
    refreshing: 'Refreshing data...',
    updated_at: 'Updated at'
  },
  es: {
    title: 'Idioma',
    home: 'Inicio',
    search: 'Buscar...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votos',
    delivery: 'Entrega',
    postal: 'Postal',
    meetup: 'Encuentro',
    loading: 'Cargando',
    loading_shop: 'Cargando tienda',
    loading_vip: 'Cargando tiendas VIP',
    shop_not_found: 'Tienda no encontrada',
    shop_not_found_desc: 'Esta tienda no existe o ha sido eliminada.',
    back_to_shops: 'Volver a las tiendas',
    back: 'Volver',
    countries: 'Países',
    type: 'Tipo',
    location: 'Ubicación',
    available_services: 'Servicios disponibles',
    available: 'Disponible',
    not_available: 'No disponible',
    social_media: 'Redes sociales',
    additional_info: 'Información adicional',
    vip_desc: 'Tiendas VIP exclusivas',
    no_vip_shops: 'Sin tiendas VIP',
    no_vip_shops_desc: 'No hay tiendas VIP disponibles en este momento.',
    vip_shops_available: 'Tiendas VIP disponibles',
    vote_added: 'Voto añadido',
    has_now: 'ahora tiene',
    likes: 'likes',
    error_voting: 'Error al votar',
    error_connection: 'Error de conexión',
    no_shops_found: 'No se encontraron tiendas',
    all_countries: 'Todos los países',
    all_services: 'Todos los servicios',
    all_types: 'Todos los tipos',
    standard: 'Estándar',
    found: 'encontrada(s)',
    shops: 'tiendas',
    search_desc: 'Busca tus tiendas favoritas por nombre, país o servicio',
    search_placeholder: 'Buscar una tienda',
    only: 'solo',
    reset: 'Restablecer',
    searching: 'Buscando',
    try_different_criteria: 'Intenta modificar tus criterios de búsqueda',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRO',
    inscription_join_title: 'Únete a FindYourPlug',
    inscription_description: 'Regístrate directamente a través de nuestro bot de Telegram para acceder a todas las tiendas',
    inscription_button: 'Registrarse ahora',
    services_title: 'SERVICIOS',
    services_frustrated_title: '¿Cansado de que tu canal sea baneado?',
    services_solution_text: '¡Tenemos LA solución!',
    services_discover_text: 'Descubre nuestra oferta exclusiva',
    services_order_button: 'Pedir ahora',
    telegram_links_title: 'Gestión de Enlaces de Telegram',
    telegram_links_description: 'Configura los enlaces de Telegram utilizados en las páginas de registro y servicios.',
    telegram_links_inscription_label: 'Enlace de Telegram - Página de registro',
    telegram_links_services_label: 'Enlace de Telegram - Página de servicios',
    telegram_links_inscription_desc: 'Este enlace se utilizará en la página de registro para redirigir al bot de Telegram.',
    telegram_links_services_desc: 'Este enlace se utilizará en la página de servicios para redirigir al bot de Telegram.',
    telegram_links_test: 'Probar',
    telegram_links_save: 'Guardar',
    telegram_links_saving: 'Guardando...',
    telegram_links_refresh: 'Actualizar',
    telegram_links_info_title: 'Información',
    telegram_links_info_1: 'Los enlaces deben ser URLs de Telegram válidas (formato: https://t.me/username)',
    telegram_links_info_2: 'Los cambios se aplican inmediatamente en las páginas públicas',
    telegram_links_info_3: 'Usa el botón "Probar" para verificar que los enlaces funcionan',
    telegram_links_info_4: 'Los enlaces por defecto apuntan a @FindYourPlugBot',
    // Traductions pour les sections d'inscription
    inscription_why_title: '¿Por qué registrarse?',
    inscription_why_access: 'Acceso a todas las tiendas',
    inscription_why_votes: 'Sistema de votos y reseñas',
    inscription_why_location: 'Búsqueda por ubicación',
    inscription_why_delivery: 'Servicios de entrega',
    inscription_why_interface: 'Interfaz simple y rápida',
    inscription_why_notifications: 'Notificaciones en tiempo real',
    inscription_why_visibility: 'Ofrece + visibilidad',
    // Traductions pour la page shop - textes de bienvenue
    shop_welcome_title: '👋 Bienvenido a FindYourPlug',
    shop_welcome_search: '🔍 Usa la barra de búsqueda para encontrar un plug cerca de ti o para envío postal',
    shop_welcome_vote: '⭐ No dudes en votar por tu Plug favorito',
    shop_social_title: 'Únete a todas nuestras redes 🔒🛜',
    // Traductions pour les pages VIP et autres
    no_vip_shops: 'Sin tiendas VIP',
    no_vip_shops_desc: 'No hay tiendas VIP disponibles en este momento.',
    inscription_how_title: '¿Cómo funciona?',
    inscription_how_step1: 'Haz clic en "Registrarse ahora"',
    inscription_how_step2: 'Serás redirigido a Telegram',
    inscription_how_step3: 'Escribe /start en el bot',
    inscription_how_step4: 'Sigue las instrucciones de registro',
    inscription_how_step5: '¡Disfruta de FindYourPlug!',
    // Traductions pour les services
    services_bot_title: 'Bot de Telegram + MiniApp',
    services_bot_price: '500€',
    services_bot_subtitle: 'Solución completa llave en mano',
    services_bot_menu: 'Menú de tienda integrado',
    services_bot_menu_desc: 'Tus clientes consultan tu menú directamente en tu bot',
    services_bot_clients: 'Conserva tus clientes',
    services_bot_clients_desc: 'Sin pérdida de clientes por cierres de canales',
    services_bot_miniapp: 'MiniApp moderna',
    services_bot_miniapp_desc: 'Interfaz web integrada en Telegram',
    services_bot_secure: '100% seguro',
    services_bot_secure_desc: 'Tu bot te pertenece, nadie puede eliminarlo',
    services_bot_fast: 'Instalación rápida',
    services_bot_fast_desc: 'Entregado en 48-72h máximo - Ver + en caso de solicitud especial',
    services_bot_design: 'Diseño personalizado',
    services_bot_design_desc: 'Colores y estilo adaptados a tu imagen',
    services_bot_order: 'Pedir ahora',
    services_web_title: 'Sitio Web Profesional',
    services_web_price: '800€',
    services_web_subtitle: 'Sitio web completo y responsive',
    services_web_responsive: 'Diseño responsive',
    services_web_responsive_desc: 'Sitio optimizado para móvil, tablet y desktop',
    services_web_performance: 'Rendimiento optimizado',
    services_web_performance_desc: 'Carga rápida y SEO friendly',
    services_web_design: 'Diseño moderno',
    services_web_design_desc: 'Interfaz elegante y profesional',
    services_web_maintenance: 'Mantenimiento incluido',
    services_web_maintenance_desc: 'Actualizaciones y soporte técnico',
    services_web_analytics: 'Analytics integrados',
    services_web_analytics_desc: 'Seguimiento de visitantes y estadísticas',
    services_web_secure: 'Seguro',
    services_web_secure_desc: 'Certificado SSL y protección de datos',
    services_web_order: 'Pedir ahora',
    // Traductions pour la page recherche
    search_loading: 'Cargando búsqueda...',
    search_select_country_first: 'Selecciona un país primero',
    search_department: 'Departamento',
    search_all_countries: 'Todos los países',
    search_all_services: 'Todos los servicios',
    search_all_types: 'Todos los tipos',
    search_vip_only: 'Solo VIP',
    search_standard_only: 'Solo estándar',
    search_reset_filters: 'Restablecer',
    search_no_results: 'No se encontraron resultados',
    search_no_results_desc: 'Intenta modificar tus criterios de búsqueda',
    search_results_count: 'resultados encontrados',
    search_loading_results: 'Cargando resultados...',
    // Traductions pour la navigation
    nav_inscription: 'Registrarse',
    nav_services: 'Servicios',
    // Traductions pour la page détail boutique
    detail_available_services: 'Servicios disponibles',
    detail_available: 'Disponible',
    detail_not_available: 'No disponible',
    // Traductions manquantes importantes
    noShops: 'No se encontraron tiendas',
    refreshing: 'Actualizando datos...',
    updated_at: 'Actualizado a las'
  },
  it: {
    title: 'Lingua',
    home: 'Home',
    search: 'Cerca...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'voti',
    delivery: 'Consegna',
    postal: 'Postale',
    meetup: 'Incontro',
    loading: 'Caricamento',
    loading_shop: 'Caricamento negozio',
    loading_vip: 'Caricamento negozi VIP',
    shop_not_found: 'Negozio non trovato',
    shop_not_found_desc: 'Questo negozio non esiste o è stato eliminato.',
    back_to_shops: 'Torna ai negozi',
    back: 'Indietro',
    countries: 'Paesi',
    type: 'Tipo',
    location: 'Posizione',
    available_services: 'Servizi disponibili',
    available: 'Disponibile',
    not_available: 'Non disponibile',
    social_media: 'Social media',
    additional_info: 'Informazioni aggiuntive',
    vip_desc: 'Negozi VIP esclusivi',
    no_vip_shops: 'Nessun negozio VIP',
    no_vip_shops_desc: 'Nessun negozio VIP è disponibile al momento.',
    vip_shops_available: 'Negozi VIP disponibili',
    vote_added: 'Voto aggiunto',
    has_now: 'ora ha',
    likes: 'likes',
    error_voting: 'Errore nel voto',
    error_connection: 'Errore di connessione',
    no_shops_found: 'Nessun negozio trovato',
    all_countries: 'Tutti i paesi',
    all_services: 'Tutti i servizi',
    all_types: 'Tutti i tipi',
    standard: 'Standard',
    found: 'trovato/i',
    shops: 'negozi',
    search_desc: 'Cerca i tuoi negozi preferiti per nome, paese o servizio',
    search_placeholder: 'Cerca un negozio',
    only: 'solo',
    reset: 'Ripristina',
    searching: 'Ricerca in corso',
    try_different_criteria: 'Prova a modificare i tuoi criteri di ricerca',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRAZIONE',
    inscription_join_title: 'Unisciti a FindYourPlug',
    inscription_description: 'Registrati direttamente tramite il nostro bot Telegram per accedere a tutti i negozi',
    inscription_button: 'Registrati ora',
    services_title: 'SERVIZI',
    services_frustrated_title: 'Sei stanco che il tuo canale venga bannato?',
    services_solution_text: 'Abbiamo LA soluzione!',
    services_discover_text: 'Scopri la nostra offerta esclusiva',
    services_order_button: 'Ordina ora',
    telegram_links_title: 'Gestione Link Telegram',
    telegram_links_description: 'Configura i link Telegram utilizzati nelle pagine di registrazione e servizi.',
    telegram_links_inscription_label: 'Link Telegram - Pagina di registrazione',
    telegram_links_services_label: 'Link Telegram - Pagina servizi',
    telegram_links_inscription_desc: 'Questo link sarà utilizzato nella pagina di registrazione per reindirizzare al bot Telegram.',
    telegram_links_services_desc: 'Questo link sarà utilizzato nella pagina servizi per reindirizzare al bot Telegram.',
    telegram_links_test: 'Testa',
    telegram_links_save: 'Salva',
    telegram_links_saving: 'Salvando...',
    telegram_links_refresh: 'Aggiorna',
    telegram_links_info_title: 'Informazioni',
    telegram_links_info_1: 'I link devono essere URL Telegram validi (formato: https://t.me/username)',
    telegram_links_info_2: 'Le modifiche vengono applicate immediatamente sulle pagine pubbliche',
    telegram_links_info_3: 'Usa il pulsante "Testa" per verificare che i link funzionino',
    telegram_links_info_4: 'I link predefiniti puntano a @FindYourPlugBot',
    // Traductions pour les sections d'inscription
    inscription_why_title: 'Perché registrarsi?',
    inscription_why_access: 'Accesso a tutti i negozi',
    inscription_why_votes: 'Sistema di voti e recensioni',
    inscription_why_location: 'Ricerca per localizzazione',
    inscription_why_delivery: 'Servizi di consegna',
    inscription_why_interface: 'Interfaccia semplice e veloce',
    inscription_why_notifications: 'Notifiche in tempo reale',
    inscription_why_visibility: 'Offre + visibilità',
    // Traductions pour la page shop - textes de bienvenue
    shop_welcome_title: '👋 Benvenuto su FindYourPlug',
    shop_welcome_search: '🔍 Usa la barra di ricerca per trovare un plug vicino a te o per spedizione postale',
    shop_welcome_vote: '⭐ Non esitare a votare per il tuo Plug preferito',
    shop_social_title: 'Unisciti a tutti i nostri network 🔒🛜',
    // Traductions pour les pages VIP et autres
    no_vip_shops: 'Nessun negozio VIP',
    no_vip_shops_desc: 'Nessun negozio VIP è disponibile al momento.',
    inscription_how_title: 'Come funziona?',
    inscription_how_step1: 'Clicca su "Registrati ora"',
    inscription_how_step2: 'Sarai reindirizzato a Telegram',
    inscription_how_step3: 'Scrivi /start nel bot',
    inscription_how_step4: 'Segui le istruzioni di registrazione',
    inscription_how_step5: 'Goditi FindYourPlug!',
    // Traductions pour les services
    services_bot_title: 'Bot Telegram + MiniApp',
    services_bot_price: '500€',
    services_bot_subtitle: 'Soluzione completa chiavi in mano',
    services_bot_menu: 'Menu negozio integrato',
    services_bot_menu_desc: 'I tuoi clienti consultano il tuo menu direttamente sul tuo bot',
    services_bot_clients: 'Conserva i tuoi clienti',
    services_bot_clients_desc: 'Nessuna perdita di clienti per chiusure di canali',
    services_bot_miniapp: 'MiniApp moderna',
    services_bot_miniapp_desc: 'Interfaccia web integrata in Telegram',
    services_bot_secure: '100% sicuro',
    services_bot_secure_desc: 'Il tuo bot ti appartiene, nessuno può eliminarlo',
    services_bot_fast: 'Installazione rapida',
    services_bot_fast_desc: 'Consegnato in 48-72h massimo - Vedi + in caso di richiesta speciale',
    services_bot_design: 'Design personalizzato',
    services_bot_design_desc: 'Colori e stile adattati alla tua immagine',
    services_bot_order: 'Ordina ora',
    services_web_title: 'Sito Web Professionale',
    services_web_price: '800€',
    services_web_subtitle: 'Sito web completo e responsive',
    services_web_responsive: 'Design responsive',
    services_web_responsive_desc: 'Sito ottimizzato per mobile, tablet e desktop',
    services_web_performance: 'Prestazioni ottimizzate',
    services_web_performance_desc: 'Caricamento veloce e SEO friendly',
    services_web_design: 'Design moderno',
    services_web_design_desc: 'Interfaccia elegante e professionale',
    services_web_maintenance: 'Manutenzione inclusa',
    services_web_maintenance_desc: 'Aggiornamenti e supporto tecnico',
    services_web_analytics: 'Analytics integrati',
    services_web_analytics_desc: 'Monitoraggio visitatori e statistiche',
    services_web_secure: 'Sicuro',
    services_web_secure_desc: 'Certificato SSL e protezione dati',
    services_web_order: 'Ordina ora',
    // Traductions pour la page recherche
    search_loading: 'Caricamento ricerca...',
    search_select_country_first: 'Seleziona prima un paese',
    search_department: 'Dipartimento',
    search_all_countries: 'Tutti i paesi',
    search_all_services: 'Tutti i servizi',
    search_all_types: 'Tutti i tipi',
    search_vip_only: 'Solo VIP',
    search_standard_only: 'Solo standard',
    search_reset_filters: 'Ripristina',
    search_no_results: 'Nessun risultato trovato',
    search_no_results_desc: 'Prova a modificare i tuoi criteri di ricerca',
    search_results_count: 'risultati trovati',
    search_loading_results: 'Caricamento risultati...',
    // Traductions pour la navigation
    nav_inscription: 'Registrati',
    nav_services: 'Servizi',
    // Traductions pour la page détail boutique
    detail_available_services: 'Servizi disponibili',
    detail_available: 'Disponibile',
    detail_not_available: 'Non disponibile',
    // Traductions manquantes importantes
    noShops: 'Nessun negozio trovato',
    refreshing: 'Aggiornamento dati...',
    updated_at: 'Aggiornato alle'
  },
  de: {
    title: 'Sprache',
    home: 'Startseite',
    search: 'Suchen...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'Stimmen',
    delivery: 'Lieferung',
    postal: 'Postal',
    meetup: 'Treffen',
    loading: 'Laden',
    loading_shop: 'Shop wird geladen',
    loading_vip: 'VIP-Shops werden geladen',
    shop_not_found: 'Shop nicht gefunden',
    shop_not_found_desc: 'Dieser Shop existiert nicht oder wurde gelöscht.',
    back_to_shops: 'Zurück zu den Shops',
    back: 'Zurück',
    countries: 'Länder',
    type: 'Typ',
    location: 'Standort',
    available_services: 'Verfügbare Services',
    available: 'Verfügbar',
    not_available: 'Nicht verfügbar',
    social_media: 'Soziale Medien',
    additional_info: 'Zusätzliche Informationen',
    vip_desc: 'Exklusive VIP-Shops',
    no_vip_shops: 'Keine VIP-Shops',
    no_vip_shops_desc: 'Momentan sind keine VIP-Shops verfügbar.',
    vip_shops_available: 'VIP-Shops verfügbar',
    vote_added: 'Stimme hinzugefügt',
    has_now: 'hat jetzt',
    likes: 'Likes',
    error_voting: 'Fehler beim Abstimmen',
    error_connection: 'Verbindungsfehler',
    no_shops_found: 'Keine Shops gefunden',
    all_countries: 'Alle Länder',
    all_services: 'Alle Services',
    all_types: 'Alle Typen',
    standard: 'Standard',
    found: 'gefunden',
    shops: 'Shops',
    search_desc: 'Suchen Sie Ihre Lieblingsshops nach Name, Land oder Service',
    search_placeholder: 'Nach einem Shop suchen',
    only: 'nur',
    reset: 'Zurücksetzen',
    searching: 'Suche läuft',
    try_different_criteria: 'Versuchen Sie, Ihre Suchkriterien zu ändern',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRIERUNG',
    inscription_join_title: 'Tritt FindYourPlug bei',
    inscription_description: 'Registriere dich direkt über unseren Telegram-Bot, um Zugang zu allen Shops zu erhalten',
    inscription_button: 'Jetzt registrieren',
    services_title: 'DIENSTE',
    services_frustrated_title: 'Hast du es satt, dass dein Kanal gesperrt wird?',
    services_solution_text: 'Wir haben DIE Lösung!',
    services_discover_text: 'Entdecke unser exklusives Angebot',
    services_order_button: 'Jetzt bestellen',
    telegram_links_title: 'Telegram-Links Verwaltung',
    telegram_links_description: 'Konfiguriere Telegram-Links, die auf Registrierungs- und Diensteseiten verwendet werden.',
    telegram_links_inscription_label: 'Telegram-Link - Registrierungsseite',
    telegram_links_services_label: 'Telegram-Link - Diensteseite',
    telegram_links_inscription_desc: 'Dieser Link wird auf der Registrierungsseite verwendet, um zum Telegram-Bot weiterzuleiten.',
    telegram_links_services_desc: 'Dieser Link wird auf der Diensteseite verwendet, um zum Telegram-Bot weiterzuleiten.',
    telegram_links_test: 'Testen',
    telegram_links_save: 'Speichern',
    telegram_links_saving: 'Speichern...',
    telegram_links_refresh: 'Aktualisieren',
    telegram_links_info_title: 'Informationen',
    telegram_links_info_1: 'Links müssen gültige Telegram-URLs sein (Format: https://t.me/username)',
    telegram_links_info_2: 'Änderungen werden sofort auf öffentlichen Seiten angewendet',
    telegram_links_info_3: 'Verwende den "Testen"-Button, um zu überprüfen, ob Links funktionieren',
    telegram_links_info_4: 'Standard-Links zeigen auf @FindYourPlugBot',
    // Traductions pour les sections d'inscription
    inscription_why_title: 'Warum registrieren?',
    inscription_why_access: 'Zugang zu allen Shops',
    inscription_why_votes: 'Bewertungs- und Abstimmungssystem',
    inscription_why_location: 'Standortsuche',
    inscription_why_delivery: 'Lieferservices',
    inscription_why_interface: 'Einfache und schnelle Benutzeroberfläche',
    inscription_why_notifications: 'Echtzeit-Benachrichtigungen',
    inscription_why_visibility: 'Bietet + Sichtbarkeit',
    // Traductions pour la page shop - textes de bienvenue
    shop_welcome_title: '👋 Willkommen bei FindYourPlug',
    shop_welcome_search: '🔍 Verwende die Suchleiste, um einen Plug in deiner Nähe oder für Postversand zu finden',
    shop_welcome_vote: '⭐ Zögere nicht, für deinen Lieblings-Plug zu stimmen',
    shop_social_title: 'Tritt allen unseren Netzwerken bei 🔒🛜',
    // Traductions pour les pages VIP et autres
    no_vip_shops: 'Keine VIP-Shops',
    no_vip_shops_desc: 'Derzeit sind keine VIP-Shops verfügbar.',
    inscription_how_title: 'Wie funktioniert es?',
    inscription_how_step1: 'Klicke auf "Jetzt registrieren"',
    inscription_how_step2: 'Du wirst zu Telegram weitergeleitet',
    inscription_how_step3: 'Schreibe /start im Bot',
    inscription_how_step4: 'Folge den Registrierungsanweisungen',
    inscription_how_step5: 'Genieße FindYourPlug!',
    // Traductions pour les services
    services_bot_title: 'Telegram Bot + MiniApp',
    services_bot_price: '500€',
    services_bot_subtitle: 'Komplette Schlüsselfertiglösung',
    services_bot_menu: 'Integriertes Shop-Menü',
    services_bot_menu_desc: 'Deine Kunden konsultieren dein Menü direkt in deinem Bot',
    services_bot_clients: 'Behalte deine Kunden',
    services_bot_clients_desc: 'Kein Kundenverlust durch Kanal-Schließungen',
    services_bot_miniapp: 'Moderne MiniApp',
    services_bot_miniapp_desc: 'Web-Interface integriert in Telegram',
    services_bot_secure: '100% sicher',
    services_bot_secure_desc: 'Dein Bot gehört dir, niemand kann ihn löschen',
    services_bot_fast: 'Schnelle Installation',
    services_bot_fast_desc: 'Geliefert in 48-72h maximal - Siehe + bei Sonderanfrage',
    services_bot_design: 'Personalisiertes Design',
    services_bot_design_desc: 'Farben und Stil an dein Image angepasst',
    services_bot_order: 'Jetzt bestellen',
    services_web_title: 'Professionelle Website',
    services_web_price: '800€',
    services_web_subtitle: 'Komplette und responsive Website',
    services_web_responsive: 'Responsive Design',
    services_web_responsive_desc: 'Website optimiert für Mobile, Tablet und Desktop',
    services_web_performance: 'Optimierte Leistung',
    services_web_performance_desc: 'Schnelles Laden und SEO-freundlich',
    services_web_design: 'Modernes Design',
    services_web_design_desc: 'Elegante und professionelle Benutzeroberfläche',
    services_web_maintenance: 'Wartung inklusive',
    services_web_maintenance_desc: 'Updates und technischer Support',
    services_web_analytics: 'Integrierte Analytics',
    services_web_analytics_desc: 'Besucher-Tracking und Statistiken',
    services_web_secure: 'Sicher',
    services_web_secure_desc: 'SSL-Zertifikat und Datenschutz',
    services_web_order: 'Jetzt bestellen',
    // Traductions pour la page recherche
    search_loading: 'Suche wird geladen...',
    search_select_country_first: 'Wählen Sie zuerst ein Land',
    search_department: 'Abteilung',
    search_all_countries: 'Alle Länder',
    search_all_services: 'Alle Services',
    search_all_types: 'Alle Typen',
    search_vip_only: 'Nur VIP',
    search_standard_only: 'Nur Standard',
    search_reset_filters: 'Zurücksetzen',
    search_no_results: 'Keine Ergebnisse gefunden',
    search_no_results_desc: 'Versuchen Sie, Ihre Suchkriterien zu ändern',
    search_results_count: 'Ergebnisse gefunden',
    search_loading_results: 'Ergebnisse werden geladen...',
    // Traductions pour la navigation
    nav_inscription: 'Registrieren',
    nav_services: 'Dienste',
    // Traductions pour la page détail boutique
    detail_available_services: 'Verfügbare Services',
    detail_available: 'Verfügbar',
    detail_not_available: 'Nicht verfügbar',
    // Traductions manquantes importantes
    noShops: 'Keine Geschäfte gefunden',
    refreshing: 'Daten werden aktualisiert...',
    updated_at: 'Aktualisiert um'
  }
}

export default function LanguageSelector({ onLanguageChange, currentLanguage = 'fr', compact = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (langCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shop_language', langCode)
    }
    setIsOpen(false)
    if (onLanguageChange) {
      onLanguageChange(langCode)
    }
  }

  if (compact) {
    // Version compacte pour le shop
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 bg-black/20 border border-white/20 rounded-md text-white/80 hover:bg-black/30 hover:text-white transition-all duration-200 text-xs"
        >
          <span className="text-sm">{languages[currentLanguage]?.flag}</span>
          <svg 
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-28 bg-black/90 border border-white/20 rounded-md shadow-lg z-50 backdrop-blur-sm">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 text-xs hover:bg-white/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                  code === currentLanguage ? 'bg-white/20 text-white' : 'text-white/80'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
                {code === currentLanguage && (
                  <span className="ml-auto text-white text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{languages[currentLanguage]?.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {languages[currentLanguage]?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                code === currentLanguage ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {code === currentLanguage && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook pour utiliser les traductions
export function useTranslation(currentLanguage = 'fr') {
  const t = useCallback((key) => {
    return translations[currentLanguage]?.[key] || translations['fr'][key] || key
  }, [currentLanguage])

  return { t }
}

// Fonction pour obtenir la langue depuis localStorage
export function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('shop_language') || 'fr'
  }
  return 'fr'
}