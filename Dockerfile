# syntax=docker/dockerfile:1

FROM node:20.10.0-alpine AS base

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME

RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS fetcher
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch

FROM fetcher AS installer
WORKDIR /app

COPY --from=fetcher /app/pnpm-lock.yaml /app/package.json ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --silent --offline

FROM base AS builder
WORKDIR /app

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG AWS_ENDPOINT
ARG AWS_REGION
ARG AWS_BUCKET_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG NEXT_PUBLIC_BASE_URL

ENV AWS_ENDPOINT=$AWS_ENDPOINT
ENV AWS_REGION=$AWS_REGION
ENV AWS_BUCKET_NAME=$AWS_BUCKET_NAME
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

COPY . ./
COPY --from=installer /app/node_modules ./node_modules
COPY --from=fetcher /app/package.json /app/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm build

FROM base AS final
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

COPY public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000/tcp

CMD ["node", "server.js"]
