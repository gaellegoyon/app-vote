#!/bin/sh
set -e

echo "🔄 Attente de PostgreSQL (192.168.1.18:5432)..."
until nc -z 192.168.1.18 5432; do
  echo "⏳ PostgreSQL non disponible, nouvelle tentative dans 2s..."
  sleep 2
done

echo "✅ PostgreSQL prêt"

echo "🔄 Exécution des migrations Prisma..."
npx prisma migrate deploy || echo "⚠️ Migrations échouées (peut-être déjà appliquées)"

echo "🚀 Démarrage de l'application Next.js..."
exec node server.js
