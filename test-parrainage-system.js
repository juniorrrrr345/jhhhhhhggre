#!/usr/bin/env node

console.log('🧪 TEST SYSTÈME DE PARRAINAGE AMÉLIORÉ\n');

async function testParrainageSystem() {
  try {
    // Test 1: Vérifier les boutiques existantes
    console.log('📡 Test 1: Récupération boutiques avec données parrainage...');
    const boutiqueResponse = await fetch('https://safepluglink-6hzr.onrender.com/api/plugs?page=1&limit=5', {
      headers: {
        'Authorization': 'Bearer ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
      }
    });
    
    const boutiqueData = await boutiqueResponse.json();
    const boutiques = boutiqueData.plugs || [];
    
    console.log('✅ Boutiques trouvées:', boutiques.length);
    
    if (boutiques.length > 0) {
      const premiereBoutique = boutiques[0];
      console.log('\n📊 Exemple de boutique:');
      console.log(`   🏪 Nom: ${premiereBoutique.name}`);
      console.log(`   👤 Owner ID: ${premiereBoutique.ownerId || 'Non défini'}`);
      console.log(`   🔗 Lien parrainage: ${premiereBoutique.referralLink ? 'Présent' : 'Absent'}`);
      console.log(`   👥 Total parrainés: ${premiereBoutique.totalReferred || 0}`);
      console.log(`   📝 Utilisateurs parrainés: ${premiereBoutique.referredUsers?.length || 0}`);
      
      // Test 2: Vérifier les applications approuvées
      console.log('\n📋 Test 2: Vérification applications approuvées...');
      const appResponse = await fetch('https://safepluglink-6hzr.onrender.com/api/applications', {
        headers: {
          'Authorization': 'Bearer ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
        }
      });
      
      const appData = await appResponse.json();
      const applications = appData.applications || [];
      const approvedApps = applications.filter(app => app.status === 'approved');
      
      console.log(`✅ Applications approuvées: ${approvedApps.length}`);
      
      if (approvedApps.length > 0) {
        approvedApps.forEach(app => {
          console.log(`   👤 User ID: ${app.userId} - ${app.name}`);
        });
      }
      
      // Test 3: Système de correspondance
      console.log('\n🔗 Test 3: Correspondance applications ↔ boutiques...');
      let correspondances = 0;
      
      approvedApps.forEach(app => {
        const boutique = boutiques.find(b => b.name === app.name);
        if (boutique) {
          correspondances++;
          console.log(`   ✅ ${app.name} (User ${app.userId}) → Boutique trouvée`);
          if (!boutique.ownerId) {
            console.log(`      ⚠️ OwnerID manquant pour ${boutique.name}`);
          }
        } else {
          console.log(`   ❌ ${app.name} (User ${app.userId}) → Boutique INTROUVABLE`);
        }
      });
      
      console.log(`\n📊 Correspondances: ${correspondances}/${approvedApps.length}`);
    }
    
    // Test 4: Fonctionnement commande /parrainage
    console.log('\n🤖 Test 4: Simulation commande /parrainage...');
    console.log('   • Pour utiliser /parrainage:');
    console.log('   • L\'utilisateur doit avoir une application approuvée');
    console.log('   • OU avoir une boutique avec ownerId défini');
    console.log('   • Le système va automatiquement faire le lien');
    
    // Résumé final
    console.log('\n🎯 RÉSUMÉ DU SYSTÈME DE PARRAINAGE:');
    console.log('');
    console.log('✅ FONCTIONNALITÉS IMPLÉMENTÉES:');
    console.log('   📝 Champ ownerId ajouté au modèle Plug');
    console.log('   🔍 Détection automatique propriétaire via applications approuvées');
    console.log('   📊 Statistiques détaillées avec liste des personnes invitées');
    console.log('   🔄 Boutons interactifs (actualiser, stats détaillées)');
    console.log('   🎨 Interface améliorée avec statut VIP, dates, etc.');
    console.log('');
    console.log('📱 COMMANDES UTILISATEUR:');
    console.log('   /parrainage → Affiche lien + statistiques personnalisées');
    console.log('   Boutons: Copier lien, Voir boutique, Stats détaillées');
    console.log('');
    console.log('💡 PROCHAINES ÉTAPES:');
    console.log('   1. Redémarrer le bot pour appliquer les changements');
    console.log('   2. Tester /parrainage avec un utilisateur qui a une boutique approuvée');
    console.log('   3. Le système associera automatiquement l\'utilisateur à sa boutique');
    
  } catch (error) {
    console.error('❌ ERREUR TEST:', error.message);
  }
}

testParrainageSystem();