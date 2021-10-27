const fs = require("fs");
const definitions = require("@interlay/interbtc-types").default
fs.writeFileSync('./indexer/types.json', JSON.stringify(definitions.types[0].types, null, 4));
