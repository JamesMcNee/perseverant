FROM node:18.2-alpine3.15

RUN mkdir -p /usr/local/perseverant

WORKDIR /usr/local/perseverant

COPY . .

RUN npm install

RUN npm run build
RUN npm run test

ENTRYPOINT ["npm", "publish"]