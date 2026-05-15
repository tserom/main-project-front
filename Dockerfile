# syntax=docker/dockerfile:1
FROM node:20.19-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_HELLO_FRONT_URL=http://localhost:8100/
ARG VITE_USER_FRONT_URL=http://localhost:8101/
ENV VITE_HELLO_FRONT_URL=$VITE_HELLO_FRONT_URL
ENV VITE_USER_FRONT_URL=$VITE_USER_FRONT_URL

RUN pnpm build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
