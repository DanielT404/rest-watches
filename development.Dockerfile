FROM node:18-alpine
WORKDIR /usr/src/rest-watches

COPY package*.json ./
RUN npm ci
COPY . .
RUN cd logs && touch error.log && touch combined.log
RUN chmod a+rw logs

ENV NODE_ENV development
CMD [ "npm", "run", "start:dev" ]
