import mysql from 'mysql2';
import { env } from '../config/env.js';

class DatabaseUtility {
  private queryFormat: any;

  constructor() {
    this.queryFormat = (query: string, values: Array<string>) => {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, (txt, key) => {
        return values.hasOwnProperty(key) ? mysql.escape(values[key]) : txt;
      });
    };
  }

  private connect(callback: (dbc: mysql.Connection) => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const dbc = mysql.createConnection({
        host: env.RDB_HOST,
        user: env.RDB_USER,
        password: env.RDB_PASSWORD,
        database: env.RDB_NAME,
      });
      dbc.connect((error) => {
        if (error) {
          reject(error);
        } else {
          dbc.config.queryFormat = this.queryFormat;
          callback(dbc)
            .then((result) => resolve(result))
            .catch((error) => reject(error))
            .finally(() => dbc.end());
        }
      });
    });
  }

  private sendQuery(dbc: mysql.Connection, query: string, option?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      dbc.query(query, option, (error, results) => {
        if (error) {
          reject(new Error(`SQL error: ${query} - ${error.message}`));
        } else {
          resolve(results);
        }
      });
    });
  }

  query<T = any>(query: string, option?: any): Promise<T[]> {
    return this.connect((dbc: mysql.Connection) => this.sendQuery(dbc, query, option));
  }

  /**
   * トランザクションを実行する
   * @param queries 実行するクエリの配列
   * @returns クエリの実行結果の配列
   */
  async transaction<T = any>(queries: Array<{ query: string; option?: any }>): Promise<T[]> {
    return this.connect(async (dbc: mysql.Connection) => {
      try {
        // 開始
        await this.sendQuery(dbc, 'BEGIN');
        const results = [];

        // 順次クエリを実行
        for (const { query, option } of queries) {
          const result = await this.sendQuery(dbc, query, option);
          results.push(result);
        }

        // コミット
        await this.sendQuery(dbc, 'COMMIT');
        return results;
      } catch (error) {
        // 失敗したらロールバック
        await this.sendQuery(dbc, 'ROLLBACK');
        throw error;
      }
    });
  }
}

const db = new DatabaseUtility();

export default db;
