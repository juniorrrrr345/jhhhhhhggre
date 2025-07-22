import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { simpleApi } from '../../lib/api-simple'
// Heroicons remplacés par des emojis

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true)
  const [plugs, setPlugs] = useState([])
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalReferred: 0,
    totalPlugs: 0
  })
  const [copiedLink, setCopiedLink] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    
    // Ajouter un délai pour éviter les erreurs de rechargement
    const loadData = async () => {
      try {
        await loadReferralData(token)
      } catch (error) {
        console.error('❌ Erreur initiale:', error)
        // En cas d'erreur au chargement initial, réessayer une fois
        setTimeout(() => {
          loadReferralData(token).catch(retryError => {
            console.error('❌ Erreur après retry:', retryError)
            toast.error('Erreur de chargement. Veuillez rafraîchir la page.')
          })
        }, 1000)
      }
    }
    
    loadData()
  }, [])

  const loadReferralData = async (token) => {
    try {
      setLoading(true)
      
      // Charger toutes les boutiques via l'API simple
      const plugsData = await simpleApi.getPlugs(token)
      console.log('📊 Boutiques chargées:', plugsData?.length || 0)
      
      if (plugsData && Array.isArray(plugsData)) {
        const plugsWithReferrals = []
        let totalReferred = 0

        // Pour chaque boutique, récupérer ses données de parrainage
        for (const plug of plugsData) {
          try {
            // Essayer de récupérer les données de parrainage
            const response = await fetch('/api/cors-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                endpoint: `/api/plugs/${plug._id}/referral`,
                method: 'GET'
              })
            })

            if (response.ok) {
              const referralData = await response.json()
              plugsWithReferrals.push({
                ...plug,
                ...referralData
              })
              totalReferred += referralData.totalReferred || 0
            } else {
              // Si pas de données de parrainage, ajouter la boutique sans ces données
              plugsWithReferrals.push({
                ...plug,
                referralLink: null,
                referralCode: null,
                totalReferred: 0,
                referredUsers: []
              })
            }
          } catch (error) {
            console.error(`Erreur parrainage pour ${plug.name}:`, error)
            // Ajouter la boutique même en cas d'erreur
            plugsWithReferrals.push({
              ...plug,
              referralLink: null,
              referralCode: null,
              totalReferred: 0,
              referredUsers: []
            })
          }
        }

        setPlugs(plugsWithReferrals)
        setTotalStats({
          totalPlugs: plugsData.length,
          totalReferred: totalReferred,
          totalUsers: 0 // À implémenter si nécessaire
        })
        
        console.log('✅ Données de parrainage chargées:', {
          boutiques: plugsWithReferrals.length,
          totalParrainage: totalReferred
        })
      } else {
        console.warn('⚠️ Aucune boutique trouvée ou format incorrect')
        setPlugs([])
        setTotalStats({ totalPlugs: 0, totalReferred: 0, totalUsers: 0 })
      }
    } catch (error) {
      console.error('❌ Erreur chargement parrainage:', error)
      toast.error(`Erreur lors du chargement: ${error.message}`)
      // En cas d'erreur, au moins afficher les boutiques sans parrainage
      try {
        const plugsData = await simpleApi.getPlugs(token)
        if (plugsData && Array.isArray(plugsData)) {
          const plugsWithoutReferrals = plugsData.map(plug => ({
            ...plug,
            referralLink: null,
            referralCode: null,
            totalReferred: 0,
            referredUsers: []
          }))
          setPlugs(plugsWithoutReferrals)
          setTotalStats({
            totalPlugs: plugsData.length,
            totalReferred: 0,
            totalUsers: 0
          })
        }
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async (plug) => {
    try {
      let referralLink = plug.referralLink

      // Si le lien n'existe pas, essayer de le générer
      if (!referralLink) {
        console.log('🔄 Génération du lien de parrainage pour:', plug.name)
        try {
          const token = localStorage.getItem('adminToken')
          const response = await fetch('/api/cors-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              endpoint: `/api/plugs/${plug._id}/referral`,
              method: 'GET'
            })
          })

                     if (response.ok) {
             const referralData = await response.json()
             referralLink = referralData.referralLink
             
             // Mettre à jour la boutique dans l'état local
             setPlugs(prevPlugs => 
               prevPlugs.map(p => 
                 p._id === plug._id 
                   ? { ...p, ...referralData }
                   : p
               )
             )
             console.log('✅ Lien généré:', referralLink)
           } else {
             const errorData = await response.json()
             console.error('❌ Erreur API génération lien:', errorData)
             toast.error(`Erreur API: ${errorData.error || 'Erreur inconnue'}`)
           }
         } catch (linkError) {
           console.error('❌ Erreur génération lien:', linkError)
           toast.error(`Erreur: ${linkError.message}`)
         }
      }

      if (referralLink) {
        try {
          await navigator.clipboard.writeText(referralLink)
          setCopiedLink(plug._id)
          setTimeout(() => setCopiedLink(null), 2000)
          toast.success(`🔗 Lien de ${plug.name} copié !`)
          console.log('✅ Lien copié avec succès:', referralLink)
        } catch (clipboardError) {
          console.error('❌ Erreur clipboard:', clipboardError)
          // Fallback : créer un élément temporaire pour copier
          try {
            const textArea = document.createElement('textarea')
            textArea.value = referralLink
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            
            setCopiedLink(plug._id)
            setTimeout(() => setCopiedLink(null), 2000)
            toast.success(`🔗 Lien de ${plug.name} copié !`)
            console.log('✅ Lien copié avec fallback:', referralLink)
          } catch (fallbackError) {
            console.error('❌ Erreur fallback copie:', fallbackError)
            toast.error('Impossible de copier automatiquement. Copiez manuellement ce lien :')
            // Afficher le lien dans une alerte pour copie manuelle
            prompt('Copiez ce lien de parrainage :', referralLink)
          }
        }
      } else {
        toast.error('Impossible de générer le lien de parrainage')
      }
    } catch (error) {
      console.error('❌ Erreur générale:', error)
      toast.error(`Erreur: ${error.message}`)
    }
  }

  const copyDirectLink = async (plug) => {
    try {
      if (plug.directLink) {
        await navigator.clipboard.writeText(plug.directLink)
        toast.success(`🎯 Lien direct de ${plug.name} copié !`)
      } else {
        toast.error('Lien direct non disponible')
      }
    } catch (error) {
      console.error('❌ Erreur copie lien direct:', error)
      toast.error('Erreur lors de la copie')
    }
  }

  const shareLinkViaTelegram = (plug) => {
    if (plug.referralLink) {
      const message = `🏪 Découvrez ${plug.name} !\n\n${plug.description}\n\n👇 Cliquez ici pour accéder directement :\n${plug.referralLink}`
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(plug.referralLink)}&text=${encodeURIComponent(message)}`
      window.open(telegramUrl, '_blank')
    }
  }

  // Fonction pour générer tous les liens de parrainage
  const generateAllReferralLinks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      toast.promise(
        fetch('/api/cors-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            endpoint: '/api/plugs/generate-all-referrals',
            method: 'POST'
          })
        }).then(async (response) => {
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Génération massive réussie:', result)
            
            // Recharger les données pour voir les nouveaux liens
            await loadReferralData(token)
            
            return result
          } else {
            const error = await response.json()
            throw new Error(error.error || 'Erreur lors de la génération')
          }
        }),
        {
          loading: '🔄 Génération des liens de parrainage...',
          success: (result) => `✅ ${result.generated} nouveaux liens générés ! (${result.existing} existants)`,
          error: (err) => `❌ Erreur: ${err.message}`
        }
      )
    } catch (error) {
      console.error('❌ Erreur génération massive:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Parrainage - Chargement...">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Chargement des données de parrainage...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Système de Parrainage">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              🔗 Système de Parrainage
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Chaque boutique a un lien unique qui redirige automatiquement les nouveaux utilisateurs vers elle.
            </p>

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Parrainés
                        </dt>
                        <dd className="text-2xl font-bold text-blue-600">
                          {totalStats.totalReferred}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Boutiques Actives
                        </dt>
                        <dd className="text-2xl font-bold text-green-600">
                          {totalStats.totalPlugs}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Taux Moyen
                        </dt>
                        <dd className="text-2xl font-bold text-purple-600">
                          {totalStats.totalPlugs > 0 ? Math.round(totalStats.totalReferred / totalStats.totalPlugs * 10) / 10 : 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guide d'utilisation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-3">
            📚 Comment utiliser le parrainage ?
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Copier le lien</strong> - Cliquez sur "📋 Copier" à côté de votre boutique</p>
            <p><strong>2. Partager</strong> - Envoyez le lien via Telegram, réseaux sociaux, email...</p>
            <p><strong>3. Résultat</strong> - Quand quelqu'un clique, il arrive directement sur votre boutique</p>
            <p><strong>4. Statistiques</strong> - Voyez en temps réel combien de personnes ont été redirigées</p>
          </div>
        </div>

        {/* Liste des boutiques avec parrainage */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                🏪 Liens de Parrainage par Boutique
              </h3>
              <button
                onClick={generateAllReferralLinks}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loading ? '🔄 Génération...' : '⚡ Générer tous les liens'}
              </button>
            </div>

            <div className="space-y-4">
              {plugs.map((plug) => (
                <div key={plug._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {plug.name}
                        </h4>
                        {plug.isVip && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ VIP
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {plug.description}
                      </p>

                      {/* Liens de parrainage et direct */}
                      {plug.referralLink ? (
                        <div className="space-y-3 mb-3">
                          {/* Lien de parrainage (avec statistiques) */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <label className="block text-xs font-medium text-green-700 mb-1">
                              🔗 Lien de parrainage (avec stats) :
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={plug.referralLink}
                                readOnly
                                className="flex-1 text-xs bg-white border border-green-300 rounded px-2 py-1 font-mono"
                              />
                              <button
                                onClick={() => copyReferralLink(plug)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  copiedLink === plug._id
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {copiedLink === plug._id ? '✅ Copié' : '📋 Copier'}
                              </button>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              👥 Suit les statistiques de parrainage
                            </div>
                          </div>

                          {/* Lien direct simple (comme dans l'exemple) */}
                          {plug.directLink && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <label className="block text-xs font-medium text-blue-700 mb-1">
                                🎯 Lien direct (comme exemple) :
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={plug.directLink}
                                  readOnly
                                  className="flex-1 text-xs bg-white border border-blue-300 rounded px-2 py-1 font-mono"
                                />
                                <button
                                  onClick={() => copyDirectLink(plug)}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
                                >
                                  📋 Copier
                                </button>
                                <button
                                  onClick={() => shareLinkViaTelegram(plug)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                                >
                                  📱 Partager
                                </button>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                🎯 Redirection directe sans tracking
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-yellow-800">
                              🔄 Lien non généré
                            </p>
                            <button
                              onClick={() => copyReferralLink(plug)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                            >
                              🔗 Générer & Copier
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Statistiques améliorées */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">
                          📊 Statistiques de Parrainage
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-green-100 border border-green-200 p-3 rounded-lg text-center">
                            <div className="text-green-600 font-medium">👥 Personnes invitées</div>
                            <div className="text-3xl font-bold text-green-700 mt-1">
                              {plug.totalReferred || 0}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              via lien de parrainage
                            </div>
                          </div>
                          <div className="bg-blue-100 border border-blue-200 p-3 rounded-lg text-center">
                            <div className="text-blue-600 font-medium">👍 Votes totaux</div>
                            <div className="text-3xl font-bold text-blue-700 mt-1">
                              {plug.likes || 0}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              depuis le bot
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => router.push(`/admin/plugs/${plug._id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Voir détails"
                      >
                        <span className="text-lg">👁️</span>
                      </button>
                    </div>
                  </div>

                  {/* Liste des utilisateurs parrainés (si disponible) */}
                  {plug.referredUsers && plug.referredUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        👥 Derniers utilisateurs invités ({plug.referredUsers.length})
                      </h5>
                      <div className="space-y-1">
                        {plug.referredUsers.slice(0, 3).map((user, index) => (
                          <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                            <span>
                              {user.username ? `@${user.username}` : `Utilisateur ${user.telegramId}`}
                            </span>
                            <span>
                              {new Date(user.invitedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        ))}
                        {plug.referredUsers.length > 3 && (
                          <div className="text-xs text-gray-500">
                            ... et {plug.referredUsers.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {plugs.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl">👥</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune boutique</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Créez d'abord des boutiques pour utiliser le parrainage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
