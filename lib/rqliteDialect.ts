import { knex, Knex } from "knex";
import { DataApiClient } from "rqlite-js";
import { Config } from "./types";

const Client_SQLite3 = require("knex/lib/dialects/sqlite3");
const QueryCompiler = require("knex/lib/dialects/sqlite3/query/sqlite-querycompiler");
const SchemaCompiler = require("knex/lib/dialects/sqlite3/schema/sqlite-compiler");
const ColumnCompiler = require("knex/lib/dialects/sqlite3/schema/sqlite-columncompiler");
const TableCompiler = require("knex/lib/dialects/sqlite3/schema/sqlite-tablecompiler");
const SQLite3_DDL = require("knex/lib/dialects/sqlite3/schema/ddl");
const Formatter = require("knex/lib/formatter");
const {
  formatQuery,
} = require("knex/lib/execution/internal/query-executioner");

const getRqliteQueryResults = function (response) {
  // Empty rqlite results are structured as [{}], we have to override this to []
  if (response.results.length === 1) {
    if (JSON.stringify(response.get(0).data) === "{}") {
      return [];
    }
  }

  return response.toArray();
};

class RqliteDialect extends knex.Client {
  dialect = "rqlite";
  driverName = "rqlite";
  driver = null;

  declare connectionSettings: Config;

  constructor(config) {
    super(config);

    this.driver = this._driver();

    const connectionConfig: Partial<Config> = config.connection || {};

    this.connectionSettings = {
      host: "localhost",
      port: 4001,
      ssl: false,
      ...connectionConfig,
    };
  }

  destroyRawConnection(connection: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  validateConnection(connection: any): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  formatter() {
    return new Formatter(this, ...arguments);
  }

  schemaCompiler() {
    return new SchemaCompiler(this, ...arguments);
  }

  queryCompiler() {
    return new QueryCompiler(this, ...arguments);
  }

  columnCompiler() {
    return new ColumnCompiler(this, ...arguments);
  }

  tableCompiler() {
    return new TableCompiler(this, ...arguments);
  }

  ddl(compiler, pragma, connection) {
    return new SQLite3_DDL(this, compiler, pragma, connection);
  }

  transaction(container: any, config: any, outerTx: any): Knex.Transaction {
    throw new Error("Method not implemented.");
  }

  stream(connection: any, obj: any, stream: any, options: any) {
    throw new Error("Method not implemented.");
  }

  destroy(callback: any) {
    throw new Error("Method not implemented.");
  }

  database() {
    throw new Error("Method not implemented.");
  }

  releaseConnection(connection) {}

  poolDefaults() {
    const parentDefaults = super.poolDefaults();
    const defaults = {
      ...parentDefaults,
      min: 1,
      max: 1,
    };

    return defaults;
  }

  connection: DataApiClient;

  async acquireConnection() {
    if (!this.connection) {
      this.connection = await this.acquireRawConnection();
    }

    return this.connection;
  }

  async acquireRawConnection() {
    const config = this.connectionSettings;

    const urlProto = config.ssl ? "https" : "http";
    const url = `${urlProto}://${config.host}:${config.port}`;

    const connection = new this.driver(url);

    return connection;
  }

  async _query(connection, obj) {
    let sql = formatQuery(obj.sql, obj.bindings, undefined, this);

    let useExecute = true;

    if (/^(select|pragma)\s+/i.test(sql)) {
      useExecute = false;
    }

    let response;
    if (useExecute) {
      response = await connection.execute(sql);
    } else {
      response = await connection.query(sql);
    }

    if (!response) {
      throw new Error("Query resulted in empty response");
    }

    if (response.hasError()) {
      throw new Error(
        `Query resulted in an error: '${response.getFirstError().message}'`
      );
    }

    return {
      ...obj,
      response,
    };
  }

  processResponse(obj, runner) {
    let { response } = obj;

    if (obj.output)
      return obj.output.call(runner, getRqliteQueryResults(response));
    switch (obj.method) {
      case "select":
      case "pluck":
      case "first":
        const results = getRqliteQueryResults(response);
        if (obj.method === "pluck") response = results.map((v) => v[obj.pluck]);
        return obj.method === "first" ? results[0] : results;
      case "insert":
        return [obj.response.get(0).getLastInsertId()];
      case "del":
      case "update":
      case "counter":
        return obj.response.get(0).getRowsAffected();
      default:
        return getRqliteQueryResults(response);
    }
  }

  _driver() {
    return DataApiClient;
  }
}

Object.assign(RqliteDialect.prototype, {
  wrapIdentifierImpl: Client_SQLite3.prototype.wrapIdentifierImpl,
});

export { RqliteDialect };
