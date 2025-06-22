FROM node:20

ENV TZ=Asia/Tokyo
WORKDIR /app

COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm install --prefix ./frontend
RUN npm install --prefix ./backend

CMD ["sleep", "infinity"]
