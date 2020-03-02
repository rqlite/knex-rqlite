
# [knex-rqlite](https://github.com/rqlite/knex-rqlite)


<a href="https://opensource.org/licenses/MIT"><img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.0.svg?sanitize=true" alt="license"></a> <a href="https://www.npmjs.com/package/knex-rqlite"><img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.1.svg?sanitize=true" alt="npm"></a> <img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.2.svg?sanitize=true" alt="Tests"> <img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.3.svg?sanitize=true" alt="coverage"> <a href="https://prettier.io/"><img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.4.svg?sanitize=true" alt="code style"></a> <img src="https://raw.github.com/rqlite/knex-rqlite/master/static/readme/gen-badges/badge.5.svg?sanitize=true" alt="PRs"> 

Rqlite dialect for knex

-------

## Usage

First install knex and knex-rqlite: `npm install knex rqlite-js knex-rqlite`

Then to use the driver like this:

```js
import Knex from "knex";
import { RqliteDialect, typeConfig } from "knex-rqlite";

const knex = Knex({
  client: RqliteDialect,
  connection: typeConfig({
    host: "localhost",
    port: 4001
  })
});
``` 

## Known problems

- This knex dialect **doesn't support transactions** yet
- Look into TODO.md to find a list of coming features

## E2E tests

The tests can be run with `./scripts/test.js`

**This requires a running rqlite server on port 4001 and will drop&change the table rqliteDialect-e2e**

## Building

`./scripts/build`
