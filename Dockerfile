FROM docker.io/library/node:lts-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY ./indexer/ ./indexer
COPY tsconfig.json .
COPY manifest.yml .
COPY parachain.json .
COPY schema.graphql .

RUN yarn gen:all

ENTRYPOINT [ "./node_modules/.bin/hydra-processor" ]
