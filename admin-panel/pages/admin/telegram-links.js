import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'
import { useTranslation } from '../../components/LanguageSelector'

export default function TelegramLinks() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    inscriptionTelegramLink: 'https://t.me/findyourplugsav',
    servicesTelegramLink: 'https://t.me/findyourplugsav'
  })
  const router = useRouter()
  const { t } = useTranslation('fr') // Admin panel en français par défaut

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }

    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      console.log('🔍 Fetching telegram links config...')
      
      // D'abord essayer de charger depuis le localStorage
      const savedLinks = localStorage.getItem('telegramLinks')
      if (savedLinks) {
        const links = JSON.parse(savedLinks)
        setConfig({
          inscriptionTelegramLink: links.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
          servicesTelegramLink: links.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        })
        setLoading(false)
        return
      }
      
      // Fallback : utiliser l'API simple
      const data = await simpleApi.getConfig(token)
      console.log('✅ Config loaded:', data)
      
      // Extraire les liens Telegram de la config
      setConfig({
        inscriptionTelegramLink: data.boutique?.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
        servicesTelegramLink: data.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
      })
    } catch (error) {
      console.error('💥 Config fetch error:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      console.log('💾 Saving telegram links config...')
      
      const token = localStorage.getItem('adminToken')
      
      // D'abord récupérer la config actuelle
      const currentConfig = await simpleApi.getConfig(token)
      
      // Mettre à jour avec les nouveaux liens Telegram
      const updatedConfig = {
        ...currentConfig,
        boutique: {
          ...currentConfig.boutique,
          inscriptionTelegramLink: config.inscriptionTelegramLink,
          servicesTelegramLink: config.servicesTelegramLink
        }
      }
      
      // Sauvegarder la configuration complète
      await simpleApi.updateConfig(token, updatedConfig)
      
      // Forcer la synchronisation en rafraîchissant l'API publique
      try {
        await fetch('https://jhhhhhhggre.onrender.com/api/public/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (syncError) {
        console.log('Erreur synchronisation API publique:', syncError)
      }
      
      // Sauvegarder aussi en localStorage pour les pages publiques
      localStorage.setItem('telegramLinks', JSON.stringify({
        inscriptionTelegramLink: config.inscriptionTelegramLink,
        servicesTelegramLink: config.servicesTelegramLink
      }))
      
      toast.success('Configuration sauvegardée avec succès !')
      console.log('✅ Telegram links config saved')
    } catch (error) {
      console.error('💥 Save error:', error)
      
      // Gestion d'erreur plus détaillée
      if (error.message.includes('500') || error.message.includes('429')) {
        toast.error('Serveur temporairement indisponible. Réessayez dans quelques instants.')
      } else {
        toast.error(`Erreur lors de la sauvegarde: ${error.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTestLink = (link) => {
    window.open(link, '_blank')
  }

  if (loading) {
    return (
      <Layout title="Liens Telegram">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Liens Telegram">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">🔗 {t('telegram_links_title')}</h1>
          <p className="text-blue-100">
            {t('telegram_links_description')}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            
            {/* Lien d'inscription */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 {t('telegram_links_inscription_label')}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={config.inscriptionTelegramLink}
                  onChange={(e) => handleInputChange('inscriptionTelegramLink', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://t.me/FindYourPlugBot"
                />
                <button
                  onClick={() => handleTestLink(config.inscriptionTelegramLink)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔗 {t('telegram_links_test')}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t('telegram_links_inscription_desc')}
              </p>
            </div>

            {/* Lien de services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🛠️ {t('telegram_links_services_label')}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={config.servicesTelegramLink}
                  onChange={(e) => handleInputChange('servicesTelegramLink', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://t.me/FindYourPlugBot"
                />
                <button
                  onClick={() => handleTestLink(config.servicesTelegramLink)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔗 {t('telegram_links_test')}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t('telegram_links_services_desc')}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('telegram_links_saving')}
                  </>
                ) : (
                  `💾 ${t('telegram_links_save')}`
                )}
              </button>
              
              <button
                onClick={() => fetchConfig(localStorage.getItem('adminToken'))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔄 {t('telegram_links_refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ {t('telegram_links_info_title')}</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {t('telegram_links_info_1')}</li>
            <li>• {t('telegram_links_info_2')}</li>
            <li>• {t('telegram_links_info_3')}</li>
            <li>• {t('telegram_links_info_4')}</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}