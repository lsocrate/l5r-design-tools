# Tools for helping L5R development process

This toolset is written in Typescript, it requires and Environment variable `EMERALD_DB` pointing to the instand of Emerald DB that is being used.

The project is set to work with [Bun](https://bun.sh/), but it should be easy to run it in Node if you prefer, you're just gonna need to compile typescript before calling the scripts.

## Data Generator for Afinity Editor

```sh
# Call it like this
bun src/image-json-generator.ts <PACK ID> <PACK ABBREVIATION> > <FILENAME FOR OUTPUT>

# Example
bun src/image-json-generator.ts restoration-of-balance RoB > restoration-of-balance-2023-01-29-2.json
```
