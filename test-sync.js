#!/usr/bin/env node

const fetch = require('node-fetch')

async function testSynchronization() {
  console.log('🔍 Test de synchronisation des configurations...\n')
  
  // Test du serveur bot
  console.log('1. Test du serveur bot (port 3000)...')
  try {
    const botResponse = await fetch('http://localhost:3000/api/public/config', {
      timeout: 5000
    })
    
    if (botResponse.ok) {
      const botData = await botResponse.json()
      console.log('✅ Serveur bot: EN LIGNE')
      console.log(`📊 Nom boutique (bot): "${botData.boutique?.name || 'Non défini'}"`)
      console.log(`🎨 Logo: ${botData.boutique?.logo ? 'Défini' : 'Non défini'}`)
      console.log(`📝 Sous-titre: "${botData.boutique?.subtitle || 'Non défini'}"`)
    } else {
      console.log(`❌ Serveur bot: ERREUR (${botResponse.status})`)
    }
  } catch (error) {
    console.log('❌ Serveur bot: HORS LIGNE')
    console.log(`   Erreur: ${error.message}`)
  }
  
  console.log('\n2. Test du proxy admin panel (port 3001)...')
  try {
    const proxyResponse = await fetch('http://localhost:3001/api/proxy?endpoint=/api/public/config', {
      timeout: 5000
    })
    
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json()
      console.log('✅ Proxy admin panel: EN LIGNE')
      console.log(`📊 Nom boutique (proxy): "${proxyData.boutique?.name || 'Non défini'}"`)
    } else {
      console.log(`❌ Proxy admin panel: ERREUR (${proxyResponse.status})`)
    }
  } catch (error) {
    console.log('❌ Proxy admin panel: HORS LIGNE')
    console.log(`   Erreur: ${error.message}`)
  }
  
  console.log('\n🔧 Instructions:')
  console.log('- Si le serveur bot est hors ligne: cd bot && npm start')
  console.log('- Si le proxy admin est hors ligne: cd admin-panel && npm run dev')
  console.log('- Les deux serveurs doivent être en ligne pour la synchronisation')
}

// Vérifier si node-fetch est disponible
try {
  require('node-fetch')
  testSynchronization().catch(console.error)
} catch (error) {
  console.log('⚠️  node-fetch non installé. Test avec curl...\n')
  
  const { exec } = require('child_process')
  
  console.log('1. Test du serveur bot...')
  exec('curl -s -w "%{http_code}" http://localhost:3000/api/public/config -o /dev/null', (error, stdout) => {
    if (error) {
      console.log('❌ Serveur bot: HORS LIGNE')
    } else {
      const statusCode = stdout.trim()
      if (statusCode === '200') {
        console.log('✅ Serveur bot: EN LIGNE')
      } else {
        console.log(`❌ Serveur bot: ERREUR (${statusCode})`)
      }
    }
    
    console.log('\n2. Test du proxy admin panel...')
    exec('curl -s -w "%{http_code}" http://localhost:3001/api/proxy?endpoint=/api/public/config -o /dev/null', (error2, stdout2) => {
      if (error2) {
        console.log('❌ Proxy admin panel: HORS LIGNE')
      } else {
        const statusCode2 = stdout2.trim()
        if (statusCode2 === '200') {
          console.log('✅ Proxy admin panel: EN LIGNE')
        } else {
          console.log(`❌ Proxy admin panel: ERREUR (${statusCode2})`)
        }
      }
      
      console.log('\n🔧 Instructions:')
      console.log('- Si le serveur bot est hors ligne: cd bot && npm start')
      console.log('- Si le proxy admin est hors ligne: cd admin-panel && npm run dev')
    })
  })
}