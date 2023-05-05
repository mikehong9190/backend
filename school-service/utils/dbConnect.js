import mysql from "mysql";

export const pool = mysql.createPool({
  connectionLimit: 2,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const dbExecuteQuery = (query, params = null) => {
  return new Promise((resolve, reject) => {
    pool.query(
      {
        sql: query,
        values: params,
      },
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};
