import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import simpleApi from '../../lib/api-simple'

export default function MaintenancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState({
    fr: "🔧 Maintenance en cours...\n\nNous revenons très bientôt !",
    en: "🔧 Maintenance in progress...\n\nWe'll be back soon!",
    es: "🔧 Mantenimiento en progreso...\n\n¡Volveremos pronto!",
    ar: "🔧 الصيانة جارية...\n\nسنعود قريبا!"
  })
  const [maintenanceImage, setMaintenanceImage] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'getConfig',
          data: { configId: 'main' }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMaintenanceMode(data.maintenanceMode || false)
        setMaintenanceMessage(data.maintenanceMessage || maintenanceMessage)
        setMaintenanceImage(data.maintenanceImage || '')
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'updateConfig',
          data: {
            configId: 'main',
            maintenanceMode,
            maintenanceMessage,
            maintenanceImage
          }
        })
      })

      if (response.ok) {
        toast.success('✅ Configuration de maintenance sauvegardée !')
        
        // Si on désactive la maintenance, notifier le bot de supprimer les messages
        if (!maintenanceMode) {
          await simpleApi.syncImmediateMiniApp('maintenance_disabled')
        }
      } else {
        throw new Error('Erreur API')
      }
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🔧 Gestion de la Maintenance</h1>

        {/* Activation de la maintenance */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mode Maintenance</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          <p className="text-gray-400">
            {maintenanceMode 
              ? "⚠️ Le bot est actuellement en maintenance. Les utilisateurs verront le message ci-dessous."
              : "✅ Le bot est actuellement actif et accessible."}
          </p>
        </div>

        {/* Messages de maintenance */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Messages de Maintenance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(maintenanceMessage).map(([lang, message]) => (
              <div key={lang}>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'fr' ? '🇫🇷 Français' : 
                   lang === 'en' ? '🇬🇧 English' :
                   lang === 'es' ? '🇪🇸 Español' :
                   lang === 'ar' ? '🇸🇦 العربية' : lang}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMaintenanceMessage({
                    ...maintenanceMessage,
                    [lang]: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="4"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Image de maintenance */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Image de Maintenance (optionnel)</h2>
          <input
            type="text"
            value={maintenanceImage}
            onChange={(e) => setMaintenanceImage(e.target.value)}
            placeholder="URL de l'image (ex: https://i.imgur.com/...)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
          />
          {maintenanceImage && (
            <img 
              src={maintenanceImage} 
              alt="Aperçu maintenance" 
              className="max-w-xs rounded-lg"
            />
          )}
        </div>

        {/* Aperçu */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Aperçu</h2>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {previewMode ? '👁️ Masquer' : '👁️ Afficher'}
            </button>
          </div>
          
          {previewMode && (
            <div className="relative">
              {maintenanceImage && (
                <div className="relative mb-4">
                  <img 
                    src={maintenanceImage} 
                    alt="Maintenance" 
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                  {/* Texte superposé avec fond semi-transparent */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mx-4">
                      <pre className="text-black font-semibold text-center whitespace-pre-wrap">
                        {maintenanceMessage.fr}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              {!maintenanceImage && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap">{maintenanceMessage.fr}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
          </button>
          
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            🔙 Retour
          </button>
        </div>

        {/* Note importante */}
        {maintenanceMode && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-300">
              ⚠️ <strong>Attention :</strong> Le mode maintenance est activé. 
              Les utilisateurs ne peuvent pas utiliser le bot et verront uniquement le message de maintenance.
              Les messages de maintenance seront automatiquement supprimés quand vous désactiverez ce mode.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}