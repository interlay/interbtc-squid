#!/usr/bin/env bash
echo "+-----------------------------------------------------------------+"
echo "| Enter the number that corresponds to your chosen network:       |"
echo "| 1. interlay                                                     |"
echo "| 2. kintsugi                                                     |"
echo "| 3. interlay-testnet                                             |"
echo "| 4. kintsugi-testnet                                             |"
echo "+-----------------------------------------------------------------+"

read choice

if [ $choice == 1 ]; then
  docker-compose up -d db-interlay
  export ARCHIVE_ENDPOINT='https://interlay.archive.subsquid.io/graphql'
  export CHAIN_ENDPOINT='wss://api.interlay.io/parachain'
  export PROCESS_FROM='600000'
  export SS58_CODEC='interlay'
  export BITCOIN_NETWORK='mainnet'
  export DB_PORT='5435'
elif [ $choice == 2 ]; then
  docker-compose up -d db-kintsugi
  export ARCHIVE_ENDPOINT='https://kintsugi.archive.subsquid.io/graphql'
  export CHAIN_ENDPOINT='wss://api-kusama.interlay.io/parachain'
  export PROCESS_FROM='540000'
  export SS58_CODEC='kintsugi'
  export BITCOIN_NETWORK='mainnet'
  export DB_PORT='5434'
elif [ $choice == 3 ]; then
  docker-compose up -d db-interlay-testnet
  export ARCHIVE_ENDPOINT='https://api-testnet.interlay.io/subsquid-gateway/graphql'
  export CHAIN_ENDPOINT='wss://api-testnet.interlay.io/parachain'
  export SS58_CODEC='interlay'
  export BITCOIN_NETWORK='testnet'
  export DB_PORT='5436'
elif [ $choice == 4 ]; then
  docker-compose up -d db-kintsugi-testnet
  export ARCHIVE_ENDPOINT='https://api-dev-kintsugi.interlay.io/subsquid-gateway/graphql'
  export CHAIN_ENDPOINT='wss://api-dev-kintsugi.interlay.io/parachain'
  export SS58_CODEC='kintsugi'
  export BITCOIN_NETWORK='testnet'
  export DB_PORT='5433'
else
  echo "Invalid choice. Options are 1, 2, 3, and 4"
  exit 1
fi

if [ -f ~/.nvm/nvm.sh ]; then
  . ~/.nvm/nvm.sh
elif command -v brew; then
  BREW_PREFIX=$(brew --prefix nvm)
  if [ -f "$BREW_PREFIX/nvm.sh" ]; then
    . $BREW_PREFIX/nvm.sh
  fi
fi

if command -v nvm ; then
  nvm use
else
  echo "WARN: not able to configure nvm"
fi

yarn install
yarn build
yarn db:migrate
yarn processor:start