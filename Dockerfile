FROM node:18-alpine
WORKDIR /usr/src/rest-watches

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN chmod u+rw logs
RUN cd logs && touch error.log && touch combined.log
RUN npm run build
COPY --chown=node:node . .

ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
USER node

CMD [ "npm", "run", "start:prod" ]