export default function Test() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Test Page - Panel Admin</h1>
      <p>✅ Le déploiement Vercel fonctionne parfaitement !</p>
      <p>🔗 API URL: {process.env.API_BASE_URL || 'Non définie'}</p>
      <p>🔒 Admin Password: {process.env.ADMIN_PASSWORD ? 'Définie' : 'Non définie'}</p>
      <br />
      <a href="/" style={{ color: 'blue' }}>← Retour à la connexion</a>
    </div>
  )
}