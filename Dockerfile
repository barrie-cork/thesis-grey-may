FROM node:18.16.1-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
