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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPlugs: 0,
    activePlugs: 0,
    vipPlugs: 0,
    totalUsers: 0
  })
  const [config, setConfig] = useState(null)
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
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
      console.log('🔍 Fetching dashboard data from:', apiBaseUrl)
      
      // Récupérer les stats des plugs
      const plugsResponse = await fetch(`${apiBaseUrl}/api/plugs?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('📊 Plugs response status:', plugsResponse.status)
      
      if (plugsResponse.ok) {
        const plugsData = await plugsResponse.json()
        console.log('✅ Plugs data:', plugsData)
        setStats({
          totalPlugs: plugsData.pagination?.total || plugsData.plugs?.length || 0,
          activePlugs: plugsData.plugs?.filter(p => p.isActive).length || 0,
          vipPlugs: plugsData.plugs?.filter(p => p.isVip).length || 0,
          totalUsers: 0 // À implémenter plus tard
        })
      } else {
        console.error('❌ Plugs response error:', plugsResponse.status, plugsResponse.statusText)
      }

      // Récupérer la config
      const configResponse = await fetch(`${apiBaseUrl}/api/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('⚙️ Config response status:', configResponse.status)
      
      if (configResponse.ok) {
        const configData = await configResponse.json()
        console.log('✅ Config data:', configData)
        setConfig(configData)
      } else {
        console.error('❌ Config response error:', configResponse.status, configResponse.statusText)
      }

    } catch (error) {
      console.error('💥 Erreur fetch dashboard:', error)
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
      name: 'Ajouter une boutique',
      description: 'Créer une nouvelle boutique/plug',
      href: '/admin/plugs/new',
      icon: PlusIcon,
      color: 'bg-blue-500'
    },
    {
      name: '🎨 Éditeur Visuel',
      description: 'Modifier le bot en mode visuel WYSIWYG',
      href: '/admin/visual-config',
      icon: EyeIcon,
      color: 'bg-indigo-500'
    },
    {
      name: 'Messages du Bot',
      description: 'Configuration avancée des messages',
      href: '/admin/messages',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Configuration générale',
      description: 'Paramètres du bot et réseaux sociaux',
      href: '/admin/config',
      icon: CogIcon,
      color: 'bg-purple-500'
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

        {/* Configuration actuelle */}
        {config && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration actuelle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message d'accueil</h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {config.messages?.welcome || 'Non défini'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Réseaux sociaux</h3>
                <div className="space-y-1">
                  {config.socialMedia?.telegram && (
                    <p className="text-sm text-gray-600">📱 Telegram: {config.socialMedia.telegram}</p>
                  )}
                  {config.socialMedia?.whatsapp && (
                    <p className="text-sm text-gray-600">💬 WhatsApp: {config.socialMedia.whatsapp}</p>
                  )}
                  {!config.socialMedia?.telegram && !config.socialMedia?.whatsapp && (
                    <p className="text-sm text-gray-500">Aucun réseau configuré</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}