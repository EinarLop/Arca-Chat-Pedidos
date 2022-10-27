const getConnection = require("./getConnection");
const Request = require("tedious").Request;

const execQuery = (query, parameters, callbackEvent) => {
  console.log("Inside execQuery");
  const command = new Promise((resolve, reject) => {
    getConnection()
      .connect()
      .then((instance) => {
        const request = new Request(query, (error) => {
          if (error) {
            console.log(error);
            reject(error);
          }
        });
        if (parameters) {
          parameters.forEach((parameter) => {
            request.addParameter(
              parameter.name,
              parameter.type,
              parameter.value
            );
          });
        }

        const close = () => instance.close();

        request.on("error", (error) => {
          close();
          console.log(error);
          reject(error);
        });

        callbackEvent(request, close, resolve);
        instance.execSql(request);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
  console.log("command", command);
  return command;
};

const execWriteCommand = (query, parameters) => {
  console.log("inside execWriteCommand ");
  const callbackEvent = (request, close, resolve) => {
    request.on("requestCompleted", (rowCount, more) => {
      close();
      resolve(rowCount, more);
    });
  };

  return execQuery(query, parameters, callbackEvent);
};

const execReadCommand = (query, parameters = null) => {
  const callbackEvent = (request, close, resolve) => {
    request.on("doneInProc", (rowCount, more, rows) => {
      const responseRows = [];

      if (rows)
        rows.forEach((row) => {
          const currentRow = {};
          if (row)
            row.forEach((column) => {
              currentRow[column.metadata.colName] = column.value;
            });
          responseRows.push(currentRow);
        });
      resolve(responseRows);
    });

    request.on("requestCompleted", () => close());
  };

  return execQuery(query, parameters, callbackEvent);
};

module.exports = {
  execWriteCommand,
  execReadCommand,
};
