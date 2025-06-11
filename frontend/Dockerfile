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