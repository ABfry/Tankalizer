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
   * 既存の接続を使ってクエリを実行する（トランザクション用）
   * @param dbc トランザクションで使っている接続オブジェクト
   * @param query 実行するクエリ
   * @param option クエリのオプション
   */
  queryOnConnection<T = any>(dbc: mysql.Connection, query: string, option?: any): Promise<T[]> {
    return this.sendQuery(dbc, query, option);
  }

  /**
   * トランザクションを実行する
   * @param callback トランザクション内で実行したい処理を記述した関数
   * @returns コールバック関数の実行結果
   */
  async transaction<T>(callback: (dbc: mysql.Connection) => Promise<T>): Promise<T> {
    return this.connect(async (dbc: mysql.Connection) => {
      try {
        // 開始
        await this.sendQuery(dbc, 'BEGIN');

        // 引数で受け取ったコールバック関数を実行
        const result = await callback(dbc);

        // コミット
        await this.sendQuery(dbc, 'COMMIT');
        return result;
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
