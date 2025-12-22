#!/bin/bash
set -e

echo "🔄 Redémarrage du déploiement Vote App - DMZ"
echo "=============================================="
echo ""

# 1. Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# 2. Supprimer les images anciennes (optionnel)
echo "🗑️  Nettoyage..."
docker-compose rm -f 2>/dev/null || true

# 3. Rebuild l'image de l'app
echo "🐳 Build Docker..."
docker-compose build --no-cache app

# 4. Démarrer tous les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 5. Attendre que tout soit prêt
echo "⏳ Attente de la santé des services (30s)..."
sleep 30

# 6. Vérifier l'état
echo ""
echo "🏥 Vérification de l'état:"
echo ""

echo "📦 Conteneurs en cours d'exécution:"
docker ps

echo ""
echo "🔗 Test de connectivité:"
echo -n "   App (localhost:3000): "
curl -s http://localhost:3000/api/health > /dev/null && echo "✅ OK" || echo "⏳ En démarrage..."

echo -n "   Nginx (localhost:80): "
curl -s http://localhost:80 > /dev/null && echo "✅ OK" || echo "⏳ En démarrage..."

echo ""
echo "📋 Logs récents:"
docker-compose logs --tail=15

echo ""
echo "✅ Redémarrage terminé!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Appliquer les migrations: docker-compose exec app pnpm prisma migrate deploy"
echo "   2. Vérifier les logs: docker-compose logs -f app"
echo "   3. Test: curl -k https://vote.rsx103.local"
