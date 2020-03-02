export type Config = {
  /**
   * Hostname or ip of the rqlite instance, Default: localhost
   */
  host: string;
  /**
   * Port of the rqlite instance, Default: 4001
   */
  port: number;
  /**
   * Connect with https, Default: false
   */
  ssl: boolean;
};
