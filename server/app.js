const express = require("express");
const app = express();
const port = 3001;

let messages = [];

app.get("/webhook/messages", (req, res) => {
  console.log(`messages: ${Json.stringify(messages)}`);

  res.status(200).json(messages);
});

// should also try post and get
app.post("/webhook/listener", (req, res) => {
  // explaination
  // https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup/
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token) {
      console.log("WEBHOOK_VERIFIED");

      // res.status(200).send(challenge);
      console.log(`body: ${Json.stringify(req.body)}`);

      messages.push(req.body);
      res.status(200).send("Done");
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
