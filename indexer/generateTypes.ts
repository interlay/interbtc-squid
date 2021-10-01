import { writeFileSync } from 'fs';
import definitions from "@interlay/interbtc-types";
writeFileSync('./indexer/types.json', JSON.stringify(definitions.types[0].types, null, 4));
