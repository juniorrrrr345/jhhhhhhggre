import { useEffect } from 'react'
import { setCurrentLanguage } from './LanguageSelector'

export default function LanguageSync() {
  useEffect(() => {
    // Fonction pour récupérer la langue depuis l'API du bot
    const syncLanguageFromBot = async () => {
      try {
        const response = await fetch('https://safepluglink-6hzr.onrender.com/api/public/config')
        if (response.ok) {
          const data = await response.json()
          const botLanguage = data?.languages?.currentLanguage
          
          if (botLanguage) {
            const currentLang = localStorage.getItem('selectedLanguage')
            if (currentLang !== botLanguage) {
              console.log(`🌐 Synchronisation langue: ${currentLang} → ${botLanguage}`)
              setCurrentLanguage(botLanguage)
              
              // Forcer le rechargement pour appliquer la nouvelle langue
              window.location.reload()
            }
          }
        }
      } catch (error) {
        console.error('Erreur sync langue:', error)
      }
    }

    // Synchroniser au chargement
    syncLanguageFromBot()

    // Synchroniser toutes les 30 secondes
    const interval = setInterval(syncLanguageFromBot, 30000)

    // Écouter les messages du bot via Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Écouter les événements de changement de langue
      tg.onEvent('languageChanged', (data) => {
        if (data.language) {
          console.log(`🌐 Langue changée via Telegram: ${data.language}`)
          setCurrentLanguage(data.language)
          window.location.reload()
        }
      })
    }

    // Écouter les événements custom
    window.addEventListener('telegramLanguageChange', (event) => {
      if (event.detail?.language) {
        console.log(`🌐 Langue changée: ${event.detail.language}`)
        setCurrentLanguage(event.detail.language)
        window.location.reload()
      }
    })

    return () => {
      clearInterval(interval)
    }
  }, [])

  return null // Ce composant n'affiche rien
}