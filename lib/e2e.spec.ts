import { assert } from "chai";
import Knex_ from "knex/types/index";
import Knex from "knex";
import { RqliteDialect } from "./rqliteDialect";
import { typeConfig } from "./config";

const TABLE_NAME = "rqliteDialect-e2e";

describe("rqliteDialect", function() {
  let knex: Knex_;

  beforeAll(async function() {
    knex = Knex({
      client: RqliteDialect,
      connection: typeConfig({
        host: "localhost",
        port: 4001
      })
    });
  });

  describe("dropTable", function() {
    it("should drop table if it already exists", async function() {
      if (await knex.schema.hasTable(TABLE_NAME)) {
        await knex.schema.dropTable(TABLE_NAME);
      }

      assert.equal(await knex.schema.hasTable(TABLE_NAME), false);
    });
  });

  describe("createTable", function() {
    it("should create a new tablet", async function() {
      await knex.schema.createTable(TABLE_NAME, function(table) {
        table.increments("id");
        table.string("name");
      });

      assert.equal(await knex.schema.hasTable(TABLE_NAME), true);
    });
  });

  describe("knex(table)", function() {
    it("should return an empty array", async function() {
      const result = await knex(TABLE_NAME);
      assert.equal(result.length, 0);
      assert.typeOf(result, "array");
    });
  });

  describe("insert", function() {
    it("should return the last inserted id", async function() {
      const result = await knex(TABLE_NAME).insert([
        { name: "John Knex" },
        { name: "Steven Flex" },
        { name: "John Knex Junior" }
      ]);
      assert.equal(result[0], 3);
    });
  });

  describe("update", function() {
    it("should return the changed records count", async function() {
      const result = await knex(TABLE_NAME)
        .update({ name: "Knex Family" })
        .whereRaw("name like ?", ["%Knex%"]);
      assert.equal(result, 2);
    });

    it("should have changed the table", async function() {
      const result = await knex(TABLE_NAME);
      assert.deepEqual(result, [
        { id: 1, name: "Knex Family" },
        { id: 2, name: "Steven Flex" },
        { id: 3, name: "Knex Family" }
      ]);
    });
  });
});
