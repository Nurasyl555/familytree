FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
# Путь деплоя (напр. "/familytree/" на esg.kbtu.kz) — влияет на пути к собранным ассетам
# (vite.config.js base) и на react-router (App.jsx basename). Не задан — Vercel/docker-compose
# для локалки/облака, собирается как обычно, в корне домена.
ARG VITE_BASE_PATH
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
