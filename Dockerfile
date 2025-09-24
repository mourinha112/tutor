# Dockerfile para Expo web no Dokploy
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false  # Instala tudo, incluindo dev
COPY . .
# Adiciona permissões ao Expo e instala globalmente se necessário
RUN chmod +x node_modules/.bin/expo || npm install -g @expo/cli
RUN npm run build  # Executa "expo export --platform web" e gera dist

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]