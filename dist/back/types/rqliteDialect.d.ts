import { Client } from "knex";
import Knex, { Client as Client_ } from "knex/types/index";
import { DataApiClient } from "rqlite-js";
export declare class RqliteDialect extends Client implements Client_ {
    dialect: string;
    driverName: string;
    connectionSettings: {
        host: string | undefined;
        port: number | undefined;
        ssl: boolean | undefined;
    };
    constructor(config: any);
    destroyRawConnection(connection: any): Promise<void>;
    validateConnection(connection: any): Promise<boolean>;
    formatter(): any;
    schemaCompiler(): any;
    queryCompiler(): any;
    columnCompiler(): any;
    tableCompiler(): any;
    ddl(compiler: any, pragma: any, connection: any): any;
    transaction(container: any, config: any, outerTx: any): Knex.Transaction<any, any>;
    stream(connection: any, obj: any, stream: any, options: any): void;
    destroy(callback: any): void;
    database(): void;
    releaseConnection(connection: any): void;
    poolDefaults(): {
        min: number;
        max: number;
        propagateCreateError: boolean;
    };
    connection: DataApiClient;
    acquireConnection(): Promise<any>;
    acquireRawConnection(): Promise<any>;
    _query(connection: any, obj: any): Promise<any>;
    processResponse(obj: any, runner: any): any;
    _driver(): any;
}
//# sourceMappingURL=rqliteDialect.d.ts.map