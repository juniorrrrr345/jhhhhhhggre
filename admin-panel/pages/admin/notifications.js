import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function NotificationsManager() {
  const [config, setConfig] = useState({
    chatId: '',
    enabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'admin/notifications',
          method: 'GET',
          token: token
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig({
          chatId: data.notifications?.newShopChatId || '',
          enabled: data.notifications?.enabled !== false
        })
        console.log('✅ Configuration notifications chargée:', data.notifications)
      } else {
        throw new Error('Erreur lors du chargement')
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'admin/notifications/chat-id',
          method: 'POST',
          token: token,
          data: {
            chatId: config.chatId.trim(),
            enabled: config.enabled
          }
        })
      })

      if (response.ok) {
        toast.success('✅ Configuration des notifications sauvegardée !')
        
        // Synchronisation temps réel avec la mini app et le bot
        await simpleApi.syncImmediateMiniApp('notifications_updated')
        
        console.log('✅ Notifications mises à jour et synchronisées')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde notifications:', error)
      toast.error('Erreur : ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Notifications - Admin Panel</title>
        </Head>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Notifications - Admin Panel</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                🔔 Gestion des Notifications
              </h1>
              <p className="mt-2 text-gray-600">
                Configurez les notifications automatiques pour les nouvelles boutiques
              </p>
            </div>

            {/* Configuration */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuration des Notifications
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Statut des notifications */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Activer les notifications automatiques
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Quand activé, le bot enverra des notifications pour les nouvelles boutiques, modifications et suppressions
                  </p>
                </div>

                {/* Chat ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chat ID pour les notifications
                  </label>
                  <input
                    type="text"
                    value={config.chatId}
                    onChange={(e) => setConfig(prev => ({ ...prev, chatId: e.target.value }))}
                    placeholder="Entrez le Chat ID Telegram (ex: -1234567890)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Chat ID où envoyer les notifications (groupe ou utilisateur). 
                    <br />
                    💡 <strong>Comment obtenir un Chat ID :</strong>
                    <br />
                    • Ajoutez @userinfobot à votre groupe/channel
                    • Envoyez /start et copiez le Chat ID affiché
                    • Ou utilisez @RawDataBot dans votre conversation
                  </p>
                </div>

                {/* Statut actuel */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Statut actuel</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Notifications :</span> 
                      <span className={`ml-1 ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {config.enabled ? '✅ Activées' : '❌ Désactivées'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Chat configuré :</span> 
                      <span className={`ml-1 ${config.chatId ? 'text-green-600' : 'text-red-600'}`}>
                        {config.chatId ? `✅ ${config.chatId}` : '❌ Non configuré'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Types de notifications */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    📋 Types de notifications envoyées
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>🆕 <strong>Nouvelle boutique créée</strong> - Détails complets avec lien vers la boutique</li>
                    <li>✏️ <strong>Boutique modifiée</strong> - Résumé des modifications effectuées</li>
                    <li>🗑️ <strong>Boutique supprimée</strong> - Confirmation de suppression</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={loadConfig}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    🔄 Recharger
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !config.chatId.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </div>
              </div>
            </div>

            {/* Aide */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                💡 Conseils d'utilisation
              </h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Testez avec votre propre Chat ID avant d'utiliser un groupe</li>
                <li>• Assurez-vous que le bot peut envoyer des messages dans le chat configuré</li>
                <li>• Les notifications sont envoyées immédiatement lors des actions sur les boutiques</li>
                <li>• Vous pouvez désactiver temporairement les notifications sans perdre la configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}