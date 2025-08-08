// Script pour configurer les liens Telegram

const newLinks = {
  inscriptionTelegramLink: 'https://t.me/Findyourplugadmin',
  servicesTelegramLink: 'https://t.me/Findyourplugadmin'
};

console.log('🔗 Configuration des liens Telegram\n');
console.log('📝 Page inscription:', newLinks.inscriptionTelegramLink);
console.log('🛠️ Page services:', newLinks.servicesTelegramLink);

// Créer un fichier HTML pour configurer les liens
const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Configuration Liens Telegram</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Configuration des liens Telegram</h1>
    <p>Ouvrez cette page dans votre navigateur pour configurer les liens.</p>
    <button onclick="setLinks()">Configurer les liens</button>
    <div id="status"></div>
    
    <script>
    function setLinks() {
        const links = ${JSON.stringify(newLinks)};
        localStorage.setItem('telegramLinks', JSON.stringify(links));
        document.getElementById('status').innerHTML = '<p style="color: green;">✅ Liens configurés avec succès!</p>';
        console.log('Liens sauvegardés:', links);
        
        // Déclencher un événement pour notifier les autres onglets
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
            alert('Les liens ont été configurés! Les pages inscription et services utiliseront maintenant: https://t.me/Findyourplugadmin');
        }, 500);
    }
    
    // Auto-configurer au chargement
    window.onload = function() {
        setLinks();
    };
    </script>
</body>
</html>`;

fs.writeFileSync('configure-telegram-links.html', htmlContent);

console.log('\n✅ Fichier créé: configure-telegram-links.html');
console.log('\n📋 Instructions:');
console.log('1. Ouvrez configure-telegram-links.html dans votre navigateur');
console.log('2. Les liens seront automatiquement configurés');
console.log('3. Les pages inscription et services utiliseront: https://t.me/Findyourplugadmin');
