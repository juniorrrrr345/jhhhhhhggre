#!/usr/bin/env node

console.log('🧪 TEST FINAL - Analytics Géolocalisation Temps Réel\n');

async function testAnalytics() {
  try {
    // Test 1: API Bot Direct
    console.log('📡 Test 1: API Bot Direct...');
    const botResponse = await fetch('https://safepluglink-6hzr.onrender.com/api/admin/user-analytics', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timeRange: 'all', dateFilter: {} })
    });
    
    const botData = await botResponse.json();
    console.log('✅ Bot API:', {
      totalUsers: botData.totalUsers,
      usersWithLocation: botData.usersWithLocation,
      countries: botData.countryStats?.length || 0,
      coverage: Math.round((botData.usersWithLocation / botData.totalUsers) * 100) + '%'
    });

    // Test 2: API Panel Admin Local
    console.log('\n📊 Test 2: API Panel Admin Local...');
    const adminResponse = await fetch('http://localhost:3000/api/admin/user-analytics?timeRange=all');
    const adminData = await adminResponse.json();
    console.log('✅ Admin Panel API:', {
      totalUsers: adminData.totalUsers,
      usersWithLocation: adminData.usersWithLocation,
      countries: adminData.countryStats?.length || 0,
      coverage: Math.round((adminData.usersWithLocation / adminData.totalUsers) * 100) + '%'
    });

    // Test 3: Affichage détaillé des pays
    console.log('\n🌍 Test 3: Répartition par pays:');
    if (botData.countryStats && botData.countryStats.length > 0) {
      botData.countryStats.forEach((country, index) => {
        const flag = country.countryCode === 'FR' ? '🇫🇷' : 
                    country.countryCode === 'CH' ? '🇨🇭' : 
                    country.countryCode === 'BE' ? '🇧🇪' : '🌍';
        const percentage = Math.round((country.count / botData.totalUsers) * 100);
        const badge = index < 3 ? ' 🏆 TOP' : '';
        console.log(`   ${flag} ${country.country}: ${country.count} utilisateurs (${percentage}%)${badge}`);
      });
    }

    // Test 4: Vérification temps réel
    console.log('\n⏰ Test 4: Temps réel - Comparaison...');
    const isRealTime = JSON.stringify(botData.countryStats) === JSON.stringify(adminData.countryStats);
    console.log(isRealTime ? '✅ SYNCHRONISÉ: Bot ↔ Panel Admin' : '❌ DÉSYNCHRONISÉ: Données différentes');

    // Résumé final
    console.log('\n🎯 RÉSUMÉ FINAL:');
    console.log(`   👥 Total Utilisateurs: ${botData.totalUsers}`);
    console.log(`   📍 Utilisateurs Localisés: ${botData.usersWithLocation}`);
    console.log(`   🌍 Pays Détectés: ${botData.countryStats?.length || 0}`);
    console.log(`   📊 Couverture Géolocalisation: ${Math.round((botData.usersWithLocation / botData.totalUsers) * 100)}%`);
    console.log(`   🔄 Synchronisation Temps Réel: ${isRealTime ? 'ACTIVE' : 'INACTIVE'}`);

    if (botData.usersWithLocation > 0 && isRealTime) {
      console.log('\n🎉 SUCCÈS COMPLET: Analytics géolocalisation temps réel fonctionnels !');
    } else {
      console.log('\n⚠️ PROBLÈME DÉTECTÉ: Vérifiez la configuration');
    }

  } catch (error) {
    console.error('❌ ERREUR TEST:', error.message);
  }
}

testAnalytics();