FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord
COPY package*.json ./

# Installer les dépendances en mode production
RUN npm install -g @angular/cli && \
    npm ci --quiet && \
    npm cache clean --force

# Copier le reste des fichiers
COPY . .

EXPOSE 4200

# Utiliser le mode development pour le hot-reload
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check", "--poll=2000"]
