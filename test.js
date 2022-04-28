//const path = require("path");


// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./dbs/icons.db");
const sql = require("./src/sql.json");

/*
db.serialize(() => {
  db.get("select * from posted", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log("######");
        console.log(`${row.name} : ${row.posttime}`);
    });
})
*/

  db.serialize(() => {
//    console.log(sql.geticon);
    var pre = db.prepare(sql.geticon);
    pre.bind(["111"]);
//    db.get(sql.geticon, (err, rows) => {
//        console.log(JSON.stringify(rows));
//    });
  })
