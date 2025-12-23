# Multi-stage build pour optimiser la sécurité et la taille
FROM node:20-alpine AS deps
WORKDIR /app

# Installer les dépendances système nécessaires + netcat pour healthcheck
RUN apk add --no-cache libc6-compat openssl netcat-openbsd

# Installer pnpm
RUN npm install -g pnpm

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Installer avec pnpm
RUN pnpm install --frozen-lockfile

# Stage de build
FROM node:20-alpine AS builder
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Générer Prisma client
RUN pnpm prisma generate

# Build de l'application
RUN pnpm run build

# Stage de production
FROM node:20-alpine AS runner
WORKDIR /app

# Installer netcat pour le script entrypoint
RUN apk add --no-cache netcat-openbsd postgresql-client

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copier Prisma (avec pnpm, c'est dans node_modules/@prisma)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma

# Créer le répertoire de logs
RUN mkdir -p /var/log/vote-app
RUN chown nextjs:nodejs /var/log/vote-app

# Copier le script d'entrée
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Permissions de sécurité
USER nextjs

# Port d'écoute
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Démarrage avec migrations automatiques
CMD ["./entrypoint.sh"]