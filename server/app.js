const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const Utils = require("./utils/utils.js");
require("dotenv").config();

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
const messages = {};

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

// This returns a database of messages
app.get("/messages", (req, res) => {
  res.status(200).json(messages);
});

// Initiate conversation with a template message
app.post("/init-conv", async (req, res) => {
  // axios request to template
  const { to, templateName, headerValues, bodyValues } = req.body;

  const response = await axios({
    method: "post",
    url: "https://graph.facebook.com/v19.0/288356561034103/messages",
    data: {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "header",
            parameters: [
              ...headerValues.map((value) => {
                return {
                  type: "text",
                  text: value,
                };
              }),
            ],
          },
          {
            type: "body",
            parameters: [
              ...bodyValues.map((value) => {
                return {
                  type: "text",
                  text: value,
                };
              }),
            ],
          },
        ],
      },
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
  });

  const responseData = response?.data;

  if (!responseData?.messages) {
    res.send(400).json({ error: "Message not sent" });
    return;
  }

  // might be embeded in token
  const sender_id = "15556116462";
  const receiver_id = responseData?.contacts[0]?.wa_id;
  const message_text = Utils.getTemplate(
    templateName,
    headerValues,
    bodyValues
  );
  const message_id = responseData?.messages[0]?.id;
  const message_timestamp = Math.floor(Date.now() / 1000);
  const message_type = "text";

  const message_obj = {
    sender_id,
    receiver_id,
    message_text,
    message_id,
    message_timestamp,
    message_type,
  };

  const convId = Utils.getConvId(sender_id, receiver_id);

  messages[convId]
    ? messages[convId].push(message_obj)
    : (messages[convId] = [message_obj]);

  res.status(200).json(message_obj);
});

// Send a message when the conversation session has been initiated
app.post("/message", async (req, res) => {
  // axios request to text message
  const { to, text } = req.body;

  const response = await axios({
    method: "post",
    url: "https://graph.facebook.com/v19.0/288356561034103/messages",
    data: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      // "to": "923017176099",
      to: to,
      type: "text",
      text: {
        body: text,
      },
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
  });

  const responseData = response?.data;

  if (!responseData?.messages) {
    res.send(400).json({ error: "Message not sent" });
    return;
  }

  // might be embeded in token
  const sender_id = "15556116462";
  const receiver_id = responseData?.contacts[0]?.wa_id;
  const message_text = text;
  const message_id = responseData?.messages[0]?.id;
  const message_timestamp = Math.floor(Date.now() / 1000);
  const message_type = "text";

  const message_obj = {
    sender_id,
    receiver_id,
    message_text,
    message_id,
    message_timestamp,
    message_type,
  };

  const convId = Utils.getConvId(sender_id, receiver_id);

  messages[convId]
    ? messages[convId].push(message_obj)
    : (messages[convId] = [message_obj]);

  res.status(200).json(message_obj);
});

// This runs when an event happens like user sends message
app.post("/webhook", customParser, (req, res) => {
  console.log(`post => /webhook`);

  const body = req?.body;

  if (body && body.object === "whatsapp_business_account") {
    const receiver_id =
      body?.entry[0]?.changes[0]?.value?.metadata?.display_phone_number;
    const sender_id = body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id;

    const message_array = body?.entry[0]?.changes[0]?.value?.messages;

    // This checks if the message_array is not empty which can mean the user is sending messages
    if (message_array) {
      const message = message_array[0];

      const message_text = message?.text?.body;
      const message_id = message?.id;
      const message_timestamp = message?.timestamp;
      const message_type = message?.type;

      const message_obj = {
        sender_id,
        receiver_id,
        message_text,
        message_id,
        message_timestamp,
        message_type,
      };

      const convId = Utils.getConvId(sender_id, receiver_id);

      const doesMessageExist = messages[convId].some(
        (obj) => obj.message_id === message_obj.message_id
      );

      if (!doesMessageExist) {
        messages[convId]
          ? messages[convId].push(message_obj)
          : (messages[convId] = [message_obj]);
      }

      res.status(200);
    }
  }

  res.status(400);
});

// This only works once, when we are initializing the server
app.get("/webhook", (req, res) => {
  console.log("get => /webhook/listener");

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");

      // we must send this response otherwise the request will not be validated
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

const port = process.env.PORT || 3001;

// start the node server with "node app.js"
// start the ngrok server with "ngrok http --domain=united-goblin-helping.ngrok-free.app 3001"
app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);

  // const ngrok = require("ngrok");

  // ngrok
  //   .connect(port)
  //   .then((ngrokUrl) => {
  //     console.log(`connected at port ${port} with ngrokUrl ${ngrokUrl}`);
  //   })
  //   .catch((error) => {
  //     console.log(`could not connect to the tunnel ${error}`);
  //   });
});
