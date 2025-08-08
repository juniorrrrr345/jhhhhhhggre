import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function TelegramUsername() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('Findyourplugadmin')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadCurrentUsername()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
    }
  }

  const loadCurrentUsername = async () => {
    try {
      setLoading(true)
      
      // Charger depuis localStorage d'abord
      const saved = localStorage.getItem('telegramUsername')
      if (saved) {
        setUsername(saved)
      }
      
      // Puis essayer de charger depuis le bot
      const token = localStorage.getItem('adminToken')
      const config = await simpleApi.getConfig(token)
      
      // Extraire le username du texte contact
      if (config?.buttons?.contact?.content) {
        const match = config.buttons.contact.content.match(/@(\w+)/)
        if (match) {
          setUsername(match[1])
          localStorage.setItem('telegramUsername', match[1])
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveUsername = async () => {
    try {
      setSaving(true)
      
      // Sauvegarder localement
      localStorage.setItem('telegramUsername', username)
      
      // Préparer les nouveaux textes avec le username
      const newButtons = {
        contact: {
          text: '📞 Contact',
          content: `Contactez-nous pour plus d'informations.\n@${username}`,
          enabled: true
        },
        info: {
          text: 'ℹ️ Info',
          content: `Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @${username} 📲`,
          enabled: true
        }
      }
      
      // Mettre à jour sur le bot
      const token = localStorage.getItem('adminToken')
      await simpleApi.updateConfig(token, { buttons: newButtons })
      
      toast.success('✅ Username mis à jour avec succès!')
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            @ Username Telegram
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username (sans @)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl text-gray-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Findyourplugadmin"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ce username sera utilisé dans les boutons Contact et Info du bot
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Aperçu :</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <strong>📞 Contact :</strong>
                  <p className="text-sm mt-1">
                    Contactez-nous pour plus d'informations.<br/>
                    <span className="text-blue-600">@{username}</span>
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded border border-gray-200">
                  <strong>ℹ️ Info :</strong>
                  <p className="text-sm mt-1">
                    Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌<br/><br/>
                    Pour toute demande spécifique contacter nous <span className="text-blue-600">@{username}</span> 📲
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveUsername}
                disabled={saving || !username}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}