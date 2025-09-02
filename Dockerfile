# Use Node.js 20 Alpine image for smaller size
FROM node:20-alpine AS base

# Production image - simplified approach
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the pre-built application (built locally to avoid dependency issues)
COPY ./out ./out
COPY ./public ./public

# Create a simple HTTP server for static files
RUN npm install -g serve

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Serve the static files
CMD ["serve", "-s", "out", "-l", "3000"]


