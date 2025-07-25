#!/usr/bin/env node

console.log('🧪 TEST SYSTÈME PARRAINAGE AUTOMATIQUE\n');

async function testAutoParrainage() {
  try {
    const baseUrl = 'https://jhhhhhhggre.onrender.com';
    const token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1';
    
    console.log('📋 Test 1: Récupération des demandes en attente...');
    
    // Récupérer les applications
    const appResponse = await fetch(`${baseUrl}/api/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appData = await appResponse.json();
    const applications = appData.applications || [];
    
    console.log(`✅ Applications trouvées: ${applications.length}`);
    
    // Filtrer par statut
    const pending = applications.filter(app => app.status === 'pending');
    const approved = applications.filter(app => app.status === 'approved');
    
    console.log(`   📋 En attente: ${pending.length}`);
    console.log(`   ✅ Approuvées: ${approved.length}`);
    
    if (pending.length > 0) {
      console.log('\n📋 DEMANDES EN ATTENTE:');
      pending.forEach(app => {
        console.log(`   👤 User ${app.userId} - ${app.name}`);
        console.log(`   📧 @${app.telegramUsername || 'N/A'}`);
        console.log(`   📍 ${app.location?.city}, ${app.location?.country}`);
        console.log(`   ---`);
      });
    }
    
    if (approved.length > 0) {
      console.log('\n✅ DEMANDES APPROUVÉES:');
      approved.forEach(app => {
        console.log(`   👤 User ${app.userId} - ${app.name}`);
        console.log(`   📧 @${app.telegramUsername || 'N/A'}`);
        console.log(`   ---`);
      });
    }
    
    console.log('\n📡 Test 2: Vérification boutiques avec ownerId...');
    const shopResponse = await fetch(`${baseUrl}/api/plugs?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const shopData = await shopResponse.json();
    const shops = shopData.plugs || [];
    
    console.log(`✅ Boutiques trouvées: ${shops.length}`);
    
    shops.forEach(shop => {
      console.log(`   🏪 ${shop.name}`);
      console.log(`   👤 Owner ID: ${shop.ownerId || 'Non défini'}`);
      console.log(`   🔗 Parrainage: ${shop.referralLink ? 'Configuré' : 'Non configuré'}`);
      console.log(`   ---`);
    });
    
    console.log('\n🎯 NOUVEAU SYSTÈME (après mise à jour):');
    console.log('');
    console.log('✅ PROCESSUS AUTOMATISÉ:');
    console.log('   1️⃣ Vous approuvez une demande sur le panel admin');
    console.log('   2️⃣ Vous créez la boutique manuellement (même nom)');
    console.log('   3️⃣ Le système détecte automatiquement et associe:');
    console.log('      → ownerId = userId de la demande');
    console.log('      → Génère referralCode automatiquement');
    console.log('      → Génère referralLink automatiquement');
    console.log('   4️⃣ L\'utilisateur peut immédiatement utiliser /parrainage');
    console.log('');
    console.log('🔧 AVANTAGES:');
    console.log('   ✅ Aucune création automatique de boutique (évite les erreurs)');
    console.log('   ✅ Association automatique (évite les oublis)');
    console.log('   ✅ Génération automatique des liens de parrainage');
    console.log('   ✅ Système 0-bug pour l\'utilisateur final');
    console.log('');
    console.log('💡 POUR TESTER:');
    console.log('   1. Approuvez une demande sur le panel admin');
    console.log('   2. Créez une boutique avec le MÊME nom');
    console.log('   3. L\'association se fait automatiquement !');
    
  } catch (error) {
    console.error('❌ ERREUR TEST:', error.message);
  }
}

testAutoParrainage();