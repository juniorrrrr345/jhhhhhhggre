import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
}

export default function LanguagesAdmin() {
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.status === 401) {
        router.push('/')
        return
      }

      const data = await response.json()
      
      // Initialiser la structure languages si elle n'existe pas
      if (!data.languages) {
        data.languages = {
          enabled: false,
          currentLanguage: 'fr',
          availableLanguages: Object.entries(languages).map(([code, lang]) => ({
            code,
            name: lang.name,
            flag: lang.flag,
            enabled: true
          })),
          translations: new Map()
        }
      }
      
      setConfig(data)
    } catch (error) {
      toast.error('Erreur lors du chargement')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('❌ Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const toggleLanguageEnabled = () => {
    setConfig(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        enabled: !prev.languages.enabled
      }
    }))
  }

  const setCurrentLanguage = (langCode) => {
    setConfig(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        currentLanguage: langCode
      }
    }))
  }

  const toggleAvailableLanguage = (langCode) => {
    setConfig(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        availableLanguages: prev.languages.availableLanguages.map(lang => 
          lang.code === langCode 
            ? { ...lang, enabled: !lang.enabled }
            : lang
        )
      }
    }))
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #007AFF',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: '#000000', 
      minHeight: '100vh', 
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #333',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#000000',
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.push('/admin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007AFF',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← Retour
            </button>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              🌍 Configuration des Langues
            </h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#333' : '#007AFF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* Activation du système */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
            Système de Traduction
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '44px',
              height: '24px'
            }}>
              <input
                type="checkbox"
                checked={config?.languages?.enabled || false}
                onChange={toggleLanguageEnabled}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: config?.languages?.enabled ? '#007AFF' : '#333',
                transition: '0.4s',
                borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: config?.languages?.enabled ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
            
            <span style={{ fontSize: '16px' }}>
              {config?.languages?.enabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#888', 
            margin: '12px 0 0 0' 
          }}>
            Active le bouton de sélection de langue dans le bot
          </p>
        </div>

        {/* Langue actuelle */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
            Langue Actuelle
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => setCurrentLanguage(code)}
                style={{
                  padding: '12px',
                  backgroundColor: config?.languages?.currentLanguage === code ? '#007AFF' : '#333',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Langues disponibles */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
            Langues Disponibles
          </h2>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#888', 
            margin: '0 0 16px 0' 
          }}>
            Sélectionnez les langues qui apparaîtront dans le sélecteur
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {config?.languages?.availableLanguages?.map((lang) => (
              <div key={lang.code} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#333',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {lang.flag} {lang.name}
                </span>
                
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={lang.enabled}
                    onChange={() => toggleAvailableLanguage(lang.code)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: lang.enabled ? '#007AFF' : '#666',
                    transition: '0.4s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: lang.enabled ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
            ℹ️ Informations
          </h2>
          
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: '#888',
            fontSize: '14px'
          }}>
            <li>Les traductions par défaut sont automatiquement chargées</li>
            <li>Vous pouvez personnaliser les traductions via l'API</li>
            <li>La langue actuelle s'applique à tout le bot</li>
            <li>Les utilisateurs peuvent changer leur langue individuellement (si activé)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}