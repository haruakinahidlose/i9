import sqlite3 from "sqlite3";
import { readFileSync } from "fs";

const db = new sqlite3.Database("./database.db");

const schema = readFileSync("./schema.sql", "utf8");
db.exec(schema);

export default {
  run(query, params = []) {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
