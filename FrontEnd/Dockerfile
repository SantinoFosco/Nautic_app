# FrontEnd/Dockerfile
# 1) Build de Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY ../../../../../Downloads /app
# En prod, usamos API por proxy: /api
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# 2) Nginx para servir estáticos y proxy /api → backend
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]