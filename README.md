# Tools for helping L5R development process

The project is set to work with [Bun](https://bun.sh/), but it should be easy to run it in Node if you prefer, you're just gonna need to compile typescript before calling the scripts. If you use Bun, there is no need to compile the typescript.

This toolset is written in Typescript, it requires and Environment variable `EMERALD_DB` pointing to the instand of Emerald DB that is being used. You can have on a `.env` file in the project root. Bun will load it automatically.

## Data Generator for Afinity Editor

```sh
# Call it like this
bun src/image-json-generator.ts <PACK ID> <PACK ABBREVIATION> > <FILENAME FOR OUTPUT>

# Example
bun src/image-json-generator.ts restoration-of-balance RoB > restoration-of-balance-2023-01-29-2.json
```

## Update version data for cards

Edit `src/update-card-cycle.ts`: you need to add your Bearer token on the top of the file. Do not commit your changes, you don't want to leak your token online. Then:

```sh
bun src/update-card-cycle.ts
```
