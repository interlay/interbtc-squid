# Sample Hydra Project

This is a template Hydra project processing account balances from Kusama. Experiment by modifying `schema.graphql` and the mappings in the `mappings` folder, defined in `manifest.yml`.

## 0. Prerequisites

- Node v14.x
- Postgres database accepting connections
- Docker (optional) for building images

## 1. Bootstrap

Run

```bash
yarn && yarn bootstrap
```

and generate the model files as defined in `schema.graphql`, create the database and run all the necessary migrations in one shot.

NB! Don't use in production, as it will delete all the existing records.


## 2. Generate Types for events and extrinsics

A separate tool Hydra Typegen can be used for generating Typescript classes for the event handlers (the _mappings_).  
Run

```bash
yarn typegen
```
to run the [typegen](https://github.com/Joystream/hydra/tree/master/packages/hydra-typegen/README.md) for events and extrinsics defined in `manifest.yml` (it fetches the metadata from an RPC endpoint and blockhash defined there). 


## 3. Build Mappings

Mappings is a separated TypeScript module created in the mappings folder. The handlers exported by the module should match the ones defined in `manifest.yml` in the mappings section. Once the necessary files are generated, build it with

```bash
yarn workspace sample-mappings install
yarn mappings:build
```

## 4. Run the processor and the GraphQL server

Then run the processor:

```bash
yarn processor:start
```

Afterwards start the GraphQL server in a separate terminal (opens a GraphQL playground at localhost by default):

```bash
yarn query-node:start:dev
```

## 5. Choose a Hydra Indexer

The Hydra Indexer endpoint is set by the environment variable `INDEXER_ENDPOINT_URL` sourced from `.env`. 

Check the official [docs](https://docs.subsquid.io) for the list of publicly available Hydra Indexers maintained by Subsquid. 

If you don't find your substrate chain, [contact us](mailto:dz@subsquid.io) and we will setup an Indexer for your chain.

## 6. Self-hosted Hydra Indexer

One can also use a self-hosted Hydra Indexer.

The simplest way to run an indexer locally is to use the docker-compose template `docker-compose-indexer-template.yml`. The following environment variables must be set in `.indexer.env`:

- Indexer database connection settings: `DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`
- Chain RPC endpoint: `WS_PROVIDER_ENDPOINT_URI`
- If the Substrate runtime uses non-standard types, type definitions or a bundle type overrides should be provided.

Run

```sh
docker compose --env-file .indexer.env -f docker-compose-indexer-template.yml up
```

Follow the links for more information about the [indexer](https://docs.subsquid.io/hydra-indexer) service and [indexer-api-gateway](https://docs.subsquid.io/hydra-indexer-gateway). 