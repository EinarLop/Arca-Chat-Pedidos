var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const axios = require("axios");
require("dotenv").config;

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

const messagesController = require("./controllers/messages.controller");
var app = express();

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use("/messages", messagesController);
let pop = process.env.EINAR || "NO ENV";
app.get("/", (req, res) => {
  res.send("Team One Conversation AI" + pop);
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.message &&
    body_param.entry[0].changes[0].value.message[0]
  ) {
    let phone_no_id =
      req.body.entry[0].changes[0].value.metadata.phone_number_id;
    let from = req.body.entry[0].changes[0].value.messages[0].from;
    let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;

    axios({
      method: "POST",
      url:
        "https://graph.facebook.com/v13.0/" +
        phone_no_id +
        "/messages?access_token=" +
        token,
      data: {
        messagin_product: "whatsapp",
        to: from,
        text: {
          body: "Hi, im Alex",
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.sendStatus(200);
  } else {
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
