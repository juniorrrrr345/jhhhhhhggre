import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { simpleApi } from '../../lib/api-simple'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPlugs: 0,
    activePlugs: 0,
    vipPlugs: 0,
    totalUsers: 0
  })
  const [config, setConfig] = useState(null)
  const [recentShops, setRecentShops] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }

    fetchDashboardData(token)
  }, [])

  const fetchDashboardData = async (token) => {
    try {
      console.log('🔍 Fetching dashboard data via proxy CORS...')
      
      // Récupérer les stats via proxy simple
      const statsData = await simpleApi.getStats(token)
      console.log('✅ Stats data:', statsData)
      
      setStats({
        totalPlugs: statsData.totalPlugs || 0,
        activePlugs: statsData.activePlugs || 0,
        vipPlugs: statsData.vipPlugs || 0,
        totalUsers: 0
      })
      
      // Récupérer la config via proxy simple
      const configData = await simpleApi.getConfig(token)
      console.log('✅ Config data:', configData)
      setConfig(configData)
      
      // Récupérer les dernières boutiques
      const shopsData = await simpleApi.getPlugs(token, { page: 1, limit: 6 })
      console.log('✅ Shops data:', shopsData)
      setRecentShops(shopsData.plugs || [])
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      // Fallback avec des valeurs par défaut
      setStats({
        totalPlugs: 0,
        activePlugs: 0,
        vipPlugs: 0,
        totalUsers: 0
      })
      setRecentShops([])
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      name: 'Total Boutiques',
      value: stats.totalPlugs,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      href: '/admin/plugs'
    },
    {
      name: 'Boutiques Actives',
      value: stats.activePlugs,
      icon: EyeIcon,
      color: 'bg-green-500',
      href: '/admin/plugs?filter=active'
    },
    {
      name: 'Boutiques VIP',
      value: stats.vipPlugs,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/admin/plugs?filter=vip'
    },
    {
      name: 'Utilisateurs Bot',
      value: stats.totalUsers,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-orange-500',
      href: '/admin/stats'
    }
  ]

  const quickActions = [
    {
      name: 'Configuration',
      description: 'Configurer le bot et la boutique',
      href: '/admin/config',
      icon: CogIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Boutiques/Plugs',
      description: 'Gérer les boutiques et plugs',
      href: '/admin/plugs',
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Messages',
      description: 'Envoyer des messages à tous les utilisateurs',
      href: '/admin/messages',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-indigo-500'
    }
  ]

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Bienvenue sur votre Panel Admin ! 👋</h1>
          <p className="text-blue-100">
            Gérez facilement votre bot Telegram et vos boutiques depuis cette interface.
          </p>
        </div>

        {/* Statistiques */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <div
                key={card.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(card.href)}
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {card.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.name}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-center">
                  <div className={`rounded-lg p-2 ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boutiques récentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Boutiques récentes</h2>
            <button
              onClick={() => router.push('/admin/plugs')}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Voir toutes →
            </button>
          </div>
          
          {recentShops.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune boutique</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre première boutique.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/plugs')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Ajouter une boutique
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentShops.map((shop) => (
                <div
                  key={shop._id}
                  className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/plugs`)}
                >
                  <div className="flex items-start space-x-3">
                    {shop.image ? (
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={shop.image}
                        alt={shop.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {shop.name}
                        </h3>
                        {shop.isVip && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {shop.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {shop.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        {shop.likes > 0 && (
                          <span className="text-xs text-gray-500">
                            ❤️ {shop.likes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}