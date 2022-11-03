const execQuery = require("./../helpers/execQuery");
const TYPES = require("tedious").TYPES;

const addMessage = (messageData) => {
  console.log("inside addMessage");
  let {
    phone_number_id,
    phone_from,
    body,
    id,
    message_time,
    display_phone_number,
  } = messageData;
  const query = `
        INSERT INTO [dbo].[Messages01] (phone_number_id, phone_from, body, id, display_phone_number) VALUES (@phone_number_id,@phone_from,@body,@id,@display_phone_number)
        `;

  const parameters = [
    { name: "phone_number_id", type: TYPES.VarChar, value: phone_number_id },
    { name: "phone_from", type: TYPES.VarChar, value: phone_from },
    { name: "body", type: TYPES.VarChar, value: body },
    { name: "id", type: TYPES.VarChar, value: id },
    { name: "message_time", type: TYPES.DateTime, value: message_time },
    {
      name: "display_phone_number",
      type: TYPES.VarChar,
      value: display_phone_number,
    },
  ];
  console.log("end of addMessage");
  return execQuery.execWriteCommand(query, parameters);
};

const allMessages = () => {
  const query = `
        SELECT * FROM [dbo].[Messages01]
    `;
  return execQuery.execReadCommand(query);
};

module.exports = {
  addMessage,
  allMessages,
};
