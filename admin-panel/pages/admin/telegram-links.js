import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function TelegramLinks() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    inscriptionTelegramLink: 'https://t.me/FindYourPlugBot',
    servicesTelegramLink: 'https://t.me/FindYourPlugBot'
  })
  const router = useRouter()

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
      
      // Utiliser l'API simple comme les autres pages
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
          <h1 className="text-2xl font-bold mb-2">🔗 Gestion des Liens Telegram</h1>
          <p className="text-blue-100">
            Configurez les liens Telegram utilisés sur les pages d'inscription et de services.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            
            {/* Lien d'inscription */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Lien Telegram - Page d'inscription
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
                  🔗 Tester
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Ce lien sera utilisé sur la page d'inscription pour rediriger vers le bot Telegram.
              </p>
            </div>

            {/* Lien de services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🛠️ Lien Telegram - Page de services
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
                  🔗 Tester
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Ce lien sera utilisé sur la page de services pour rediriger vers le bot Telegram.
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
                    Sauvegarde...
                  </>
                ) : (
                  '💾 Sauvegarder'
                )}
              </button>
              
              <button
                onClick={() => fetchConfig(localStorage.getItem('adminToken'))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Informations</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Les liens doivent être des URLs Telegram valides (format: https://t.me/username)</li>
            <li>• Les modifications sont appliquées immédiatement sur les pages publiques</li>
            <li>• Utilisez le bouton "Tester" pour vérifier que les liens fonctionnent</li>
            <li>• Les liens par défaut pointent vers @FindYourPlugBot</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}