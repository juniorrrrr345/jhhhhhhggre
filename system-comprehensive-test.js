const https = require('https');
const http = require('http');

/**
 * SCRIPT DE TEST COMPLET DU SYSTÈME
 * Tests du bot Telegram, panel admin, et toutes les fonctionnalités
 */

class SystemTester {
  constructor() {
    this.botUrl = 'http://localhost:3031';
    this.adminUrl = 'http://localhost:3000';
    this.renderUrl = 'https://safepluglink-6hzr.onrender.com';
    this.results = {
      bot: {},
      admin: {},
      apis: {},
      errors: []
    };
  }

  // Utilitaire pour faire des requêtes HTTP
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = {
              status: res.statusCode,
              headers: res.headers,
              data: data.length > 0 ? (data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data) : null
            };
            resolve(result);
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  // Tests du bot Telegram local
  async testBotLocal() {
    console.log('\n🤖 === TEST BOT TELEGRAM LOCAL ===');
    
    try {
      // Test 1: Bot health check
      console.log('1️⃣ Test bot health...');
      const health = await this.makeRequest(`${this.botUrl}/health`);
      this.results.bot.health = health.status === 200;
      console.log(`   ✅ Bot health: ${health.status === 200 ? 'OK' : 'FAIL'} (${health.status})`);

      // Test 2: API plugs list
      console.log('2️⃣ Test API plugs list...');
      const plugs = await this.makeRequest(`${this.botUrl}/api/plugs`);
      this.results.bot.plugsList = plugs.status === 200 && Array.isArray(plugs.data);
      console.log(`   ✅ Plugs API: ${this.results.bot.plugsList ? 'OK' : 'FAIL'} (${plugs.data?.length || 0} plugs)`);

      // Test 3: API config
      console.log('3️⃣ Test API config...');
      const config = await this.makeRequest(`${this.botUrl}/api/config`);
      this.results.bot.config = config.status === 200 && config.data;
      console.log(`   ✅ Config API: ${this.results.bot.config ? 'OK' : 'FAIL'}`);

      // Test 4: API user analytics
      console.log('4️⃣ Test API user analytics...');
      const analytics = await this.makeRequest(`${this.botUrl}/api/admin/user-analytics`, {
        method: 'POST',
        body: { timeRange: 'all', dateFilter: {} }
      });
      this.results.bot.analytics = analytics.status === 200 && analytics.data;
      console.log(`   ✅ Analytics API: ${this.results.bot.analytics ? 'OK' : 'FAIL'}`);
      if (analytics.data) {
        console.log(`      📊 ${analytics.data.totalUsers} users, ${analytics.data.usersWithLocation} localisés, ${analytics.data.countryStats?.length || 0} pays`);
      }

    } catch (error) {
      console.log(`   ❌ Erreur bot tests: ${error.message}`);
      this.results.errors.push(`Bot: ${error.message}`);
    }
  }

  // Tests du panel admin
  async testAdminPanel() {
    console.log('\n📊 === TEST PANEL ADMIN ===');
    
    try {
      // Test 1: Admin home
      console.log('1️⃣ Test admin home...');
      const home = await this.makeRequest(`${this.adminUrl}/admin`);
      this.results.admin.home = home.status === 200;
      console.log(`   ✅ Admin home: ${this.results.admin.home ? 'OK' : 'FAIL'} (${home.status})`);

      // Test 2: User analytics page
      console.log('2️⃣ Test user analytics page...');
      const analyticsPage = await this.makeRequest(`${this.adminUrl}/admin/user-analytics`);
      this.results.admin.analyticsPage = analyticsPage.status === 200;
      console.log(`   ✅ Analytics page: ${this.results.admin.analyticsPage ? 'OK' : 'FAIL'} (${analyticsPage.status})`);

      // Test 3: Shop pages
      console.log('3️⃣ Test shop pages...');
      const shop = await this.makeRequest(`${this.adminUrl}/shop`);
      this.results.admin.shop = shop.status === 200;
      console.log(`   ✅ Shop page: ${this.results.admin.shop ? 'OK' : 'FAIL'} (${shop.status})`);

      // Test 4: Admin API analytics
      console.log('4️⃣ Test admin API analytics...');
      const adminAnalytics = await this.makeRequest(`${this.adminUrl}/api/admin/user-analytics?timeRange=all`);
      this.results.admin.analyticsAPI = adminAnalytics.status === 200;
      console.log(`   ✅ Admin analytics API: ${this.results.admin.analyticsAPI ? 'OK' : 'FAIL'} (${adminAnalytics.status})`);

    } catch (error) {
      console.log(`   ❌ Erreur admin tests: ${error.message}`);
      this.results.errors.push(`Admin: ${error.message}`);
    }
  }

  // Tests du bot de production (Render)
  async testProductionBot() {
    console.log('\n🌐 === TEST BOT PRODUCTION (RENDER) ===');
    
    try {
      // Test 1: Render health
      console.log('1️⃣ Test render health...');
      const health = await this.makeRequest(`${this.renderUrl}/health`);
      this.results.apis.renderHealth = health.status === 200;
      console.log(`   ✅ Render health: ${this.results.apis.renderHealth ? 'OK' : 'FAIL'} (${health.status})`);

      // Test 2: Render plugs API
      console.log('2️⃣ Test render plugs API...');
      const plugs = await this.makeRequest(`${this.renderUrl}/api/plugs`);
      this.results.apis.renderPlugs = plugs.status === 200 && Array.isArray(plugs.data);
      console.log(`   ✅ Render plugs: ${this.results.apis.renderPlugs ? 'OK' : 'FAIL'} (${plugs.data?.length || 0} plugs)`);

      // Test 3: Render analytics
      console.log('3️⃣ Test render analytics...');
      const analytics = await this.makeRequest(`${this.renderUrl}/api/admin/user-analytics`, {
        method: 'POST',
        body: { timeRange: 'all', dateFilter: {} }
      });
      this.results.apis.renderAnalytics = analytics.status === 200 && analytics.data;
      console.log(`   ✅ Render analytics: ${this.results.apis.renderAnalytics ? 'OK' : 'FAIL'}`);

    } catch (error) {
      console.log(`   ❌ Erreur render tests: ${error.message}`);
      this.results.errors.push(`Render: ${error.message}`);
    }
  }

  // Test multilingue
  async testMultiLanguage() {
    console.log('\n🌍 === TEST SUPPORT MULTILINGUE ===');
    
    const languages = ['fr', 'en', 'es', 'it', 'de'];
    
    for (const lang of languages) {
      try {
        console.log(`🔤 Test langue: ${lang}`);
        
        // Test bot avec langue
        const config = await this.makeRequest(`${this.botUrl}/api/config`);
        if (config.data && config.data.languages) {
          const hasLang = config.data.languages.availableLanguages?.some(l => l.code === lang);
          console.log(`   📝 Langue ${lang}: ${hasLang ? 'Disponible' : 'Non disponible'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur test langue ${lang}: ${error.message}`);
      }
    }
  }

  // Vérification des pages critiques
  async testCriticalPages() {
    console.log('\n🔍 === TEST PAGES CRITIQUES ===');
    
    const criticalPages = [
      { name: 'Admin Dashboard', url: `${this.adminUrl}/admin` },
      { name: 'Admin Plugs', url: `${this.adminUrl}/admin/plugs` },
      { name: 'Admin Applications', url: `${this.adminUrl}/admin/applications` },
      { name: 'Admin Config', url: `${this.adminUrl}/admin/config` },
      { name: 'Admin User Analytics', url: `${this.adminUrl}/admin/user-analytics` },
      { name: 'Shop Home', url: `${this.adminUrl}/shop` },
      { name: 'Shop Search', url: `${this.adminUrl}/shop/search` },
      { name: 'Shop VIP', url: `${this.adminUrl}/shop/vip` }
    ];

    for (const page of criticalPages) {
      try {
        const response = await this.makeRequest(page.url);
        const isOk = response.status === 200;
        console.log(`   ${isOk ? '✅' : '❌'} ${page.name}: ${response.status}`);
        
        if (!isOk) {
          this.results.errors.push(`Page ${page.name}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${page.name}: Erreur - ${error.message}`);
        this.results.errors.push(`Page ${page.name}: ${error.message}`);
      }
    }
  }

  // Test des APIs critiques
  async testCriticalAPIs() {
    console.log('\n🔗 === TEST APIs CRITIQUES ===');
    
    const apis = [
      { name: 'Bot Plugs', url: `${this.botUrl}/api/plugs` },
      { name: 'Bot Config', url: `${this.botUrl}/api/config` },
      { name: 'Admin Analytics', url: `${this.adminUrl}/api/admin/user-analytics?timeRange=all` },
      { name: 'Render Plugs', url: `${this.renderUrl}/api/plugs` }
    ];

    for (const api of apis) {
      try {
        const response = await this.makeRequest(api.url);
        const isOk = response.status === 200;
        console.log(`   ${isOk ? '✅' : '❌'} ${api.name}: ${response.status}`);
        
        if (api.name.includes('Plugs') && response.data) {
          console.log(`      📦 ${Array.isArray(response.data) ? response.data.length : 'Non-array'} plugs`);
        }
        
        if (!isOk) {
          this.results.errors.push(`API ${api.name}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${api.name}: Erreur - ${error.message}`);
        this.results.errors.push(`API ${api.name}: ${error.message}`);
      }
    }
  }

  // Rapport final
  generateReport() {
    console.log('\n📋 === RAPPORT FINAL ===');
    console.log('🤖 BOT LOCAL:');
    console.log(`   Health: ${this.results.bot.health ? '✅' : '❌'}`);
    console.log(`   Plugs API: ${this.results.bot.plugsList ? '✅' : '❌'}`);
    console.log(`   Config API: ${this.results.bot.config ? '✅' : '❌'}`);
    console.log(`   Analytics API: ${this.results.bot.analytics ? '✅' : '❌'}`);

    console.log('\n📊 ADMIN PANEL:');
    console.log(`   Home: ${this.results.admin.home ? '✅' : '❌'}`);
    console.log(`   Analytics Page: ${this.results.admin.analyticsPage ? '✅' : '❌'}`);
    console.log(`   Shop: ${this.results.admin.shop ? '✅' : '❌'}`);
    console.log(`   Analytics API: ${this.results.admin.analyticsAPI ? '✅' : '❌'}`);

    console.log('\n🌐 PRODUCTION:');
    console.log(`   Render Health: ${this.results.apis.renderHealth ? '✅' : '❌'}`);
    console.log(`   Render Plugs: ${this.results.apis.renderPlugs ? '✅' : '❌'}`);
    console.log(`   Render Analytics: ${this.results.apis.renderAnalytics ? '✅' : '❌'}`);

    console.log('\n❌ ERREURS DÉTECTÉES:');
    if (this.results.errors.length === 0) {
      console.log('   🎉 AUCUNE ERREUR ! Système entièrement fonctionnel !');
    } else {
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Score global
    const total = Object.values(this.results.bot).length + 
                  Object.values(this.results.admin).length + 
                  Object.values(this.results.apis).length;
    const passed = Object.values(this.results.bot).filter(Boolean).length +
                   Object.values(this.results.admin).filter(Boolean).length +
                   Object.values(this.results.apis).filter(Boolean).length;
    
    const score = Math.round((passed / total) * 100);
    console.log(`\n🎯 SCORE GLOBAL: ${score}% (${passed}/${total} tests réussis)`);
    
    if (score >= 90) {
      console.log('🌟 EXCELLENT ! Système parfaitement fonctionnel !');
    } else if (score >= 70) {
      console.log('👍 BON ! Quelques problèmes mineurs à corriger.');
    } else {
      console.log('⚠️ ATTENTION ! Des problèmes importants détectés.');
    }
  }

  // Lancer tous les tests
  async runAllTests() {
    console.log('🚀 DÉMARRAGE DES TESTS SYSTÈME COMPLETS...\n');
    
    await this.testBotLocal();
    await this.testAdminPanel();
    await this.testProductionBot();
    await this.testMultiLanguage();
    await this.testCriticalPages();
    await this.testCriticalAPIs();
    
    this.generateReport();
  }
}

// Exécution
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Erreur fatale lors des tests:', error);
    process.exit(1);
  });
}

module.exports = SystemTester;