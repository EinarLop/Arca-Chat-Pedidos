const { query } = require("express");
var express = require("express");
var router = express.Router();

const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "usrteam1", // update me
      password: "XW9ZEzoa", // update me
    },
    type: "default",
  },
  server: "sqlserverdac.database.windows.net", // update me
  options: {
    database: "databaseac", //update me
    encrypt: true,
  },
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through

// let query2 = `create table Messages(
//   phone_number_id varchar(10),
//   phone_from varchar(10),
//   body varchar(255),
//   id varchar(255),
//   message_time timestamp,
//   display_phone_number varchar(10),
// ) `;

/* GET home page. */

module.exports = router;

const addMessage = (message) => {
  let {
    phone_number_id,
    phone_from,
    body,
    id,
    message_time,
    display_phone_number,
  } = message;
  message_time = new Date().toISOString().slice(0, 19).replace("T", " ");
  let query = `insert into [dbo].[Messages] (phone_number_id, phone_from, body, id, display_phone_number) values('${phone_number_id}', '${phone_from}','${body}','${id}', '${display_phone_number}')`;

  console.log(query);
  const request = new Request("", (err, rowCount) => {
    if (err) {
      console.error("error:", err.message);
    } else {
      console.log(`${rowCount} row(s) returned`);
    }
  });

  request.on("row", (columns) => {
    columns.forEach((column) => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });
  connection.execSql(request);
};

const getAllMessages = (message) => {
  const request = new Request("select * from Messages", (err, rowCount) => {
    if (err) {
      console.error("error:", err.message);
    } else {
      console.log(`${rowCount} row(s) returned`);
    }
  });

  request.on("row", (columns) => {
    columns.forEach((column) => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });
  connection.execSql(request);
};

router.post("/", function (req, res, next) {
  connection.on("connect", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      addMessage(req.body);
      // connection.close();
    }
  });
  connection.connect();
  connection.close();
});

router.get("/messages", function (req, res, next) {
  connection.on("connect", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      getAllMessages();
      // connection.close();
    }
  });
  connection.connect();
  connection.close();
  res.json("Helxx");
});
