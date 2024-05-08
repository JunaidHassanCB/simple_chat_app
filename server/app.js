const express = require("express");
const app = express();
const port = 3001;

let messages = [];

app.get("/webhook/messages", (req, res) => {
  res.status(200).json(messages);
});

// should also try post
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
