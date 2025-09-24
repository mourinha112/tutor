# Dockerfile para Expo web usando Node 20 (Debian) e npx
FROM node:20-bullseye-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

# garante executabilidade dos wrappers em node_modules/.bin
RUN if [ -d node_modules/.bin ]; then chmod -R a+rx node_modules/.bin || true; fi

# tenta npx; se o wrapper ainda falhar, executa entrypoint JS diretamente
RUN npx expo export --platform web || node ./node_modules/@expo/cli/build/bin/expo-cli.js export --platform web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]