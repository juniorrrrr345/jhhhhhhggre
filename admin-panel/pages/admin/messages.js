import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

export default function Messages() {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [botUsers, setBotUsers] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification
    let token = localStorage.getItem('adminToken')
    if (!token) {
      token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
      localStorage.setItem('adminToken', token)
    }

    // Récupérer le nombre d'utilisateurs
    fetchBotUsers(token)
  }, [])

  const fetchBotUsers = async (token) => {
    try {
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBotUsers(data.totalUsers || 0)
      }
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        setError('L\'image ne doit pas dépasser 10MB')
        return
      }
      
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
  }

  const sendMessage = async () => {
    if (!message.trim()) {
      setError('Veuillez saisir un message')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')

    try {
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
        localStorage.setItem('adminToken', token)
      }

      console.log('📡 Envoi du message:', message.trim())
      console.log('📸 Avec image:', !!image)

      let imageUrl = null;

      // Étape 1 : Upload de l'image si nécessaire
      if (image) {
        console.log('📤 Upload de l\'image...')
        console.log('📷 Image details:', {
          name: image.name,
          type: image.type,
          size: image.size
        })
        
        try {
          const imageBase64 = await imageToBase64(image)
          console.log('🔄 Base64 conversion done, length:', imageBase64.length)
          
          const uploadResponse = await fetch('/api/cors-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: '/api/upload-image',
              method: 'POST',
              token: token,
              data: {
                imageBase64: imageBase64,
                filename: image.name,
                mimetype: image.type
              }
            })
          })

          console.log('📡 Upload response status:', uploadResponse.status)
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            console.log('📋 Upload result:', uploadResult)
            
            if (uploadResult.success && uploadResult.imageUrl) {
              imageUrl = uploadResult.imageUrl
              console.log('✅ Image uploadée avec succès')
            } else {
              throw new Error(uploadResult.error || 'Pas d\'URL image retournée')
            }
          } else {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || `Erreur HTTP ${uploadResponse.status}`)
          }
        } catch (uploadError) {
          console.error('❌ Erreur upload détaillée:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
      }

      // Étape 2 : Envoi du message avec ou sans image
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/api/broadcast',
          method: 'POST',
          token: token,
          data: {
            message: message.trim(),
            image: imageUrl,
            hasImage: !!image
          }
        })
      })

      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Broadcast result:', result)
        
        if (result.success) {
          setSuccess(`Message ${image ? 'avec image' : ''} envoyé avec succès à ${result.sentCount || 'tous les'} utilisateurs !`)
          setMessage('')
          setImage(null)
          setImagePreview('')
        } else {
          throw new Error(result.error || 'Erreur inconnue')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error)
      setError(`Erreur: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  // Fonction utilitaire pour convertir une image en base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // Plus de loading state nécessaire

  return (
    <Layout title="Messages">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📢 Messages Broadcast</h1>
          <p className="mt-2 text-gray-600">
            Envoyez des messages à tous les utilisateurs de votre bot Telegram
          </p>
        </div>

        {/* Stats utilisateurs */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">
                Utilisateurs connectés: {botUsers}
              </h3>
              <p className="text-blue-700 text-sm">
                Votre message sera envoyé à tous ces utilisateurs
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire d'envoi */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message à envoyer *
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Saisissez votre message ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={4000}
              />
              <div className="mt-1 text-sm text-gray-500 text-right">
                {message.length}/4000 caractères
              </div>
            </div>

            {/* Image optionnelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image optionnelle
              </label>
              
              {!imagePreview ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="text-4xl text-gray-400 mb-2">📷</div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Télécharger une image</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>

            {/* Messages d'état */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Bouton d'envoi */}
            <div className="flex justify-end">
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  sending || !message.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Envoyer le message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">💡 Conseils</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Rédigez des messages courts et clairs</li>
            <li>• Évitez d'envoyer trop de messages d'affilée (limite Telegram)</li>
            <li>• Les images doivent être au format JPG, PNG ou GIF (max 10MB)</li>
            <li>• Le message sera envoyé à tous les utilisateurs qui ont démarré le bot</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}