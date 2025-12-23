# Configuration Bastion SSH - Vote App Admin

## 🎯 Architecture de sécurité

```
┌─────────────────────────────────────────────────────────┐
│                   Administrateurs                       │
│                    (Postes locaux)                       │
└────────────────────────┬────────────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Internet   │
                  └──────┬──────┘
                         │
        ┌────────────────▼────────────────┐
        │  Bastion Host (192.168.10.50)   │
        │  - SSH Server                   │
        │  - MFA-ready                    │
        │  - Audit logging                │
        └────────────────┬────────────────┘
                         │ Réseau interne
        ┌────────────────▼────────────────┐
        │  Vote App Server (192.168.1.25) │
        │  - Nginx proxy                  │
        │  - Admin panel                  │
        │  - LDAP auth                    │
        └─────────────────────────────────┘
```

## 📋 Installation du Bastion

### Sur le Bastion (192.168.10.50)

```bash
# 1. Installer OpenSSH
sudo apt-get install openssh-server openssh-client

# 2. Configurer SSH (/etc/ssh/sshd_config)
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers admin_user

# 3. Redémarrer SSH
sudo systemctl restart ssh

# 4. Ajouter clés publiques des admins
mkdir -p ~/.ssh
cat admin1_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 5. Configurer l'audit
sudo apt-get install auditd
sudo systemctl enable auditd
```

## 🔐 Utilisation - Côté Admin

### Option 1 : SSH Tunnel (RECOMMANDÉ)

```bash
# Créer un tunnel local
ssh -L 8443:localhost:443 gaelle@192.168.10.50

# Puis accéder à
https://localhost:8443

# ✅ Avantages:
# - Chiffrement complet
# - Journalisation SSH
# - Pas d'exposition directe
```

### Option 2 : SSH ProxyJump (Plus moderne)

```bash
# Dans ~/.ssh/config
Host bastion
    HostName 192.168.10.50
    User admin_user
    IdentityFile ~/.ssh/id_rsa

Host vote-app
    HostName 192.168.1.25
    User root
    ProxyJump bastion
    IdentityFile ~/.ssh/id_rsa

# Puis
ssh -L 8443:localhost:443 vote-app
```

### Option 3 : Config SSH complète

```bash
# ~/.ssh/config
Host bastion-vote
    HostName 192.168.10.50
    User admin_user
    LocalForward 8443 192.168.1.25:443
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new

# Utilisation:
ssh -N bastion-vote
# (reste connecté, tunnel actif)
```

## 📊 Monitoring et Audit

### Logs SSH sur le Bastion

```bash
# Voir les connexions
sudo tail -f /var/log/auth.log | grep ssh

# Audit détaillé
sudo ausearch -m LOGIN -ts recent | grep admin_user
```

### Logs d'accès admin

```bash
# Sur le serveur Vote App
docker-compose logs -f app | grep ADMIN_LOGIN

# Ou en base de données
docker-compose exec postgres psql -U voteapp -d voteapp -c \
  "SELECT * FROM \"AuditLog\" WHERE action='ADMIN_LOGIN' ORDER BY timestamp DESC;"
```

## 🔄 Workflow complet

```bash
# 1. Admin se connecte au Bastion
ssh -L 8443:localhost:443 admin@bastion.rsx103.local

# 2. Tunneling actif (session reste ouverte)
# Connected to 192.168.10.50

# 3. Dans un autre terminal, accéder à l'app
curl -k https://localhost:8443/admin

# 4. Login avec LDAP (admin@rsx103.fr / password_ldap)
# ✅ Accès autorisé depuis 127.0.0.1 (tunnel SSH)

# 5. Fermer la session
# CTRL+C sur le terminal SSH
```

## 🛡️ Sécurité avancée

### MFA sur Bastion

```bash
# Installer Authy/Google Authenticator
sudo apt-get install libpam-google-authenticator

# Configurer PAM
echo "auth required pam_google_authenticator.so" | \
  sudo tee -a /etc/pam.d/sshd

# Redémarrer SSH
sudo systemctl restart ssh
```

### Limiter les IP source (pare-feu)

```bash
# Autoriser uniquement les IPs de bureau
sudo ufw allow from 203.0.113.0/24 to any port 22
```

### Rate limiting SSH

```bash
# /etc/ssh/sshd_config
MaxAuthTries 3
MaxSessions 5
ClientAliveInterval 60
ClientAliveCountMax 3
```

## ✅ Checklist de déploiement

- [ ] Bastion SSH configuré et testé
- [ ] Clés SSH distribuées aux admins
- [ ] MFA activé sur le Bastion
- [ ] Vote App accessible via localhost:8443 (tunnel)
- [ ] Audit logging actif
- [ ] Certificat SSL valide
- [ ] Pare-feu configuré
- [ ] Admins formés à la procédure

## 📝 Documentation pour les utilisateurs

```
🔒 ACCÈS ADMIN - PROCÉDURE SÉCURISÉE

1. Ouvrir Terminal/Powershell

2. Établir la connexion sécurisée:
   ssh -L 8443:localhost:443 username@bastion.rsx103.local

3. Quand demandé, entrer votre mot de passe + MFA

4. Dans un navigateur web, aller à:
   https://localhost:8443

5. Entrer vos identifiants LDAP (email admin)

6. Déconnexion: CTRL+C dans le terminal
```

## 🚀 Déploiement en production

```bash
# Sur le serveur Vote App
# Middleware vérifiera que la connexion vient de:
# - 127.0.0.1 (tunnel SSH local)
# - IPs whitelist du VPN
# - Jamais d'IP publique

# Tous les accès sont loggés dans AuditLog:
SELECT * FROM "AuditLog"
WHERE action='ADMIN_LOGIN'
ORDER BY timestamp DESC;
```

---

**Conformité :**

- ✅ ANSSI recommandations
- ✅ Zero-trust architecture
- ✅ Journalisation complète
- ✅ Authentification LDAP
- ✅ Chiffrement TLS
