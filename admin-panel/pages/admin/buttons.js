import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function ButtonsConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    contact: {
      enabled: true,
      text: '',
      content: ''
    },
    info: {
      enabled: true,
      text: '',
      content: ''
    }
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const data = await simpleApi.getConfig()
      setConfig(data)
      
      // Pré-remplir le formulaire avec les données existantes
      if (data?.buttons) {
        setFormData({
          contact: {
            enabled: data.buttons.contact?.enabled ?? true,
            text: data.buttons.contact?.text || '📞 Contact',
            content: data.buttons.contact?.content || 'Contactez-nous pour plus d\'informations.'
          },
          info: {
            enabled: data.buttons.info?.enabled ?? true,
            text: data.buttons.info?.text || 'ℹ️ Info',
            content: data.buttons.info?.content || 'Informations sur notre plateforme.'
          }
        })
      }
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (buttonType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [buttonType]: {
        ...prev[buttonType],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Préparer les données à envoyer
      const updateData = {
        buttons: {
          ...config?.buttons,
          contact: formData.contact,
          info: formData.info
        }
      }

      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/api/config',
          method: 'PUT',
          data: updateData
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Configuration des boutons sauvegardée avec succès !')
          await fetchConfig() // Recharger la config
        } else {
          throw new Error(result.error || 'Erreur inconnue')
        }
      } else {
        throw new Error('Erreur serveur')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const testButton = async (buttonType) => {
    try {
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/api/test-button',
          method: 'POST',
          data: { buttonType, config: formData[buttonType] }
        })
      })

      if (response.ok) {
        toast.success(`Test du bouton ${buttonType} envoyé !`)
      } else {
        toast.error(`Erreur lors du test du bouton ${buttonType}`)
      }
    } catch (error) {
      console.error(`❌ Erreur test ${buttonType}:`, error)
      toast.error(`Erreur lors du test: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <Layout title="Configuration des Boutons">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#ffffff'
        }}>
          <div>⏳ Chargement de la configuration...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Configuration des Boutons">
      <Head>
        <title>Configuration des Boutons - Administration</title>
      </Head>

      <div style={{ padding: '20px', color: '#ffffff' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#ffffff',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          border: '2px solid #3b82f6',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          🔘 CONFIGURATION DES BOUTONS BOT 🔘
        </h1>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          
          {/* Bouton Contact */}
          <div style={{
            backgroundColor: '#1f2937',
            padding: '25px',
            borderRadius: '12px',
            border: '2px solid #22c55e'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📞 Bouton Contact
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#ffffff'
              }}>
                <input
                  type="checkbox"
                  checked={formData.contact.enabled}
                  onChange={(e) => handleInputChange('contact', 'enabled', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px'
                  }}
                />
                Activé
              </label>
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Texte du bouton:
              </label>
              <input
                type="text"
                value={formData.contact.text}
                onChange={(e) => handleInputChange('contact', 'text', e.target.value)}
                placeholder="📞 Contact"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Contenu du message:
              </label>
              <textarea
                value={formData.contact.content}
                onChange={(e) => handleInputChange('contact', 'content', e.target.value)}
                placeholder="Contactez-nous pour plus d'informations..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={() => testButton('contact')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🧪 Tester ce bouton
            </button>
          </div>

          {/* Bouton Info */}
          <div style={{
            backgroundColor: '#1f2937',
            padding: '25px',
            borderRadius: '12px',
            border: '2px solid #f59e0b'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ℹ️ Bouton Info
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#ffffff'
              }}>
                <input
                  type="checkbox"
                  checked={formData.info.enabled}
                  onChange={(e) => handleInputChange('info', 'enabled', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px'
                  }}
                />
                Activé
              </label>
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Texte du bouton:
              </label>
              <input
                type="text"
                value={formData.info.text}
                onChange={(e) => handleInputChange('info', 'text', e.target.value)}
                placeholder="ℹ️ Info"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Contenu du message:
              </label>
              <textarea
                value={formData.info.content}
                onChange={(e) => handleInputChange('info', 'content', e.target.value)}
                placeholder="Informations sur notre plateforme..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={() => testButton('info')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🧪 Tester ce bouton
            </button>
          </div>
        </div>

        {/* Bouton de sauvegarde global */}
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #6366f1',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '15px 40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: saving ? '#374151' : '#22c55e',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '0 auto'
            }}
          >
            {saving ? '⏳' : '💾'} 
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>

        {/* Preview des boutons */}
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #8b5cf6',
          marginTop: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#8b5cf6'
          }}>
            👀 Aperçu des boutons
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            {formData.contact.enabled && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#22c55e',
                color: '#000000',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {formData.contact.text}
              </div>
            )}
            
            {formData.info.enabled && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#f59e0b',
                color: '#000000',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {formData.info.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}