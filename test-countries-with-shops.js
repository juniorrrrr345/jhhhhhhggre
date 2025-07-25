#!/usr/bin/env node

console.log('🏪 TEST PAYS AVEC BOUTIQUES RÉELLES\n');

async function testCountriesWithShops() {
  try {
    const baseUrl = 'https://jhhhhhhggre.onrender.com';
    const token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1';
    
    console.log('📡 Récupération des boutiques actives...');
    
    const response = await fetch(`${baseUrl}/api/plugs?page=1&limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    const shops = data.plugs || [];
    
    console.log(`✅ ${shops.length} boutiques trouvées\n`);
    
    if (shops.length === 0) {
      console.log('❌ Aucune boutique active trouvée');
      return;
    }
    
    // Analyser les pays
    const allCountries = new Set();
    const deliveryCountries = new Set();
    const meetupCountries = new Set();
    const postalCountries = new Set();
    
    shops.forEach(shop => {
      console.log(`🏪 ${shop.name}:`);
      console.log(`   🌍 Pays: ${shop.countries?.join(', ') || 'Non défini'}`);
      console.log(`   📦 Livraison: ${shop.services?.delivery?.enabled ? 'Oui' : 'Non'}`);
      console.log(`   🤝 Meetup: ${shop.services?.meetup?.enabled ? 'Oui' : 'Non'}`);
      console.log(`   📬 Envoi postal: ${shop.services?.postal?.enabled ? 'Oui' : 'Non'}`);
      console.log('   ---');
      
      // Ajouter aux ensembles
      shop.countries?.forEach(country => {
        allCountries.add(country);
        
        if (shop.services?.delivery?.enabled) {
          deliveryCountries.add(country);
        }
        if (shop.services?.meetup?.enabled) {
          meetupCountries.add(country);
        }
        if (shop.services?.postal?.enabled) {
          postalCountries.add(country);
        }
      });
    });
    
    console.log('\n📊 RÉSUMÉ DES PAYS DISPONIBLES:');
    console.log(`🌍 Tous pays: ${Array.from(allCountries).join(', ')}`);
    console.log(`📦 Pays avec livraison: ${Array.from(deliveryCountries).join(', ')}`);
    console.log(`🤝 Pays avec meetup: ${Array.from(meetupCountries).join(', ')}`);
    console.log(`📬 Pays avec envoi postal: ${Array.from(postalCountries).join(', ')}`);
    
    console.log('\n🎯 COMPORTEMENT ATTENDU:');
    console.log('1. Utilisateur: 📦 Livraison → 📍 Département 🔁');
    console.log(`2. Bot affiche SEULEMENT: ${Array.from(deliveryCountries).join(', ')}`);
    console.log('3. Utilisateur: 🤝 Meetup → 📍 Département 🔁');
    console.log(`4. Bot affiche SEULEMENT: ${Array.from(meetupCountries).join(', ')}`);
    
    console.log('\n✅ AVANTAGES:');
    console.log('   🚫 Plus de bouton 🌍 avec tous les pays du système');
    console.log('   ✅ Seulement pays avec vraies boutiques actives');
    console.log('   🎯 Expérience utilisateur ciblée et pertinente');
    console.log('   📍 Codes postaux affichés seulement pour pays valides');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCountriesWithShops();