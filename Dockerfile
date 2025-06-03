FROM node:18-alpine

WORKDIR /src/app

EXPOSE 3000

COPY package.json .

RUN npm install

COPY . ./

RUN npx prisma generate

RUN npm run build
RUN chmod +x ./start.sh
ENTRYPOINT ["sh", "./start.sh"]