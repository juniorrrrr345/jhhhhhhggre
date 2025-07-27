import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

export default function BroadcastMessages() {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState('')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  const router = useRouter()

  const sendBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message')
      return
    }

    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Non authentifié')
      return
    }

    setSending(true)
    setStats({ sent: 0, failed: 0, total: 0 })

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/admin/broadcast',
          method: 'POST',
          data: {
            message: message.trim(),
            image: image.trim() || null
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStats({
          sent: data.sent || 0,
          failed: data.failed || 0,
          total: data.total || 0
        })
        toast.success(`Message envoyé à ${data.sent} utilisateurs`)
        setMessage('')
        setImage('')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || 'Erreur d\'envoi')
      }
    } catch (error) {
      console.error('❌ Erreur broadcast:', error)
      toast.error('Erreur : ' + error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Messages aux utilisateurs - Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Retour
            </button>
            
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                  📢 Messages aux utilisateurs
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Envoyer un message à tous les utilisateurs du bot Telegram
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          {(stats.sent > 0 || stats.failed > 0) && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📊 Dernier envoi
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-blue-400 text-lg">👥</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total utilisateurs
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.total}
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
                          <div className="text-green-400 text-lg">✅</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Messages envoyés
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.sent}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-red-400 text-lg">❌</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Échecs
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.failed}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Saisissez votre message à envoyer à tous les utilisateurs..."
                      disabled={sending}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Ce message sera envoyé à tous les utilisateurs qui ont interagi avec le bot.
                  </p>
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image (optionnel)
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com/image.jpg"
                      disabled={sending}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    URL d'une image à joindre au message (optionnel).
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={sendBroadcast}
                    disabled={sending || !message.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        📢 Envoyer le message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-yellow-400 text-lg">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Attention
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Cette action enverra le message à tous les utilisateurs du bot. 
                    Assurez-vous que le contenu est approprié et respecte les conditions d'utilisation de Telegram.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}