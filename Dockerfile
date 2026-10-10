FROM node:22-bookworm-slim AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies (web only; the API has its own image)
RUN pnpm install --frozen-lockfile --filter web...

# Copy source
COPY . .

# Build the application
RUN pnpm --filter web build

# Production stage
FROM nginx:alpine

# Copy built assets to nginx
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
