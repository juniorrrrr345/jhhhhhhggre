import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function ShopSocialMediaManager() {
  const [socialMedias, setSocialMedias] = useState([
    {
      id: 'telegram',
      name: 'Telegram',
      emoji: '📱',
      url: 'https://t.me/+zcP68c4M_3NlM2Y0',
      logo: 'https://i.imgur.com/PP2GVMv.png'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      emoji: '📸',
      url: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr',
      logo: 'https://i.imgur.com/O5TxmOS.jpeg'
    },
    {
      id: 'luffa',
      name: 'Luffa',
      emoji: '🧽',
      url: 'https://callup.luffa.im/c/EnvtiTHkbvP',
      logo: 'https://i.imgur.com/PtqXOhb.png'
    },
    {
      id: 'discord',
      name: 'Discord',
      emoji: '🎮',
      url: 'https://discord.gg/g2dACUC3',
      logo: 'https://i.imgur.com/oXPAefr.png'
    },
    {
      id: 'potato',
      name: 'Potato',
      emoji: '🥔',
      url: 'https://potato.com',
      logo: 'https://i.imgur.com/44ScFxY.jpeg'
    }
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    loadSocialMedias()
  }, [])

  const loadSocialMedias = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      const config = await simpleApi.getConfig(token)
      
      if (config && config.shopSocialMediaList && config.shopSocialMediaList.length > 0) {
        // Merge des données sauvegardées avec les valeurs par défaut
        const updatedSocialMedias = socialMedias.map(defaultSocial => {
          const savedSocial = config.shopSocialMediaList.find(s => s.id === defaultSocial.id)
          return savedSocial ? { ...defaultSocial, ...savedSocial } : defaultSocial
        })
        setSocialMedias(updatedSocialMedias)
      }
    } catch (error) {
      console.log('Erreur chargement:', error.message)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const updateSocialMedia = (id, field, value) => {
    setSocialMedias(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const saveSocialMedias = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      
      const configData = {
        shopSocialMediaList: socialMedias
      }
      
      await simpleApi.updateConfig(token, configData)
      toast.success('✅ Réseaux sociaux sauvegardés !')
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Réseaux Shop - Admin Panel</title>
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
        <title>Réseaux Shop - Admin Panel</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">🏪 Gestion Réseaux Shop</h1>
              <p className="mt-2 text-gray-600">
                Modifiez les noms et liens des 5 réseaux sociaux de la boutique
              </p>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    📱 Réseaux Sociaux de la Boutique
                  </h2>
                  <button
                    onClick={saveSocialMedias}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>💾 Sauvegarder</>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {socialMedias.map((social) => (
                    <div key={social.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-4 mb-4">
                        <img 
                          src={social.logo}
                          alt={social.name}
                          className="w-12 h-12 object-contain rounded"
                          onError={(e) => {
                            e.target.src = 'https://i.imgur.com/PP2GVMv.png';
                          }}
                        />
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du réseau
                            </label>
                            <input
                              type="text"
                              value={social.name}
                              onChange={(e) => updateSocialMedia(social.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nom du réseau"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lien/URL
                            </label>
                            <input
                              type="url"
                              value={social.url}
                              onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://exemple.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          💡 Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Ces 5 réseaux sont fixes pour la boutique. Vous pouvez modifier leurs noms et liens, puis cliquer "Sauvegarder" pour appliquer les changements sur l'accueil boutique.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}