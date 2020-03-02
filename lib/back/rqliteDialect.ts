import { Client } from "knex";
import Knex, { Client as Client_ } from "knex/types/index";
import { DataApiClient } from "rqlite-js";
import { Config } from "./types";

const QueryCompiler = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/query/compiler"
);
const SchemaCompiler = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/schema/compiler"
);
const ColumnCompiler = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/schema/columncompiler"
);
const TableCompiler = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/schema/tablecompiler"
);
const SQLite3_DDL = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/schema/ddl"
);
const SQLite3_Formatter = __non_webpack_require__(
  "knex/lib/dialects/sqlite3/formatter"
);

const EXECUTE_METHODS = ["insert", "update", "counter", "del"];

const getRqliteQueryResults = function(response) {
  // Empty rqlite results are structured as [{}], we have to override this to []
  if (response.results.length === 1) {
    if (JSON.stringify(response.get(0).data) === "{}") {
      return [];
    }
  }

  return response.toArray();
};

export class RqliteDialect extends Client implements Client_ {
  dialect = "rqlite";
  driverName = "rqlite";

  connectionSettings: Config;

  constructor(config) {
    super(config);

    this.driver = this._driver();

    const connectionConfig: Partial<Config> = config.connection || {};

    this.connectionSettings = {
      host: "localhost",
      port: 4001,
      ssl: false,
      ...connectionConfig
    };
  }

  destroyRawConnection(connection: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  validateConnection(connection: any): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  formatter() {
    return new SQLite3_Formatter(this, ...arguments);
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

  transaction(
    container: any,
    config: any,
    outerTx: any
  ): Knex.Transaction<any, any> {
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
      max: 1
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
    let sql = (this as any)._formatQuery(obj.sql, obj.bindings);

    let useExecute = false;
    if (obj.method) {
      useExecute = EXECUTE_METHODS.indexOf(obj.method) > -1;
    }

    if (sql.indexOf("drop table ") === 0) {
      useExecute = true;
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
      response
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
        if (obj.method === "pluck") response = results.map(v => v[obj.pluck]);
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
