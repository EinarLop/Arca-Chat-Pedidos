//import {buildButtonsMessagePayload, buildTextMessage} from './conversacion.js'
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const axios = require("axios");
require("dotenv").config({path: './.env'});
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');
const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.TOKEN,
    senderPhoneNumberId: process.env.SENDER_PHONE,
    WABA_ID: process.env.WABA_ID, 
    graphAPIVersion: 'v13.0'
});

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
//const mytoken = "miToken";

const messagesController = require("./controllers/messages.controller");

var app = express();

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/messages", messagesController);

app.get("/", (req, res) => {
  console.log(mytoken)
  res.send("Hello World!");
});

// app.listen(3000 || process.env.PORT, () => {
//   console.log("jala");
// });

app.get("/webhook", (req, res) => {
  const test = require('dotenv').config()
  console.log(test)
  console.log("llego a webhook")
  console.log(mytoken)
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challenge);
      console.log("algo salio bien")
    } else {
      console.log("algo salio mal")
      res.status(403);
    }
  }
});

app.get('/meta_wa_callbackurl', (req, res) => {
  try {
      console.log('GET: Someone is pinging me!');

      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];

      if (
          mode &&
          token &&
          mode === 'subscribe' &&
          mytoken === token
      ) {
          return res.status(200).send(challenge);
      } else {
          return res.sendStatus(403);
      }
  } catch (error) {
      console.error({error})
      return res.sendStatus(500);
  }
});
/*
app.post('/meta_wa_callbackurl', (req, res) => {
  console.log("si me llego el mensaje")
  let phone_no_id =
    req.body.entry[0].changes[0].value.metadata.phone_number_id;
  let from = req.body.entry[0].changes[0].value.messages[0].from;
  axios({
    method: "POST",
    url:
      "https://graph.facebook.com/v13.0/" +
      phone_no_id +
      "/messages?access_token=" +
      token,
    data: {
      messaging_product: "whatsapp",
      to: from,
      text: {
        body: "Respuesta",
      },
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}),
*/
app.post("/callback_url", (req, res) => {
  console.log("Si llego el mensaje");
});

async function sendMessage(phone_no_id, from){
  await Whatsapp.sendSimpleButtons({
    message: `Hey ${from}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
    recipientPhone: phone_no_id, 
    listOfButtons: [
        {
            title: 'View some products',
            id: 'see_categories',
        },
        {
            title: 'Speak to a human',
            id: 'speak_to_human',
        },
    ],
});
}

/*
data:{
          messaging_product: "whatsapp",
          "recipient_type": "individual",
          "to": phone_no_id,
          "type": "text",
          "text": {
              "body": "your-message-content"
          }
      },
*/
app.post("/meta_wa_callbackurl", (req, res) => {
  console.log("webhook hola")
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages[0]
  ) {
    console.log("si jala");

    let phone_no_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
    console.log(req.body.entry[0].changes[0].value.messages[0].from)
    let from = req.body.entry[0].changes[0].value.messages[0].from;
    let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
    console.log("phone id");
    console.log(phone_no_id);
    console.log("from");
    console.log(from);
    console.log(token);
    let otro_phone = "52" + from.substring(3);
    //sendMessage(phone_no_id, from);
    var data = '{ "messaging_product": "whatsapp", "to": ' + otro_phone + ', "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }'
    var config = {
      method: 'post',
      url: 'https://graph.facebook.com/v13.0/' + phone_no_id + '/messages',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + token
      },
      data : data
    };

    //data2 = buildButtonsMessagePayload("header", "mensaje", ["yes", "no"]);
    //console.log(data2)
    
    axios(config).then(function ({data}) {
      console.log('Success ' + JSON.stringify(data))
    })
    .catch(function (error) {
      console.log('Error ' + error.message)
    })
    res.sendStatus(200);
  } else {
    console.log("no jala")
    res.sendStatus(403);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
