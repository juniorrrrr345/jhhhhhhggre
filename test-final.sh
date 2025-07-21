#!/bin/bash

echo "🔧 === TEST FINAL DU SYSTÈME ==="
echo "⏰ $(date)"
echo "=====================================\n"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
BOT_URL="https://jhhhhhhggre.onrender.com"
ADMIN_URL="https://safeplugslink.vercel.app"
ADMIN_PASSWORD="JuniorAdmon123"

echo "🌐 URLs testées :"
echo "   🤖 Bot: $BOT_URL"
echo "   🔧 Admin: $ADMIN_URL"
echo "=====================================\n"

# Test 1: Santé du bot
echo "1️⃣ Test de santé du bot..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health.json "$BOT_URL/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Bot en ligne (HTTP $HTTP_CODE)${NC}"
    UPTIME=$(cat /tmp/health.json | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)
    echo "   ⏱️ Uptime: $(echo $UPTIME | awk '{print int($1/3600)"h "int(($1%3600)/60)"m "int($1%60)"s"}')"
else
    echo -e "${RED}❌ Bot hors ligne (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# Test 2: Configuration publique
echo "\n2️⃣ Test de configuration publique..."
CONFIG_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/config.json "$BOT_URL/api/public/config")
HTTP_CODE="${CONFIG_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Configuration accessible (HTTP $HTTP_CODE)${NC}"
    BOUTIQUE_NAME=$(cat /tmp/config.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo "   🏪 Nom boutique: $BOUTIQUE_NAME"
else
    echo -e "${RED}❌ Configuration inaccessible (HTTP $HTTP_CODE)${NC}"
fi

# Test 3: Rechargement du bot
echo "\n3️⃣ Test de rechargement du bot..."
RELOAD_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/reload.json -X POST \
    -H "Authorization: Bearer $ADMIN_PASSWORD" \
    "$BOT_URL/api/bot/reload")
HTTP_CODE="${RELOAD_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Rechargement réussi (HTTP $HTTP_CODE)${NC}"
    SUCCESS=$(cat /tmp/reload.json | grep -o '"success":[^,]*' | cut -d':' -f2)
    echo "   🔄 Succès: $SUCCESS"
else
    echo -e "${YELLOW}⚠️ Rechargement échoué (HTTP $HTTP_CODE)${NC}"
fi

# Test 4: Panel admin
echo "\n4️⃣ Test du panel admin..."
ADMIN_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$ADMIN_URL")
HTTP_CODE="${ADMIN_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Panel admin accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️ Panel admin problématique (HTTP $HTTP_CODE)${NC}"
fi

# Test 5: Diagnostic si disponible
echo "\n5️⃣ Test de diagnostic (optionnel)..."
DIAG_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/diag.json "$BOT_URL/api/bot/diagnostic")
HTTP_CODE="${DIAG_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Diagnostic disponible (HTTP $HTTP_CODE)${NC}"
    BOT_CONNECTED=$(cat /tmp/diag.json | grep -o '"connected":[^,]*' | cut -d':' -f2)
    echo "   🤖 Bot connecté: $BOT_CONNECTED"
else
    echo -e "${YELLOW}⚠️ Diagnostic non disponible (sera ajouté au prochain déploiement)${NC}"
fi

# Résumé final
echo "\n=====================================\n"
echo "📋 RÉSUMÉ DES TESTS:"

# Compter les succès
TESTS_PASSED=0
TOTAL_TESTS=4

if [ "$(curl -s -w "%{http_code}" -o /dev/null "$BOT_URL/health" | tail -c 3)" = "200" ]; then
    echo -e "${GREEN}✅ Bot en ligne${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Bot hors ligne${NC}"
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null "$BOT_URL/api/public/config" | tail -c 3)" = "200" ]; then
    echo -e "${GREEN}✅ Configuration OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Configuration KO${NC}"
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null -X POST -H "Authorization: Bearer $ADMIN_PASSWORD" "$BOT_URL/api/bot/reload" | tail -c 3)" = "200" ]; then
    echo -e "${GREEN}✅ API Admin OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ API Admin KO${NC}"
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null "$ADMIN_URL" | tail -c 3)" = "200" ]; then
    echo -e "${GREEN}✅ Panel Admin OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Panel Admin KO${NC}"
fi

echo "\n🏆 Score: $TESTS_PASSED/$TOTAL_TESTS tests réussis"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 SYSTÈME OPÉRATIONNEL !${NC}"
    echo "\n💡 Prochaines étapes :"
    echo "   1. Testez le bot sur Telegram avec /start"
    echo "   2. Vérifiez le panel admin sur $ADMIN_URL"
    echo "   3. Consultez le guide: GUIDE_RESOLUTION_PROBLEMES.md"
else
    echo -e "${YELLOW}⚠️ PROBLÈMES DÉTECTÉS${NC}"
    echo "\n💡 Actions recommandées :"
    echo "   1. Consultez les logs sur Render.com"
    echo "   2. Vérifiez les variables d'environnement"
    echo "   3. Suivez le guide: GUIDE_RESOLUTION_PROBLEMES.md"
fi

echo "\n=====================================\n"

# Nettoyer les fichiers temporaires
rm -f /tmp/health.json /tmp/config.json /tmp/reload.json /tmp/diag.json

exit 0