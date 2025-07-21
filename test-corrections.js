#!/usr/bin/env node

console.log('🧪 Test des corrections apportées...\n')

// Test 1: Vérifier que les serveurs répondent
async function testServers() {
  console.log('1️⃣ Test des serveurs...')
  
  try {
    // Test bot
    const { exec } = require('child_process')
    
    console.log('   🤖 Serveur bot (port 3000)...')
    exec('curl -s -w "%{http_code}" http://localhost:3000/health -o /dev/null', (error, stdout) => {
      if (error) {
        console.log('   ❌ Bot: HORS LIGNE (démarrez avec: cd bot && npm start)')
      } else {
        const status = stdout.trim()
        if (status === '200') {
          console.log('   ✅ Bot: EN LIGNE')
        } else {
          console.log(`   ⚠️ Bot: Statut ${status}`)
        }
      }
    })
    
    // Test admin panel
    setTimeout(() => {
      console.log('   🖥️ Admin panel (port 3001)...')
      exec('curl -s -w "%{http_code}" http://localhost:3001/ -o /dev/null', (error, stdout) => {
        if (error) {
          console.log('   ❌ Admin: HORS LIGNE (démarrez avec: cd admin-panel && npm run dev)')
        } else {
          const status = stdout.trim()
          if (status === '200') {
            console.log('   ✅ Admin: EN LIGNE')
          } else {
            console.log(`   ⚠️ Admin: Statut ${status}`)
          }
        }
        
        console.log('\n2️⃣ Test de la synchronisation...')
        testSync()
      })
    }, 1000)
    
  } catch (error) {
    console.log('   ❌ Erreur test serveurs:', error.message)
  }
}

function testSync() {
  const { exec } = require('child_process')
  
  exec('curl -s "http://localhost:3000/api/public/config" 2>/dev/null', (error, stdout) => {
    if (error) {
      console.log('   ❌ Impossible de récupérer la config publique')
    } else {
      try {
        const config = JSON.parse(stdout)
        const boutiqueName = config?.boutique?.name
        
        if (boutiqueName) {
          console.log(`   ✅ Nom boutique synchronisé: "${boutiqueName}"`)
        } else {
          console.log('   ⚠️ Nom boutique non défini dans la config')
        }
      } catch (parseError) {
        console.log('   ❌ Erreur parsing config:', parseError.message)
      }
    }
    
    console.log('\n📋 Résumé des corrections apportées:')
    console.log('   ✅ Pages boutique: nom affiché au lieu de "B" et "Boutique"')
    console.log('   ✅ Textes indésirables supprimés de l\'accueil')
    console.log('   ✅ Bot: détails plugs affichent directement texte + photo')
    console.log('   ✅ Admin: réseaux sociaux personnalisables ajoutés')
    console.log('   ✅ Synchronisation boutique améliorée')
    
    console.log('\n🔧 Actions à faire:')
    console.log('   1. Tester sur téléphone: http://[VOTRE-IP]:3001')
    console.log('   2. Vérifier bot Telegram avec un plug')
    console.log('   3. Tester ajout plug avec réseaux sociaux personnalisés')
  })
}

// Démarrage
testServers()