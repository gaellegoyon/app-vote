# Architecture d'accès - Votant vs Admin

## 🎯 Flux d'authentification

```
┌─────────────────────────────────────────────────────────────┐
│                    Accès au site                            │
│              rsx103cnam.ddns.net                            │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌──────────────┐        ┌──────────────────┐
    │ Direct       │        │ Via Bastion SSH  │
    │ (Public IP)  │        │ (127.0.0.1)      │
    └──────┬───────┘        └────────┬─────────┘
           │                         │
           ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ /auth            │    │ /auth            │
    │ Votant ONLY      │    │ Both options     │
    └──────┬───────────┘    └────────┬─────────┘
           │                         │
           ├─ Votant ✓              ├─ Votant ✓
           └─ Admin ✗               └─ Admin ✓ (VPN OK)
```

## 📋 Cas d'usage 1 : Votant Lambda

**Accès :** `https://rsx103cnam.ddns.net` (IP publique)

```
1. Landing page (/)
   ↓
2. Page /auth (détection IP)
   - IP détectée: 203.0.113.42 (publique)
   - Option Admin: DISABLED ❌
   ↓
3. Votant clique "Connexion Votant"
   ↓
4. /auth/login
   - Invitation par email + token
   - Création password
   - Vote
   ↓
5. /vote (session votant)
```

## 📋 Cas d'usage 2 : Admin via Bastion

**Accès :** `ssh -L 8443:localhost:443 user@bastion` → `https://localhost:8443`

```
1. Landing page (/)
   ↓
2. Page /auth (détection IP)
   - IP détectée: 127.0.0.1 (localhost/tunnel)
   - Option Admin: ENABLED ✓
   ✅ "Accès sécurisé via Bastion détecté"
   ↓
3. Admin voit DEUX options:
   a) "Connexion Votant" (option 1)
   b) "Connexion Admin" (option 2) - VIP
   ↓
4a. Si votant (rare):
   /auth/login → vote

4b. Si admin (normal):
   /auth/admin
   - Email: admin1@rsx103.fr
   - Password: LDAP
   ↓
5. /admin (panel complet)
   - Créer élections
   - Inviter votants
   - Voir résultats
```

## 🔍 Détection du type d'accès

```typescript
// src/app/auth/page.tsx - Détection intelligent
const checkAccessPath = async () => {
  const response = await fetch("/api/debug/ip");
  const { ip } = await response.json();

  const isBastionAccess =
    ip.includes("127.0.0.1") || // Tunnel local
    ip.includes("::1") || // IPv6 localhost
    ip === ""; // Headers vides (tunnel)

  setIsViaBastion(isBastionAccess);
};
```

## 📊 Logique UI

| Condition                   | Option Votant | Option Admin               |
| --------------------------- | ------------- | -------------------------- |
| IP publique (votant lambda) | ✅ Visible    | ❌ Disabled + "VPN requis" |
| IP 127.0.0.1 (Bastion)      | ✅ Visible    | ✅ Visible                 |
| Développement (localhost)   | ✅ Visible    | ✅ Visible                 |

## 🛡️ Sécurité appliquée

### Votant lambda

- ✓ Accès `/auth/login`
- ✓ Vote via token d'invitation
- ✗ Jamais `/auth/admin`
- ✗ Jamais `/admin`

### Admin via Bastion

- ✓ Accès `/auth/admin` (VPN OK)
- ✓ LDAP authentication
- ✓ Admin panel complet
- ✓ Tous les logs enregistrés

## 🚀 Routes protégées

```
Publiques:
  / → /auth (redirection automatique)
  /auth → sélection dynamique
  /auth/login → votant uniquement
  /auth/complete → token invitation

Admin (protégées VPN):
  /auth/admin → si IP=127.0.0.1 sinon /auth/vpn-required
  /admin/* → si LDAP OK + VPN
  /api/admin/* → si JWT + VPN

Votant (protégées session):
  /candidates
  /vote
  /results
  /api/candidates/*
  /api/vote/*
```

## 📝 Workflow complet

### Admin normale

```bash
# 1. Admin établit tunnel SSH
ssh -L 8443:localhost:443 gaelle@bastion.rsx103.local

# 2. Navigateur
https://localhost:8443

# 3. Détection: IP = 127.0.0.1 ✓ Bastion detected
Page /auth affiche:
  - Option Votant
  - Option Admin ✅ (enabled)

# 4. Admin clique "Connexion Admin"
→ /auth/admin

# 5. Login avec LDAP
admin@rsx103.fr / password_ldap

# 6. ✅ Redirection /admin
Panel de gestion complet
```

### Votant normale

```bash
# 1. Votant reçoit email d'invitation
https://rsx103cnam.ddns.net/?token=jwt_token_72h

# 2. Automatic redirect
/auth/complete?token=...

# 3. Crée password

# 4. Accès /vote
Peut voter ✓

# 5. Voir résultats
/results
```

## ✅ Checklist de déploiement

- [ ] Page `/auth` créée avec détection IP
- [ ] Option Admin disabled pour IP publiques
- [ ] Bastion SSH configuré
- [ ] Tunnel local 127.0.0.1 → 443 testé
- [ ] LDAP authentification fonctionnelle
- [ ] Votant invitation par email OK
- [ ] Logs audit complets

## 🔧 Debugging

```bash
# Vérifier l'IP détectée
curl https://rsx103cnam.ddns.net/api/debug/ip

# Via tunnel SSH
curl -k https://localhost:8443/api/debug/ip
# Doit retourner: { "ip": "127.0.0.1" }

# Vérifier les logs
docker-compose logs -f app | grep "auth/page"
```

---

**Résumé :** Deux chemins d'accès parallèles, une seule application = sécurité maximale ✅
