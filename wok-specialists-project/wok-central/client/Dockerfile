FROM node:20-alpine AS installer

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/wok-central-client.conf

# Copy node_modules from the installer stage
COPY --from=installer /app/node_modules ./node_modules

# Copy Phaser game client files
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Security headers and proper MIME types will be handled by nginx config
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
