FROM node:lts-alpine

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./src

RUN yarn install
RUN yarn build
RUN rm -rf node_modules
RUN yarn install --production

EXPOSE 8080

CMD [ "yarn", "start" ]
