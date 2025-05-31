FROM node:18

WORKDIR /src/app

EXPOSE 3000

COPY package.json .

RUN npm install

COPY . ./

RUN npx prisma generate

RUN npm run build

RUN ls -l

CMD [ "node", "dist/main.js" ]