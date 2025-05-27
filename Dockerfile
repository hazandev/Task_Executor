# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json again for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on (defaulting to 3000 for NestJS)
# Update this if your application uses a different port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"] 