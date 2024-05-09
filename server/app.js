const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var customParser = bodyParser.json({
  type: function (req) {
    if (req.headers["content-type"] === "") {
      return (req.headers["content-type"] = "application/json");
    } else if (typeof req.headers["content-type"] === "undefined") {
      return (req.headers["content-type"] = "application/json");
    } else {
      return (req.headers["content-type"] = "application/json");
    }
  },
});

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
  })
); // support encoded bodies

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
); // support encoded bodies

// global variables
let messages = [];

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

app.get("/messages", (req, res) => {
  res.status(200).json(messages);
});

// This runs when an event happens like user sends message
app.post("/webhook", customParser, (req, res) => {
  console.log(`post => /webhook`);

  const body = req.body;
  messages.push(body);

  res.status(200);
});

// This only works once, when we are initializing the server
app.get("/webhook", (req, res) => {
  console.log("get => /webhook/listener");

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token) {
      console.log("WEBHOOK_VERIFIED");

      // we must send this response otherwise the request will not be validated
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);

  const ngrok = require("ngrok");

  ngrok
    .connect(port)
    .then((ngrokUrl) => {
      console.log(`connected at port ${port} with ngrokUrl ${ngrokUrl}`);
    })
    .catch((error) => {
      console.log(`could not connect to the tunnel ${error}`);
    });
});
