# Dockerfile para Expo web usando Node 20 (Debian) e npx
FROM node:20-bullseye-slim AS build
WORKDIR /app

# copie apenas package antes para cache
COPY package*.json ./
RUN npm ci --include=dev

COPY . .

# use npx para executar o expo bin diretamente (evita Permission denied)
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]