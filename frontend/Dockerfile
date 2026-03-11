FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g serve

COPY . .

EXPOSE 3000

CMD npm run build && serve -s dist -l 3000
