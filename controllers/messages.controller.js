const messagesRoute = require("express").Router();
const messagesModel = require("./../models/messages.model");

messagesRoute.post("/add", async (req, res) => {
  let {
    phone_number_id,
    phone_from,
    body,
    id,
    message_time,
    display_phone_number,
  } = req.body;
  message_time = new Date().toISOString().slice(0, 19).replace("T", " ");

  messagesModel
    .addMessage({
      phone_number_id,
      phone_from,
      body,
      id,
      message_time,
      display_phone_number,
    })
    .then((rowCount, more) => {
      res.status(200).json({
        data: {
          rowCount,
          more,
          phone_number_id,
        },
      });
    })
    .catch((error) => {
      console.log("errrrrror", error);
      res.status(500).json({ error });
    });
});

messagesRoute.get("/read", async (req, res) => {
  messagesModel
    .allMessages()
    .then((data) => {
      console.log(data);
      res.status(200).json({ data });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

module.exports = messagesRoute;
