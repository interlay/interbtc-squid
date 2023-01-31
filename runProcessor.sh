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
elif [ $choice == 2 ]; then
  docker-compose up -d db-kintsugi
elif [ $choice == 3 ]; then
  docker-compose up -d db-interlay-testnet
elif [ $choice == 4 ]; then
  docker-compose up -d db-kintsugi-testnet
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