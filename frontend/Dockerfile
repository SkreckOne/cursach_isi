# Этап сборки (Node.js)
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап запуска (Nginx)
FROM nginx:alpine
# Копируем билд React в папку Nginx
COPY --from=build /app/build /usr/share/nginx/html
# Копируем конфиг nginx (создадим его ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]