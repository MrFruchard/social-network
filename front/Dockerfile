# Utiliser une image légère de Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package.json package-lock.json ./


# Installer les dépendances en mode développement
RUN npm install --legacy-peer-deps

# Copier tout le code du projet
COPY . .

# Exposer le port de Next.js
EXPOSE 3000

# Variables d'environnement pour le mode développement
ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
ENV PATH /app/node_modules/.bin:$PATH

# Lancer Next.js en mode développement avec hot reload
CMD ["npm", "run", "dev"]