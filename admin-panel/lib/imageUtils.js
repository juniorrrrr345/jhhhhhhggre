// Utilitaires pour la gestion des images sur Vercel

/**
 * Détermine si une URL d'image doit être proxifiée
 * @param {string} imageUrl - L'URL originale de l'image
 * @returns {boolean}
 */
export function shouldProxyImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return false
  
  // Toujours proxifier les images externes pour éviter les problèmes CORS sur Vercel
  const externalDomains = [
    'postimg.cc',
    'i.postimg.cc',
    'imgur.com',
    'i.imgur.com',
    'cdn.discordapp.com',
    'media.discordapp.net'
  ]
  
  return externalDomains.some(domain => imageUrl.includes(domain))
}

/**
 * Génère l'URL proxifiée pour une image
 * @param {string} imageUrl - L'URL originale de l'image
 * @returns {string} - L'URL proxifiée ou l'URL originale si pas de proxy nécessaire
 */
export function getProxiedImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return ''
  
  // Si l'image doit être proxifiée, utiliser notre proxy
  if (shouldProxyImage(imageUrl)) {
    const encodedUrl = encodeURIComponent(imageUrl)
    return `/api/image-proxy?url=${encodedUrl}`
  }
  
  // Sinon retourner l'URL originale
  return imageUrl
}

/**
 * Fonction pour tester le chargement d'une image
 * @param {string} imageUrl - L'URL de l'image à tester
 * @returns {Promise<boolean>} - true si l'image se charge, false sinon
 */
export function testImageLoad(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imageUrl
    
    // Timeout après 5 secondes
    setTimeout(() => resolve(false), 5000)
  })
}