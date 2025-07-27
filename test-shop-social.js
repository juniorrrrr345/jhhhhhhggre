// Script de test pour forcer la sauvegarde du lien Telegram
// À exécuter dans la console du navigateur sur la page boutique

const testShopSocial = () => {
  const shopSocialData = [
    {
      id: 'telegram',
      name: 'Telegram',
      emoji: '📱',
      url: 'https://t.me/+zcP68c4M_3NlM2Y0',
      enabled: true
    }
  ]
  
  localStorage.setItem('shopSocialMediaBackup', JSON.stringify(shopSocialData))
  console.log('✅ shopSocialMediaBackup sauvegardé:', shopSocialData)
  
  // Trigger l'event de changement
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'shopSocialMediaBackup',
    newValue: JSON.stringify(shopSocialData)
  }))
}

// Pour exécuter: testShopSocial()
console.log('🔧 Script chargé. Exécutez: testShopSocial()');