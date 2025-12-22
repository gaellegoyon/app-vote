#!/bin/bash
set -e

echo "🔄 Initialisation du déploiement Vote App"
echo "=========================================="
echo ""

# 1. Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
max_attempts=30
attempt=0
while ! docker-compose exec -T voting-db pg_isready -U voting_user -d voting_app > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ PostgreSQL n'a pas démarré après 30 tentatives"
        exit 1
    fi
    echo "   Tentative $attempt/$max_attempts..."
    sleep 1
done
echo "✅ PostgreSQL prêt"

echo ""

# 2. Appliquer les migrations
echo "📝 Application des migrations Prisma..."
docker-compose exec -T app pnpm prisma migrate deploy

echo "✅ Migrations appliquées"
echo ""

# 3. Afficher le statut
echo "📊 Statut de la base de données:"
docker-compose exec -T app pnpm prisma migrate status

echo ""
echo "✅ Initialisation terminée!"
echo ""
echo "🌐 Accès à l'application:"
echo "   https://vote.rsx103.local"
