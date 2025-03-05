# Use node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy monorepo package.json, workspace YAML, and lock file
COPY ../../pnpm-workspace.yaml ../../package.json ../../pnpm-lock.yaml ./

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all workspace packages to ensure dependencies resolve
COPY ../../packages ./packages
COPY ../../apps ./apps

# Install dependencies using pnpm workspace filtering
RUN pnpm install --filter=server...

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 8080

# Set working directory to server
WORKDIR /app/apps/server

# Start the server
CMD ["pnpm", "start"]
