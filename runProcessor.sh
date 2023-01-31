#!/bin/bash

nvm use
yarn install
yarn build
docker-compose up -d db-kintsugi-testnet
yarn db:migrate
yarn processor:start