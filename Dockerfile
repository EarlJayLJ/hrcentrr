FROM node:22-alpine

WORKDIR /app

# Copy package definition and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend for production
RUN npm run build

# Expose port 3000 to local network
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Persistent volume for database and uploaded documents
VOLUME ["/app/data", "/app/uploads"]

# Run server with automatic restart capability
CMD ["node", "server.ts"]
