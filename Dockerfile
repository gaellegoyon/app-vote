# Multi-stage build pour optimiser la sécurité et la taille
FROM node:20-alpine AS deps
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat openssl

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage de build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Générer Prisma client
RUN npx prisma generate

# Build de l'application
RUN pnpm run build

# Stage de production
FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Créer le répertoire de logs
RUN mkdir -p /var/log/vote-app
RUN chown nextjs:nodejs /var/log/vote-app

# Permissions de sécurité
USER nextjs

# Port d'écoute
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Variables d'environnement par défaut
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node server.js || exit 1

# Démarrage de l'application
CMD ["node", "server.js"]