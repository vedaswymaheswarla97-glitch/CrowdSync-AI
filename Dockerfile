# Multi-stage build for production deployment
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Run test suite and build frontend bundle
RUN npx tsx tests/run_tests.ts
RUN npm run build

# Expose server port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start standalone server
CMD ["npx", "tsx", "server.ts"]
