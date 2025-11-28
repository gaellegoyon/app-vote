# Vote App - Système de Scrutin Électronique Sécurisé

Une application de vote en ligne sécurisée et conforme RGPD, construite avec Next.js, TypeScript et PostgreSQL.

## 🎯 Fonctionnalités

- ✅ **Authentification sécurisée** - JWT + TOTP (2FA)
- ✅ **Gestion des candidatures** - Validation et gestion admin
- ✅ **Système de vote** - Bulletin électronique chiffré
- ✅ **Scrutin uninominal** - Résultats en temps réel
- ✅ **Ballottage** - Support du second tour automatique
- ✅ **Audit complet** - Logs immuables de toutes les actions
- ✅ **Conformité RGPD** - Pseudonymisation, chiffrement E2E
- ✅ **API sécurisée** - Rate limiting, CORS, protection CSRF

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- pnpm (ou npm/yarn)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd vote-app

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Initialiser la base de données
pnpm prisma migrate deploy
pnpm prisma:seed

# Démarrer le serveur de développement
pnpm dev
```

L'application sera accessible à [http://localhost:3000](http://localhost:3000)

## 🛠️ Développement

### Scripts disponibles

```bash
pnpm dev          # Démarrer le serveur de développement avec turbopack
pnpm build        # Créer la build de production
pnpm start        # Démarrer le serveur de production
pnpm lint         # Vérifier le code avec ESLint
pnpm prisma:seed  # Initialiser la base de données
```

## 📁 Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Routes API
│   │   ├── admin/         # Endpoints admin
│   │   ├── auth/          # Authentification
│   │   ├── election/      # Gestion des élections
│   │   └── vote/          # Vote et scrutin
│   ├── admin/             # Pages administrateur
│   ├── auth/              # Pages d'authentification
│   ├── candidates/        # Soumission de candidatures
│   └── vote/              # Interface de vote
├── components/            # Composants React réutilisables
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et services
│   ├── auth-*.ts          # Logique d'authentification
│   ├── security-*.ts      # Sécurité (chiffrement, token)
│   ├── election-*.ts      # Logique de scrutin
│   ├── prisma.tsx         # Client Prisma
│   └── ...
└── middleware.ts          # Middleware Next.js
prisma/
├── schema.prisma          # Schéma de base de données
└── seed.ts                # Initialisation de la BDD
```

## 🔐 Sécurité

### Authentification

- Hachage des mots de passe avec Argon2
- Token JWT avec expiration 24h
- MFA TOTP supporté

### Chiffrement

- Chiffrement des bulletins AES-256-CBC
- Pseudonymisation des votants (HMAC)
- Transport sécurisé avec HTTPS en production

### Protection

- Rate limiting par IP
- CORS configuré
- Middleware de validation
- Logs d'audit de toutes les actions

## 📊 Base de données

Schéma Prisma incluant:

- **AdminUser** - Administrateurs avec rôles
- **Voter** - Électeurs autorisés
- **Candidate** - Candidats avec validation
- **Election** - Élections avec périodes
- **Ballot** - Bulletins chiffrés
- **EventLog** - Audit trail complet

### Migrations

```bash
# Appliquer les migrations
pnpm prisma migrate deploy

# Créer une nouvelle migration
pnpm prisma migrate dev --name <nom>

# Réinitialiser la BDD (dev uniquement)
pnpm prisma migrate reset
```

## 🐳 Docker

### Build et run avec Docker

```bash
docker build -t vote-app .
docker run -p 3000:3000 -e DATABASE_URL="..." vote-app
```

### Avec Docker Compose

```bash
docker-compose up -d
```

## 📋 Variables d'environnement

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vote_app

# Sécurité
ADMIN_PASSWORD_HASH=<bcrypt_hash>
JWT_SECRET=<random_secret_min_32_chars>
BALLOT_ENCRYPTION_KEY=<random_key_min_32_chars>

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@vote-app.com

# API
NEXT_PUBLIC_APP_URL=https://vote-app.example.com

# Node
NODE_ENV=production
```

## 🧪 Tests

```bash
# Exécuter les tests
pnpm test

# Tests avec couverture
pnpm test:coverage
```

## 📈 Déploiement

### Vercel (recommandé)

```bash
vercel deploy
```

### Autres plateformes

L'application utilise `output: "standalone"` dans Next.js pour un déploiement flexible:

```bash
pnpm build
pnpm start
```

## 🐛 Dépannage

### Erreur de connexion à la BDD

- Vérifier que PostgreSQL est en cours d'exécution
- Vérifier `DATABASE_URL` dans `.env.local`
- Vérifier les migrations: `pnpm prisma migrate status`

### Erreur TOTP

- Synchroniser l'horloge du serveur
- Vérifier la clé secrète TOTP

### Rate limiting

- Réinitialiser la cache: supprimer les cookies et attendre 1 minute

## 📝 Licence

Propriétaire - ESNA

## 🤝 Support

Pour les problèmes ou questions, veuillez contacter l'équipe de développement.

---

**Dernière mise à jour:** novembre 2025  
**Version:** 0.1.0 (Beta)
