FROM caddy:2-alpine

# Copy Caddy configuration
COPY Caddyfile.json /etc/caddy/Caddyfile.json

# Create certs directory
RUN mkdir -p /etc/caddy/certs

# Generate self-signed certificates for local development
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/caddy/certs/key.pem \
    -out /etc/caddy/certs/cert.pem \
    -subj "/C=US/ST=State/L=City/O=WokSpecialists/CN=wok.local" \
    -addext "subjectAltName=DNS:wok.local,DNS:game.wok.local,DNS:api.wok.local,DNS:localhost"

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile.json"]
