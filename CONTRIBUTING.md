# Contribution Guide

## 📋 Standards de Code

### TypeScript

- Utiliser des types explicites (pas de `any`)
- Activez les strict checks
- Utilisez les enums pour les constantes
- Documentez les types complexes

### Nommage

- `camelCase` pour les variables et fonctions
- `PascalCase` pour les composants et types
- `UPPER_SNAKE_CASE` pour les constantes

### Composants React

- Componentes fonctionnels avec hooks
- RSC (React Server Components) pour les pages
- Props bien typées
- Memoisez les callbacks si nécessaire

### API Routes

- Vérifier l'authentification en premier
- Rate limiting actif
- Validation des inputs avec Zod
- Logging de tous les événements sensibles

## 🧪 Testing

```bash
# Tests unitaires (à implémenter)
pnpm test

# Linting
pnpm lint

# Type checking
pnpm tsc --noEmit
```

## 📂 Structure des Fichiers

```
src/
├── app/                 # Next.js App Router
│   ├── (group)/        # Route groups pour organisation
│   ├── api/            # API routes
│   └── layout.tsx      # Layout racine
├── components/
│   ├── ui/            # Composants shadcn (pas de modifs)
│   ├── admin/         # Composants admin
│   ├── auth/          # Composants auth
│   └── common/        # Composants partagés
├── hooks/             # Custom hooks
├── lib/               # Utilitaires
│   ├── auth-*.ts      # Logique auth
│   ├── security-*.ts  # Sécurité
│   └── types/         # Types TypeScript
└── middleware.ts      # Middleware Next.js
```

## 🔐 Règles de Sécurité

- Jamais de mots de passe en hardcoded
- Toujours valider les inputs côté serveur
- Utiliser les trusted types pour les données
- Chiffrer les données sensibles
- Utiliser les secrets pour les clés
- Pas de données sensibles dans les logs

## 🚀 Processus de PR

1. **Fork** et créer une branche: `feature/description`
2. **Commit** avec messages clairs: `feat: add feature` ou `fix: resolve issue`
3. **Lancer les tests**: `pnpm lint && pnpm tsc --noEmit`
4. **Créer une PR** avec description détaillée
5. **Reviewer** vérifie le code
6. **Merge** après approbation

## 📝 Commit Messages

Format: `<type>: <description>`

Types:

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de code)
- `refactor`: Restructuration
- `perf`: Optimisation performance
- `test`: Tests (à implémenter)
- `ci`: Configuration CI/CD
- `chore`: Dépendances, outils

Exemple:

```
feat: add vote encryption with AES-256

- Implement ballot encryption with AES-256-CBC
- Add key derivation with scrypt
- Update event logging for encrypted votes
```

## 🔍 Code Review Checklist

- [ ] Le code suit les conventions
- [ ] Pas de console.log en production
- [ ] Pas de `any` types
- [ ] Authentification/Autorisation vérifiées
- [ ] Inputs validés
- [ ] Erreurs bien gérées
- [ ] Performance acceptable
- [ ] Documentation/Commentaires clairs

## 🐛 Reporting Issues

Inclure:

- Titre descriptif
- Étapes de reproduction
- Comportement attendu vs actuel
- Logs d'erreur
- Informations système (Node, OS, etc.)
- Screenshots si applicable

## 📚 Documentation

- Mettez à jour le README si vous changez l'installation
- Documentez les nouvelles API routes
- Ajouter les commentaires pour la logique complexe
- Garder le DEPLOYMENT.md à jour

---

**Merci de contribuer!** 🙏
