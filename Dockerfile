FROM node:22-alpine

WORKDIR /app

# Install libc6-compat for Alpine compatibility with esbuild & Node native tools
RUN apk add --no-cache libc6-compat

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build production frontend bundle
RUN npm run build

# Expose default port
EXPOSE 3000

ENV PORT=3000

# Start server
CMD ["npm", "start"]
