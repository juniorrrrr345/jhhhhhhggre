import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'

export default function SyncLocalData() {
  const [localSaves, setLocalSaves] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    loadLocalSaves()
  }, [])

  const loadLocalSaves = () => {
    const saves = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('temp_plug_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          saves.push({ key, ...data })
        } catch (error) {
          console.error('Erreur lecture sauvegarde locale:', error)
        }
      }
    }
    setLocalSaves(saves)
  }

  const syncSave = async (save) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'
      
      const response = await fetch(`${apiBaseUrl}/api/plugs/${save.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(save.data)
      })

      if (response.ok) {
        toast.success(`Plug ${save.data.name} synchronisé avec succès !`)
        localStorage.removeItem(save.key)
        loadLocalSaves()
      } else {
        toast.error('Erreur lors de la synchronisation')
      }
    } catch (error) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearSave = (save) => {
    localStorage.removeItem(save.key)
    loadLocalSaves()
    toast.success('Sauvegarde locale supprimée')
  }

  const clearAllSaves = () => {
    if (confirm('Supprimer toutes les sauvegardes locales ?')) {
      localSaves.forEach(save => {
        localStorage.removeItem(save.key)
      })
      loadLocalSaves()
      toast.success('Toutes les sauvegardes locales supprimées')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Synchronisation des Données Locales</h1>
            <p className="text-gray-600 mt-1">Gérez les sauvegardes locales en attente de synchronisation</p>
          </div>
          {localSaves.length > 0 && (
            <button
              onClick={clearAllSaves}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Tout supprimer
            </button>
          )}
        </div>

        {localSaves.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune sauvegarde locale</h3>
              <p className="mt-1 text-sm text-gray-500">Toutes vos modifications sont synchronisées !</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {localSaves.length} sauvegarde(s) locale(s) en attente
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {localSaves.map((save, index) => (
                <li key={save.key} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{save.data.name}</h3>
                      <p className="text-xs text-gray-500">
                        ID: {save.id} • Sauvegardé le {new Date(save.timestamp).toLocaleString()}
                      </p>
                      {save.data.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{save.data.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => syncSave(save)}
                        disabled={loading}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                        Synchroniser
                      </button>
                      <button
                        onClick={() => clearSave(save)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                À propos des sauvegardes locales
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Les sauvegardes locales sont créées automatiquement quand le serveur n'est pas disponible.
                  Une fois le serveur redéployé, utilisez cette page pour synchroniser vos modifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}