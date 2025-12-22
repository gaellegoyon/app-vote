#!/bin/bash

echo "🚀 Déploiement Vote App - DMZ"
echo "=============================="

# 1. Générer les certificats
echo "🔐 Génération des certificats..."
bash generate-certs.sh

# 2. Tester PostgreSQL (non-bloquant)
echo "🔍 Test PostgreSQL..."
echo "   (PostgreSQL sera démarré via docker-compose)"

# À partir d'ici, arrêter à la première erreur
set -e

# 3. Créer .env.production
echo "📝 Génération .env.production..."
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL="postgresql://voting_user:VotingSecurePass2025!@voting-db:5432/voting_app"
NEXT_PUBLIC_APP_URL="https://vote.rsx103.local"
APP_BASE_URL="https://vote.rsx103.local"
NEXT_PUBLIC_BASE_URL="https://vote.rsx103.local"
JWT_SECRET="$(openssl rand -base64 32)"
BALLOT_ENCRYPTION_KEY="$(openssl rand -base64 32)"
HMAC_SECRET="$(openssl rand -base64 32)"
EOF

# 4. Pare-feu
echo "🔒 Configuration pare-feu..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. Build
echo "🐳 Build Docker..."
docker-compose build --no-cache

# 6. Démarrer
echo "🚀 Démarrage..."
docker-compose up -d

# 7. Attendre
echo "⏳ Attente 30s..."
sleep 30

# 8. Vérifier
echo "🏥 Vérification..."
docker ps
docker-compose logs -n 20

echo ""
echo "✅ DÉPLOIEMENT RÉUSSI!"
echo "🌐 Test: curl -k https://10.0.0.4"
echo ""
echo "🔧 Diagnostic PostgreSQL:"
echo "   Pour vérifier la connectivité à PostgreSQL:"
echo "   $ nc -zv 192.168.1.18 5432"
echo "   ou"
echo "   $ telnet 192.168.1.18 5432"
echo ""
echo "📝 Variables d'environnement:"
grep -E "DATABASE_URL|MAIL_|JWT_|LDAP" .env.production | head -10
echo ""