# 🚀 Déploiement Vote App sur DMZ

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       DMZ (10.0.0.0/24)                 │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Docker Compose Stack                │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌────────────┐ │  │
│  │  │   Nginx     │  │   App    │  │ PostgreSQL │ │  │
│  │  │  (443/80)   │→ │ (3000)   │→ │  (5432)    │ │  │
│  │  └─────────────┘  └──────────┘  └────────────┘ │  │
│  │         ↓                                        │  │
│  │  HTTPS à l'extérieur                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## ⚡ Déploiement Rapide

### 1️⃣ Premier déploiement

```bash
cd /opt/voting-app
bash deploy-dmz.sh
```

### 2️⃣ Initialiser la base de données

```bash
bash init-db.sh
```

### 3️⃣ Vérifier l'accès

```bash
curl -k https://vote.rsx103.local
```

## 🔄 Redémarrage après modification

```bash
bash restart-dmz.sh
```

## 📊 Commandes Utiles

### Vérifier l'état des conteneurs

```bash
docker-compose ps
docker-compose logs -f app
```

### Accéder à la base de données

```bash
docker-compose exec voting-db psql -U voting_user -d voting_app
```

### Accéder à l'app

```bash
docker-compose exec app bash
```

### Redémarrer un service spécifique

```bash
docker-compose restart app     # Redémarrer l'app
docker-compose restart voting-db  # Redémarrer PostgreSQL
docker-compose restart nginx    # Redémarrer Nginx
```

### Voir les migrations

```bash
docker-compose exec app pnpm prisma migrate status
```

### Rollback d'une migration

```bash
docker-compose exec app pnpm prisma migrate resolve --rolled-back "migration_name"
```

## 🔐 Sécurité

### Variables d'environnement

Les secrets suivants sont générés aléatoirement lors du déploiement :

- `JWT_SECRET` - Pour la signature des JWT
- `BALLOT_ENCRYPTION_KEY` - Pour chiffrer les bulletins
- `HMAC_SECRET` - Pour l'intégrité des données

✅ Vérifiez que `.env.production` n'est **jamais** commité !

### Certificats SSL

- Les certificats auto-signés sont générés dans `nginx/certs/`
- Pour la production, remplacez par des certificats valides :
  ```bash
  cp /chemin/vers/cert.crt nginx/certs/server.crt
  cp /chemin/vers/key.key nginx/certs/server.key
  docker-compose restart nginx
  ```

## 🐛 Dépannage

### PostgreSQL ne démarre pas

```bash
# Vérifier les logs
docker-compose logs voting-db

# Supprimer les données et redémarrer
docker-compose down -v
docker-compose up -d
```

### L'app ne peut pas se connecter à PostgreSQL

```bash
# Vérifier la DNS intra-conteneur
docker-compose exec app ping voting-db

# Vérifier les logs de l'app
docker-compose logs app
```

### HTTPS ne fonctionne pas

```bash
# Vérifier que les certificats existent
ls -la nginx/certs/

# Vérifier la config Nginx
docker-compose logs nginx
```

## 📈 Monitoring

### Utilisation des ressources

```bash
docker stats
```

### Logs centralisés

```bash
# Tous les logs
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Dernières 50 lignes
docker-compose logs -n 50
```

## 🔄 Mise à jour de l'application

```bash
# 1. Arrêter les services
docker-compose down

# 2. Mettre à jour le code
git pull

# 3. Rebuilder et redémarrer
bash restart-dmz.sh

# 4. Appliquer les migrations (si nécessaire)
bash init-db.sh
```

## 📋 Configuration

### Éditer les variables d'environnement

```bash
nano .env.production
docker-compose restart app
```

### Variables disponibles

- `DATABASE_URL` - Connexion PostgreSQL
- `JWT_SECRET` - Signature JWT
- `BALLOT_ENCRYPTION_KEY` - Chiffrement des bulletins
- `HMAC_SECRET` - Intégrité des données
- `NEXT_PUBLIC_APP_URL` - URL publique
- `MAIL_*` - Configuration email (optionnel)
- `LDAP_*` - Configuration LDAP (optionnel)

## 📞 Support

Pour plus d'informations, consultez :

- `DEPLOYMENT.md` - Guide de déploiement complet
- `README.md` - Documentation du projet
