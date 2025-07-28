import { useState, useEffect } from 'react'
import { getCurrentLanguage } from '../components/LanguageSelector'

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('fr')

  useEffect(() => {
    // Charger la langue initiale
    const initialLang = getCurrentLanguage()
    setCurrentLanguage(initialLang)

    // Écouter les changements de langue
    const handleLanguageChange = (event) => {
      const newLang = event.detail?.language || getCurrentLanguage()
      setCurrentLanguage(newLang)
    }

    // Écouter l'événement de changement de langue
    window.addEventListener('shopLanguageChanged', handleLanguageChange)
    window.addEventListener('languageChanged', handleLanguageChange)

    // Vérifier périodiquement si la langue a changé (au cas où)
    const interval = setInterval(() => {
      const storedLang = getCurrentLanguage()
      if (storedLang !== currentLanguage) {
        setCurrentLanguage(storedLang)
      }
    }, 1000)

    return () => {
      window.removeEventListener('shopLanguageChanged', handleLanguageChange)
      window.removeEventListener('languageChanged', handleLanguageChange)
      clearInterval(interval)
    }
  }, [])

  return currentLanguage
}