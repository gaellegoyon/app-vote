# 🔐 Guide Admin - Connexion via Bastion SSH

## 📍 Vue d'ensemble rapide

Pour accéder à l'interface admin, tu dois:

1. **Établir un tunnel SSH** via le Bastion (192.168.10.50)
2. **Accéder à l'app** via le tunnel local (https://localhost:8443)
3. **Te connecter** avec les identifiants LDAP admin

---

## 🚀 Méthode 1 : SSH Tunnel Simple (RECOMMANDÉE)

### Prérequis

- ✅ Accès SSH au Bastion (192.168.10.50)
- ✅ Identifiants LDAP admin (admin@rsx103.fr + password)
- ✅ Certificat SSL auto-signé accepté (ou navigateur moderne)

### Étapes

#### **Étape 1 : Ouvrir un terminal**

```bash
# Sur macOS/Linux
open Terminal

# Sur Windows (PowerShell ou Git Bash)
# Utilisez la fenêtre existante ou WSL2
```

#### **Étape 2 : Lancer le tunnel SSH**

```bash
ssh -L 8443:10.0.0.4:443 gaelle@192.168.10.50
```

**Explication:**

- `-L 8443:10.0.0.4:443` = Redirection de port via le Bastion
  - `8443` = Port local sur ta machine
  - `10.0.0.4` = Adresse IP interne du Vote App (DMZ)
  - `443` = Port HTTPS du Vote App
  - Le Bastion relie ta machine locale (8443) à l'app (10.0.0.4:443)
- `gaelle@192.168.10.50` = Connexion au Bastion

**Résultat attendu:**

```
The authenticity of host '192.168.10.50' can't be established.
ECDSA key fingerprint is SHA256:xxxxx
Are you sure you want to continue connecting (yes/no/fingerprint)?

# Tape: yes
```

Une fois connecté, tu verras:

```
Welcome to Bastion Server
Last login: <date>
gaelle@bastion:~$
```

⚠️ **Laisse ce terminal OUVERT** - Le tunnel doit rester actif

---

#### **Étape 3 : Ouvrir un DEUXIÈME terminal (ou tab)**

Dans **un autre terminal/tab**, accède à l'app:

```bash
# Option A : Directement via navigateur
open https://localhost:8443

# Option B : Tester d'abord avec curl
curl -k https://localhost:8443/api/health
```

**Résultat attendu (curl):**

```json
{
  "status": "ok",
  "timestamp": "2025-12-24T10:30:45Z"
}
```

---

#### **Étape 4 : Accéder à la page d'authentification**

Navigue vers: **https://localhost:8443**

Tu verras:

```
🗳️ Plateforme de Vote

✅ Accès sécurisé via Bastion détecté.
Les deux options de connexion sont disponibles.

┌─────────────────────┐  ┌──────────────────────┐
│     👥 Votant       │  │  🛡️ Administration   │
│ Connexion Votant    │  │ Connexion Admin      │
└─────────────────────┘  └──────────────────────┘
```

---

#### **Étape 5 : Cliquer sur "Connexion Admin"**

1. Clique sur le bouton **🛡️ Administration**
2. Tu es redirigé vers: **https://localhost:8443/auth/admin**

---

#### **Étape 6 : Te connecter avec LDAP**

**Page de login admin:**

```
Email: ________________
Password: ________________
[ MFA Setup ] [ Login ]
```

**Identifiants:**

- **Email:** `admin1@rsx103.fr` (ou admin2, admin3, admin4)
- **Password:** Ton mot de passe LDAP RSX103

**Exemple:**

```
Email: admin1@rsx103.fr
Password: ••••••••••••
```

Clique **Login**

---

#### **Étape 7 : Accéder au Dashboard Admin**

Si tout est OK, tu verras:

```
┌────────────────────────────────────────┐
│  Dashboard Admin - RSX103 CNAM         │
│                                        │
│  📊 Elections                          │
│  👥 Candidats                          │
│  ✉️  Invitations                       │
│  📋 Logs                               │
│  🏆 Résultats                          │
└────────────────────────────────────────┘
```

---

## 📌 Dépannage

### ❌ Erreur: "Connection refused"

```
ssh: connect to host 192.168.10.50 port 22: Connection refused
```

**Solutions:**

```bash
# 1. Vérifier que le Bastion est accessible
ping 192.168.10.50

# 2. Vérifier que SSH est running
ssh -v gaelle@192.168.10.50  # Voir les logs détaillés

# 3. Vérifier les pare-feu
# Demande à l'admin réseau
```

---

### ❌ Erreur: "Permission denied (publickey)"

```
Permission denied (publickey).
```

**Solutions:**

```bash
# 1. Vérifier ta clé SSH
ls -la ~/.ssh/id_rsa
# ou si tu utilises une autre clé:
ssh -i ~/.ssh/custom_key gaelle@192.168.10.50

# 2. Vérifier que la clé est autorisée
ssh-keyscan -t rsa 192.168.10.50 >> ~/.ssh/known_hosts

# 3. Ajouter la clé à l'agent SSH
ssh-add ~/.ssh/id_rsa
```

---

### ❌ Erreur: "Certificate verify failed" (navigateur)

```
MOZILLA_PKIX_ERROR_SELF_SIGNED_CERT
```

**Solutions:**

- **Chrome/Firefox:** Clique sur "Advanced" → "Proceed anyway"
- **Safari:** Clique sur "Show Details" → "Visit this website"
- **Curl:** Utilise le flag `-k` (insecure)

_Note: Le cert auto-signé est normal en développement_

---

### ❌ Erreur: "Admin page not accessible" / Redirection vers /auth

**Raison:** L'IP détectée n'est pas 127.0.0.1 (tunnel non actif)

**Vérification:**

```bash
# Dans le tunnel SSH, appelle:
curl -k https://localhost:8443/api/debug/ip

# Résultat attendu:
# {"ip":"127.0.0.1"}
```

**Solution:**

1. S'assurer que le tunnel SSH est actif
2. Vérifier dans le **premier terminal** (tunnel)
3. Si interrompu, relancer:
   ```bash
   ssh -L 8443:localhost:443 gaelle@192.168.10.50
   ```

---

### ❌ Erreur: "LDAP authentication failed"

```
Email ou mot de passe incorrect
```

**Vérification:**

```bash
# 1. Vérifier que l'email est exact
# admin1@rsx103.fr (avec le domaine)

# 2. Vérifier le mot de passe LDAP
# C'est TON mot de passe RSX103 (pas local Windows)

# 3. Vérifier la connexion LDAP depuis l'app
docker-compose logs app | grep -i ldap
```

---

## 🎯 Configuration SSH avancée

### Raccourci permanent (~/.ssh/config)

```ssh-config
Host bastion-vote
    HostName 192.168.10.50
    User gaelle
    LocalForward 8443 localhost:443
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
```

**Utilisation simplifiée:**

```bash
ssh bastion-vote

# Puis dans un autre terminal:
open https://localhost:8443
```

---

### Multi-admin avec clés différentes

```ssh-config
Host bastion-admin1
    HostName 192.168.10.50
    User admin1
    IdentityFile ~/.ssh/admin1_key
    LocalForward 8443 localhost:443

Host bastion-admin2
    HostName 192.168.10.50
    User admin2
    IdentityFile ~/.ssh/admin2_key
    LocalForward 8443 localhost:443
```

---

## 📊 Vérifications utiles

### Confirmer que tu es bien admin

```bash
# Pendant que tu es connecté au dashboard

# 1. Vérifier l'IP dans les logs
curl -k https://localhost:8443/api/debug/ip
# {"ip":"127.0.0.1"}  ✅ Bastion OK

# 2. Vérifier la session admin
# Regarder le cookie "adminToken" dans les DevTools (F12)

# 3. Vérifier les logs serveur
docker-compose logs app | tail -20
# Chercher: "Admin login from 127.0.0.1"
```

---

### Vérifier les admins disponibles

**LDAP admins configurés:**

- `admin1@rsx103.fr`
- `admin2@rsx103.fr`
- `admin3@rsx103.fr`
- `admin4@rsx103.fr`

Tous avec les mêmes droits. Utilise celui que tu préfères.

---

## 🔒 Sécurité - Best Practices

### ✅ À FAIRE

```bash
# ✅ Utiliser des clés SSH (pas de password)
ssh -i ~/.ssh/id_rsa gaelle@192.168.10.50

# ✅ Fermer le tunnel quand tu as fini
# CTRL+C dans le terminal du tunnel

# ✅ Vérifier les logs d'audit
docker-compose logs app | grep ADMIN

# ✅ Changer ton mot de passe LDAP régulièrement
```

---

### ❌ À ÉVITER

```bash
# ❌ Partager le tunnel avec d'autres
# Chacun doit avoir son propre tunnel

# ❌ Laisser le tunnel ouvert H24
# Ferme-le quand tu as terminé

# ❌ Utiliser des mots de passe en clair
# Utilise des clés SSH

# ❌ Envoyer des credentials par email/chat
# Distribue les clés publiques SSH uniquement
```

---

## 🔄 Workflow complet (résumé)

```bash
# Terminal 1 - Lancer le tunnel
ssh -L 8443:localhost:443 gaelle@192.168.10.50
# ⏳ Laisse ouvert

# Terminal 2 - Accéder à l'app
open https://localhost:8443

# ✨ Dashboard admin accessible
# - Créer élections
# - Inviter votants
# - Voir résultats
# - Gérer candidats

# Quand tu as fini
# Terminal 1 : CTRL+C
# Tunnel fermé, accès bloqué
```

---

## 📞 Besoin d'aide?

### Contacter l'admin réseau

- **IP Bastion inaccessible** → Vérifier firewall/réseau
- **Clé SSH rejetée** → Ajouter ta clé publique
- **LDAP timeout** → Vérifier serveur LDAP

### Contacter l'admin app

- **Dashboard ne charge pas** → Vérifier logs Docker
- **Page admin inaccessible** → Vérifier middleware IP
- **MFA non fonctionnel** → Vérifier TOTP secret

---

## 📋 Checklist de connexion

```
□ Terminal 1 lancé
□ ssh -L 8443:... exécuté
□ Prompt bastion apparaît (Terminal 1 actif)
□ Terminal 2 ouvert
□ https://localhost:8443 accessible
□ 🗳️ Plateforme de Vote visible
□ ✅ "Accès Bastion détecté" visible
□ 🛡️ Bouton Admin visible
□ Clique "Connexion Admin"
□ Page /auth/admin chargée
□ Email admin@rsx103.fr rempli
□ Password rempli
□ Clique "Login"
□ ✅ Dashboard admin visible
□ Profit ! 🎉
```

---

**Last Updated:** December 24, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
