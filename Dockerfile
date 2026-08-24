# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The .env file must be present or variables passed as args for Vite to bake them into the build
RUN npm run build

# Serve stage
FROM nginx:alpine
# Vite is configured to output to the "build" directory
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
