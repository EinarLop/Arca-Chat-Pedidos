// create table Messages01(
// 	id varchar(255) NOT NULL PRIMARY KEY,
// 	phone_number_id varchar(255) NOT NULL,
//    phone_from varchar(255) NOT NULL,
//    body varchar(255) NOT NULL,
//    message_time datetime default(current_timestamp),
//    display_phone_number varchar(255) NOT NULL)

const Connection = require("tedious").Connection;

const dbPassword = process.env.DBPASSWORD | "";
const dbUsername = process.env.DBUSERNAME | "";
const dbServer = process.env.DBSERVER | "";

const configConnection = {
  authentication: {
    options: {
      userName: dbUsername, // update me
      password: dbPassword, // update me
    },
    type: "default",
  },
  server: "", // update me
  options: {
    database: "databaseac", //update me
    encrypt: true,
    rowCollectionOnDone: true,
  },
};

const getConnection = () => {
  const connect = () =>
    new Promise((resolve, reject) => {
      const connectionInstance = new Connection(configConnection);
      connectionInstance.on("connect", (error) => {
        if (!error) {
          resolve(connectionInstance);
        } else {
          console.log(error);
          reject(error);
        }
      });

      connectionInstance.connect();
    });

  return { connect };
};

module.exports = getConnection;
