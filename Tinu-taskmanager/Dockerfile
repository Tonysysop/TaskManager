FROM node:20-alpine AS installer

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN --mount=type=secret,id=appsecret \
    cat /run/secrets/appsecret > .env && \
    npm run build -- --outDir Taskmanager-build



FROM nginx:stable-alpine


COPY --from=installer /app/Taskmanager-build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

# RUN chown -R nginx:nginx /usr/share/nginx/html && \
#     mkdir -p /var/cache/nginx/client_temp && \
#     chown -R nginx:nginx /var/cache/nginx/client_temp

# Create and fix temp directory permissions
RUN mkdir -p \
      /var/cache/nginx/client_temp \
      /var/cache/nginx/proxy_temp \
      /var/cache/nginx/fastcgi_temp \
      /var/cache/nginx/uwsgi_temp \
      /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx


USER nginx



EXPOSE 5173



