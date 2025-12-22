#!/bin/bash
set -e

echo "🔄 Redémarrage du déploiement Vote App - DMZ"
echo "=============================================="
echo ""

# Vérifier que .env.production existe
if [ ! -f .env.production ]; then
    echo "❌ Fichier .env.production non trouvé!"
    echo "   Lancez d'abord: bash deploy-dmz.sh"
    exit 1
fi

# Copier .env.production vers .env pour docker-compose
cp .env.production .env

# 1. Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# 2. Rebuild l'image de l'app
echo "🐳 Build Docker..."
docker-compose build --no-cache app

# 3. Démarrer tous les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 4. Attendre les services
echo "⏳ Attente du démarrage des services..."
max_attempts=60
attempt=0

# Attendre PostgreSQL
while ! docker-compose exec -T voting-db pg_isready -U voting_user -d voting_app > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ PostgreSQL n'a pas démarré"
        exit 1
    fi
    echo "   PostgreSQL: tentative $attempt/$max_attempts..."
    sleep 1
done
echo "✅ PostgreSQL prêt"

# Attendre l'app
attempt=0
while ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "⚠️  App peut ne pas être complètement prête"
        break
    fi
    echo "   App: tentative $attempt/$max_attempts..."
    sleep 1
done
echo "✅ App accessible"

echo ""
echo "📋 État des conteneurs:"
docker ps

echo ""
echo "� Statut des services:"
docker-compose logs --tail=15

echo ""
echo "✅ Redémarrage terminé!"
echo ""
echo "💡 Prochaines étapes (si première fois):"
echo "   bash init-db.sh"

