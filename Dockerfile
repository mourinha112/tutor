# Dockerfile para Expo web no Dokploy
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @expo/cli  # Instala Expo globalmente
RUN npm ci --include=dev  # Instala dependências incluindo dev
COPY . .
RUN npm run build  # Executa "expo export --platform web" e gera dist

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]