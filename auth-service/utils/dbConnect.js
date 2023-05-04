import mysql from 'mysql';

export const pool  = mysql.createPool({
  connectionLimit : 2,
  host     : process.env.DB_HOST,
  user     : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME
});

export const dbExecuteQuery = (query) => {
  return new Promise((resolve, reject)=>{
    pool.query(query,  (error, results)=>{
        if(error){
            return reject(error);
        }
        return resolve(results);
    });
});
}
