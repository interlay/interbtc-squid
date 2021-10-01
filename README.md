# Interbtc Hydra
Quick setup of a POC to get hydra indexer to index a local interbtc chain and generate interbtc types for typescript.

List of current hacks (to clean up):
 - parachain.json currently copied from lib, add either export from lib or yarn script to update it in-repo?
 - types.json is currently ripped out of interbtc-types. It needs to be a json, so will need to add a yarn script to take interbtc-types, grab `definitions.types[0].types` and save it to a standalone json.
 - docker-compose setup from the UI was copied over into the indexer compose. Ideally, tweak the docker networking to allow the indexer's compose to connect to the parachain from a different docker compose setup, to avoid this duplication

## Codegen
For CI, or when pulling the project, you must run
```bash
yarn codegen
yarn typegen
```
On top of the usual `yarn install`.

## Prerequisites

* Node v14x
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

## Project structure

Hydra tools expect a certain directory layout:

* `generated` - model/server definitions created by `codegen`. Do not alter the contents of this directory manually.
* `server-extension` - a place for custom data models and resolvers defined via `*.model.ts` and `*.resolver.ts` files.
* `chain` - data type definitions for chain events and extrinsics created by `typegen`.
* `mappings` - mapping module.
* `.env` - hydra tools are heavily driven by environment variables defined here or supplied by a shell.

## Development flow

If you modified `schema.graphql`:

```bash
# Run codegen to re-generate model/server files
npm run codegen

# Analyze database state and create a new migration to match generated models
npm run db:create-migration # add -n "myName" to skip the migration name prompt

# Apply the migrations
npm run db:migrate
```

You might want update the `Initial` migration instead of creating a new one (e.g. during the development phase when the production database is not yet set up). In that case it convenient to reset the database schema and start afresh:

```bash
rm db/migrations/LastUnappliedMigration.ts
npm run db:reset
npm run db:create-migration
npm run db:migrate
```

To generate new type definitions for chain events and extrinsics:

```bash
# Review typegen section of manifest.yml (https://docs.subsquid.io/hydra-typegen)

# Delete old definitions
rm -rf chain

# Run typegen tool
npm run typegen
```

## Self-hosted indexer

It is recommended to use a readily set up indexer if available. It takes some time for a freshly started indexer
to get in sync with chain and catch the events.

Have a look at `./indexer/docker-compose.yml` for an example of how you can set up a self-hosted version.

## Misc

For more details, please checkout https://docs.subsquid.io.
