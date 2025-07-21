import { useState } from 'react'
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

export default function SocialMediaManager({ socialMedia, onChange }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSocial, setNewSocial] = useState({
    name: '',
    emoji: '',
    url: '',
    order: 0
  })

  const handleAdd = () => {
    if (newSocial.name && newSocial.emoji && newSocial.url) {
      const newItem = {
        ...newSocial,
        order: socialMedia.length
      }
      onChange([...socialMedia, newItem])
      setNewSocial({ name: '', emoji: '', url: '', order: 0 })
      setShowAddForm(false)
    }
  }

  const handleRemove = (index) => {
    const updated = socialMedia.filter((_, i) => i !== index)
    // Réajuster les ordres
    const reordered = updated.map((item, i) => ({ ...item, order: i }))
    onChange(reordered)
  }

  const handleMove = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === socialMedia.length - 1)
    ) {
      return
    }

    const newArray = [...socialMedia]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Échanger les éléments
    const temp = newArray[index]
    newArray[index] = newArray[targetIndex]
    newArray[targetIndex] = temp
    
    // Réajuster les ordres
    const reordered = newArray.map((item, i) => ({ ...item, order: i }))
    onChange(reordered)
  }

  const handleUpdate = (index, field, value) => {
    const updated = socialMedia.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-900">🔗 Réseaux Sociaux d'Accueil</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Ajouter
        </button>
      </div>

      <p className="text-sm text-gray-600">
        📱 Ces boutons apparaîtront sur le message d'accueil du bot
      </p>

      {/* Liste des réseaux sociaux existants */}
      {socialMedia.length > 0 && (
        <div className="space-y-3">
          {socialMedia.map((social, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{social.emoji}</span>
                  <span className="font-medium">{social.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Monter"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === socialMedia.length - 1}
                    className={`p-1 rounded ${index === socialMedia.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Descendre"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={social.name}
                    onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Telegram"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={social.emoji}
                    onChange={(e) => handleUpdate(index, 'emoji', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="📱"
                    maxLength="4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="https://t.me/votre_canal"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Nouveau réseau social</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={newSocial.name}
                onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Telegram"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Emoji
              </label>
              <input
                type="text"
                value={newSocial.emoji}
                onChange={(e) => setNewSocial({ ...newSocial, emoji: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="📱"
                maxLength="4"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={newSocial.url}
                onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="https://t.me/votre_canal"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewSocial({ name: '', emoji: '', url: '', order: 0 })
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={!newSocial.name || !newSocial.emoji || !newSocial.url}
              className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {socialMedia.length === 0 && !showAddForm && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-2">Aucun réseau social configuré</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Ajouter le premier réseau social
          </button>
        </div>
      )}
    </div>
  )
}