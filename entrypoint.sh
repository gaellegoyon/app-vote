#!/bin/sh
set -e

# Extraire le host et le port de DATABASE_URL
# Format: postgresql://user:pass@host:port/db
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')

# Valeurs par défaut si extraction échoue
DB_HOST=${DB_HOST:-voting-db}
DB_PORT=${DB_PORT:-5432}

echo "🔄 Attente de PostgreSQL ($DB_HOST:$DB_PORT)..."
until nc -z $DB_HOST $DB_PORT 2>/dev/null; do
  echo "⏳ PostgreSQL non disponible, nouvelle tentative dans 2s..."
  sleep 2
done

echo "✅ PostgreSQL prêt"

echo "🔄 Exécution des migrations Prisma..."
# Utiliser le binaire prisma copié depuis le builder
/app/node_modules/.bin/prisma migrate deploy || echo "⚠️ Migrations échouées (peut-être déjà appliquées)"

echo "🚀 Démarrage de l'application Next.js..."
exec node server.js
