FROM docker.io/library/node:lts AS node

FROM node AS node-with-gyp
RUN apk add g++ make python3

FROM node-with-gyp AS builder
WORKDIR /app
ADD package.json .
ADD yarn.lock .
RUN yarn --frozen-lockfile
ADD tsconfig.json .
ADD src src
RUN yarn build

FROM node-with-gyp AS deps
WORKDIR /app
ADD package.json .
ADD yarn.lock .
RUN yarn cache clean && yarn install --frozen-lockfile

FROM node AS processor
WORKDIR /app
COPY --from=deps /app/package.json .
COPY --from=deps /app/node_modules node_modules
COPY --from=builder /app/lib lib
ADD db db
ADD indexer/typesBundle.json indexer/
ADD schema.graphql .
CMD [ "node", "lib/processor.js" ]
ENV PROCESSOR_PROMETHEUS_PORT 3000
EXPOSE 3000
