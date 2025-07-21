import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import Layout from '../../components/Layout'

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    sent: 0,
    failed: 0
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/proxy?endpoint=/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(prev => ({ ...prev, totalUsers: data.totalUsers || 0 }))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/proxy?endpoint=/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.imageUrl
      } else {
        throw new Error('Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload image:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
      return null
    }
  }

  const sendBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message')
      return
    }

    setSending(true)
    setStats(prev => ({ ...prev, sent: 0, failed: 0 }))

    try {
      let imageUrl = image
      
      // Upload de l'image si nécessaire
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setSending(false)
          return
        }
      }

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/proxy?endpoint=/api/broadcast', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          image: imageUrl
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStats(prev => ({
          ...prev,
          sent: data.sent || 0,
          failed: data.failed || 0
        }))
        
        toast.success(`Message envoyé à ${data.sent} utilisateur(s)`)
        
        // Réinitialiser le formulaire
        setMessage('')
        setImage('')
        setImageFile(null)
        setPreview('')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur broadcast:', error)
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Messages de diffusion - Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📢 Messages de diffusion</h1>
            <p className="mt-1 text-sm text-gray-500">
              Envoyez un message à tous les utilisateurs du bot
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Utilisateurs totaux</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Messages envoyés</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.sent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-lg">❌</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Échecs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de diffusion */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau message</h2>
            
            <div className="space-y-4">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Saisissez votre message..."
                  disabled={sending}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {message.length} caractères
                </p>
              </div>

              {/* Image par URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (URL)
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="https://exemple.com/image.jpg"
                  disabled={sending}
                />
              </div>

              {/* Upload d'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ou upload une image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  disabled={sending}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum 5MB - JPG, PNG, GIF
                </p>
              </div>

              {/* Prévisualisation */}
              {(preview || image) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu de l'image
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3">
                    <img
                      src={preview || image}
                      alt="Aperçu"
                      className="max-w-xs max-h-48 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={sendBroadcast}
                  disabled={sending || !message.trim()}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium ${
                    sending || !message.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {sending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    `📢 Envoyer à ${stats.totalUsers} utilisateur(s)`
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setMessage('')
                    setImage('')
                    setImageFile(null)
                    setPreview('')
                  }}
                  disabled={sending}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  🗑️ Effacer
                </button>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Attention
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Ce message sera envoyé à <strong>tous</strong> les utilisateurs du bot.
                    Vérifiez bien votre message avant l'envoi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Toaster position="top-right" />
      </Layout>
    </>
  )
}