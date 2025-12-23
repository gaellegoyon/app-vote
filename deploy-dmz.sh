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
JWT_SECRET=$(openssl rand -base64 32)
BALLOT_ENCRYPTION_KEY=$(openssl rand -base64 32)
HMAC_SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL="postgresql://voting_user:VotingSecurePass2025!@voting-db:5432/voting_app"
NEXT_PUBLIC_APP_URL="https://rsx103cnam.ddns.net"
APP_BASE_URL="https://rsx103cnam.ddns.net"
NEXT_PUBLIC_BASE_URL="https://rsx103cnam.ddns.net"
JWT_SECRET="$JWT_SECRET"
BALLOT_ENCRYPTION_KEY="$BALLOT_ENCRYPTION_KEY"
HMAC_SECRET="$HMAC_SECRET"
EOF

# Exporter les variables pour docker-compose
export JWT_SECRET
export BALLOT_ENCRYPTION_KEY
export HMAC_SECRET

# Copier .env.production vers .env pour docker-compose
# (docker-compose charge .env par défaut, pas .env.production)
cp .env.production .env
echo "✅ Variables chargées dans .env"

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

# 7. Attendre les services
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

# 8. Vérifier
echo ""
echo "🏥 Vérification de l'état:"
echo ""
docker ps
echo ""
docker-compose logs --tail=20

echo ""
echo "✅ DÉPLOIEMENT RÉUSSI!"
echo "🌐 Test: curl -k https://rsx103cnam.ddns.net"
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