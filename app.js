//import {buildButtonsMessagePayload, buildTextMessage} from './conversacion.js'
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const CustomerSession = new Map();
CustomerSession.set("state", 0)

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

const messagesController = require("./controllers/messages.controller");
var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/messages", messagesController);

function isTextMessage(body_param){
  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages[0] &&
    body_param.entry[0].changes[0].value.messages[0].type == "text"
  ) {
    console.log("si es mensaje de texto")
    return true;
  }
  console.log("no es mensaje de texto")
  return false;
}

function isReplyMessage(body_param){
  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages[0] &&
    body_param.entry[0].changes[0].value.messages[0].type == "interactive" && 
    body_param.entry[0].changes[0].value.messages[0].interactive.type == "button_reply"
  ) {
    return true;
  }
  return false;
}

function buildTextMessage(phone_number, body){
  return { 
    "messaging_product": "whatsapp", 
    "to": phone_number, 
    "type": "text",
    "text": {
      "body": body
    }
  };
}

function buildButtonsMessagePayload(header, body, buttonTexts, phone_number){
  // this should return the json we send to the user
  console.log("entro a la funcion")
  let i = 0;
  let len = buttonTexts.length;
  let buttons = []
  for (; i < len; ) {
      var button = {
          "type": "reply",
          "reply": {
              "id": i,
              "title": buttonTexts[i]
          }
      }
      buttons.push(button)
      i++;
  }
  interactive = {
    "type": "button",
      "header": {
        "type": "text",
          "text": header
      },
      "body": {
          "text": body
      },
      "action":{
          "buttons": buttons
      }
  };
  
  
  return { 
    "messaging_product": "whatsapp", 
    "to": phone_number, 
    "type": "interactive",
    "interactive": interactive
  };
}

app.get("/", (req, res) => {
  console.log(mytoken)
  res.send("Hello World!");
});

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



function getAxiosConfig(phone_no_id, data){
  return {
    method: 'post',
    url: 'https://graph.facebook.com/v13.0/' + phone_no_id + '/messages',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + token
    },
    data : data
  };
}

function sendMessage(phone_no_id, payload){
  var config = getAxiosConfig(phone_no_id, payload)
    
  axios(config).then(function ({data}) {
    console.log('Success ' + JSON.stringify(data))
  })
  .catch(function (error) {
    console.log('Error ' + error.message)
  })
}

app.post("/meta_wa_callbackurl", (req, res) => {
  console.log("webhook hola")
  console.log("se actualiza")
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (isTextMessage(body_param)) {
    console.log("es mensaje de texto")
    console.log(CustomerSession.get("state"))
    let phone_no_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
    console.log(req.body.entry[0].changes[0].value.messages[0].from)
    let from = req.body.entry[0].changes[0].value.messages[0].from;
    let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
    let from_correct_lada = "52" + from.substring(3);
    var payload = ""

    if (msg_body == "terminar sesion"){
      console.log("terminamos la sesion")
      CustomerSession.set("state", 0)
      payload = buildTextMessage(from_correct_lada, "Gracias por comprar con nosotros, hasta la próxima!");
      sendMessage(phone_no_id, payload);
    } else if (CustomerSession.get("state") == 0){
      console.log("estamos en estado 1")
      CustomerSession.set("state", 1)
      payload = buildButtonsMessagePayload("Hola! Soy Arcabot", "¿Quieres ver el catálogo de productos?", ["Ver catálogo", "Cancelar"], from_correct_lada);
      console.log(payload)
      sendMessage(phone_no_id, payload);
    }

    res.sendStatus(200);
  } else if (isReplyMessage(body_param)){

    let phone_no_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
    console.log(req.body.entry[0].changes[0].value.messages[0].from)
    let from = req.body.entry[0].changes[0].value.messages[0].from;
    let msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.title;
    let from_correct_lada = "52" + from.substring(3);
    var payload = ""
    var msg = ""
    if (CustomerSession.get("state") == 1) {
      if (msg_body == "Ver catálogo"){
        CustomerSession.set("state", 2)
        msg = "Llevandote al catálogo."
        payload = buildTextMessage(from_correct_lada, msg)
        sendMessage(phone_no_id, payload);
        msg = "Listo! Resumen del pedido: \n- 1 paq. Coca - Cola 600ml PET 12pzas $245"
        payload = buildTextMessage(from_correct_lada, msg)
        sendMessage(phone_no_id, payload);
        payload = buildButtonsMessagePayload("Confirma tu pedido", "¿Está todo correcto?", ["Enviar pedido", "Modificar pedido", "Cancelar"], from_correct_lada)
        console.log(payload)
        sendMessage(phone_no_id, payload);
      }
    } else if (CustomerSession.get("state") == 2) {
      if (msg_body == "Enviar pedido"){
        CustomerSession.set("state", 0);
        msg = "Pedido enviado!";
        payload = buildTextMessage(from_correct_lada, msg);
        sendMessage(phone_no_id, payload);
      }
    }
    res.sendStatus(200);
  }
  else {
    console.log("no jala")
    res.sendStatus(403);
  }
});

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

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
