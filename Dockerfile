# Etapa 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Variável de ambiente 
ENV NEXT_PUBLIC_SECRET_KEY=fec3ee9596164653946d66b88a7b1d7041b1b73cb6337686743c984a173e92da

# Agora sim, a variável será usada no build
RUN npm run build

# Etapa 2: Runtime
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Opcional: manter a variável no ambiente de runtime, se necessário
ENV NEXT_PUBLIC_SECRET_KEY=fec3ee9596164653946d66b88a7b1d7041b1b73cb6337686743c984a173e92da

EXPOSE 3000
CMD npm run start
