FROM node:18 as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Set environment variables for build
ENV VITE_API_URL=https://rapid-hospitality-management-production.up.railway.app

# Build the app
COPY . .
RUN npm run build

# Setup nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Set up environment variables and start nginx
ENV PORT=80
ENV VITE_API_URL=https://rapid-hospitality-management-production.up.railway.app
CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 