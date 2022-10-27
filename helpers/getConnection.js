const Connection = require("tedious").Connection;

const configConnection = {
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

const getConnection = () => {
  console.log("Inside getConnetion");
  const connect = () =>
    new Promise((resolve, reject) => {
      const connectionInstance = new Connection(configConnection);
      connectionInstance.on("connect", (error) => {
        if (!error) {
          console.log("No error on GET CONNECTION");
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
