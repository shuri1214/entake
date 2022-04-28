//const path = require("path");


// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./dbs/icons.db");
const sql = require("./src/sql.json");

const crypto = require("crypto");
console.log(crypto.getHashes());

  db.serialize(() => {
//    console.log(sql.geticon);
    var pre = db.prepare(sql.geticon);
    pre.bind("20220428162406",function(){
      pre.get((err, rows) => {
          console.log(rows);
          console.log(JSON.stringify(rows));
      });
    });
  })
