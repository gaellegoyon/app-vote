# Vote App - Guide de Déploiement Production

## ✅ Checklist Pre-Déploiement

### 🔐 Sécurité

- [ ] Les variables d'environnement ne sont pas commitées (fichier `.env.local` dans `.gitignore`)
- [ ] JWT_SECRET est une chaîne aléatoire de min 32 caractères
- [ ] BALLOT_ENCRYPTION_KEY est une chaîne aléatoire de min 32 caractères
- [ ] Les cookies sont configurés avec `secure: true` et `httpOnly: true`
- [ ] CORS est configuré correctement
- [ ] HTTPS est activé en production
- [ ] CSP (Content Security Policy) headers sont en place

### 🗄️ Base de Données

- [ ] PostgreSQL 14+ est en production
- [ ] Les migrations Prisma ont été appliquées: `pnpm prisma migrate deploy`
- [ ] Les backups sont configurés et testés
- [ ] Les index de base sont créés pour les performances
- [ ] Le pool de connexions est configuré correctement

### 📧 Email

- [ ] SMTP est correctement configuré et testé
- [ ] Les emails de test ont été envoyés avec succès
- [ ] Le "From" email est autorisé par le serveur SMTP
- [ ] Le SPF/DKIM est configuré pour le domaine

### 🚀 Infrastructure

- [ ] Node.js 18+ est installé
- [ ] Les dépendances sont à jour: `pnpm install --frozen-lockfile`
- [ ] La build est testée: `pnpm build && pnpm start`
- [ ] L'espace disque est suffisant
- [ ] Les limites de ressources sont configurées (CPU, mémoire)

### 📊 Monitoring

- [ ] Les logs sont centralisés (Datadog, Sentry, etc.)
- [ ] Les erreurs sont surveillées
- [ ] Les performances sont monitorées
- [ ] Les alertes sont configurées

## 🐳 Docker

### Build

```bash
docker build -t vote-app:latest .
```

### Run

```bash
docker run \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e BALLOT_ENCRYPTION_KEY="..." \
  -e NODE_ENV=production \
  vote-app:latest
```

## 🌐 Déploiement avec Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Configurer le projet
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add BALLOT_ENCRYPTION_KEY

# Déployer
vercel deploy --prod
```

## ☁️ Déploiement avec AWS

### Option 1: ECS + RDS

```bash
# Build et push l'image Docker
docker build -t vote-app:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag vote-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/vote-app:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/vote-app:latest

# Configurer les tâches ECS avec les variables d'environnement
# Configurer RDS pour PostgreSQL
```

### Option 2: Lambda + RDS

```bash
pnpm build
# Utiliser Serverless Framework ou AWS CDK
```

## 🔄 Migrations en Production

```bash
# Backup avant migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Appliquer les migrations
pnpm prisma migrate deploy

# Vérifier le statut
pnpm prisma migrate status
```

## 🐛 Dépannage

### Erreur de connexion à la BDD

```bash
# Vérifier la chaîne de connexion
echo $DATABASE_URL

# Tester la connexion
psql $DATABASE_URL -c "SELECT 1"
```

### Erreur de chiffrement

- Vérifier que BALLOT_ENCRYPTION_KEY est de 32+ caractères
- Vérifier que la clé est cohérente entre instances

### Erreur d'emails

- Vérifier SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- Vérifier les logs du serveur SMTP
- Tester la connexion SMTP: `telnet $SMTP_HOST $SMTP_PORT`

## 📈 Performance

### Optimisations appliquées

- Turbopack pour le build rapide
- Source maps désactivées en production
- Compression gzip activée
- Images optimisées (WebP/AVIF)
- Code splitting automatique
- ISR (Incremental Static Regeneration) configuré

### Monitoring des performances

- Core Web Vitals via Vercel Analytics
- Error tracking via Sentry
- Database monitoring via AWS CloudWatch

## 🔑 Rotation des Secrets

```bash
# Changer JWT_SECRET
# 1. Générer une nouvelle clé: openssl rand -base64 32
# 2. Mettre à jour la variable d'environnement
# 3. Redémarrer l'application
# Note: Les sessions existantes seront invalidées

# Changer BALLOT_ENCRYPTION_KEY
# ⚠️ Attention: Les bulletins existants deviennent inaccessibles!
# À faire uniquement si nécessaire et avec un backup
```

## 📝 Logs

### Format des logs

```
[timestamp] [level] [module] message
```

### Niveaux supportés

- `error`: Erreurs critiques
- `warn`: Avertissements
- `info`: Informations importantes
- `debug`: Données de debug (dev uniquement)

---

**Dernière mise à jour:** novembre 2025
