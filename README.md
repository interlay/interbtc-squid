# Interbtc Hydra
Quick setup of a POC to get hydra indexer to index a local interbtc chain and generate interbtc types for typescript.

List of current hacks (to clean up):
 - parachain.json currently copied from lib, add either export from lib or yarn script to update it in-repo?
 - docker-compose setup from the UI was copied over into the indexer compose. Ideally, tweak the docker networking to allow the indexer's compose to connect to the parachain from a different docker compose setup, to avoid this duplication

## Codegen
For CI, or when pulling the project, you must run
```bash
yarn gen:all
```
On top of the usual `yarn install`. This will regenerate the parachain types json, the graphql models and the typescript event classes.

## Prerequisites

* Node v16x
* Docker

## Bootstrap

```bash
yarn install

# Start a postgres instance
docker-compose up db # add optional -d flag to detach from terminal

# Apply migrations related to the processor's state keeping tables
yarn processor:migrate

# Apply the project's migrations
yarn db:migrate

# Now you can start processing chain data
yarn processor:start

# The above command will block
# Open a separate terminal and launch the graphql server to query the processed data
yarn query-node:start
```

## Details

Please, have a look at https://github.com/subsquid/squid-template for more details.
