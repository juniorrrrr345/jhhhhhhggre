import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import {
  UsersIcon,
  LinkIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

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
    loadReferralData(token)
  }, [])

  const loadReferralData = async (token) => {
    try {
      setLoading(true)
      
      // Charger toutes les boutiques avec leurs données de parrainage
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/api/plugs',
          method: 'GET',
          token: token
        })
      })

      if (response.ok) {
        const data = await response.json()
        const plugsWithReferrals = []
        let totalReferred = 0

        // Pour chaque boutique, récupérer ses données de parrainage
        for (const plug of data) {
          try {
            const referralResponse = await fetch('/api/cors-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                endpoint: `/api/plugs/${plug._id}/referral`,
                method: 'GET',
                token: token
              })
            })

            if (referralResponse.ok) {
              const referralData = await referralResponse.json()
              plugsWithReferrals.push({
                ...plug,
                ...referralData
              })
              totalReferred += referralData.totalReferred || 0
            } else {
              plugsWithReferrals.push(plug)
            }
          } catch (error) {
            console.error(`Erreur parrainage pour ${plug.name}:`, error)
            plugsWithReferrals.push(plug)
          }
        }

        setPlugs(plugsWithReferrals)
        setTotalStats({
          totalPlugs: data.length,
          totalReferred: totalReferred,
          totalUsers: 0 // À implémenter si nécessaire
        })
      }
    } catch (error) {
      console.error('Erreur chargement parrainage:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async (plug) => {
    try {
      if (plug.referralLink) {
        await navigator.clipboard.writeText(plug.referralLink)
        setCopiedLink(plug._id)
        setTimeout(() => setCopiedLink(null), 2000)
        toast.success(`🔗 Lien de ${plug.name} copié !`)
      } else {
        toast.error('Lien non disponible')
      }
    } catch (error) {
      console.error('Erreur copie:', error)
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
                      <UsersIcon className="h-6 w-6 text-blue-400" />
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
                      <ChartBarIcon className="h-6 w-6 text-green-400" />
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
                      <LinkIcon className="h-6 w-6 text-purple-400" />
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
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              🏪 Liens de Parrainage par Boutique
            </h3>

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

                      {/* Lien de parrainage */}
                      {plug.referralLink ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Lien de parrainage :
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={plug.referralLink}
                              readOnly
                              className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 font-mono"
                            />
                            <button
                              onClick={() => copyReferralLink(plug)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                copiedLink === plug._id
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              {copiedLink === plug._id ? '✅ Copié' : '📋 Copier'}
                            </button>
                            <button
                              onClick={() => shareLinkViaTelegram(plug)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                            >
                              📱 Partager
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-yellow-800">
                            🔄 Lien en cours de génération...
                          </p>
                        </div>
                      )}

                      {/* Statistiques */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-green-600 font-medium">Personnes invitées</div>
                          <div className="text-2xl font-bold text-green-700">
                            {plug.totalReferred || 0}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-blue-600 font-medium">Likes totaux</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {plug.likes || 0}
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
                        <EyeIcon className="h-5 w-5" />
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
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
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
