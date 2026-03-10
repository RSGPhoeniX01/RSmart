FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# If using Vite, it's /app/dist. If using CRA, it's /app/build.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]