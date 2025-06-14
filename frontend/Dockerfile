FROM node:20

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

CMD if [ "$NODE_ENV" = "production" ]; then npm start; else npm run dev; fi



# ------ ecr上げる時こっち使う ------
# FROM node:20 AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:20-alpine
# WORKDIR /app

# ENV NODE_ENV=production

# COPY package*.json ./
# RUN npm install --production

# COPY --from=builder /app/.next ./.next

# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.ts ./next.config.ts


# EXPOSE 3000

# CMD ["npm", "start"]