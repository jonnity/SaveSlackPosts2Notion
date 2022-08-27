require("dotenv").config();
import express from "express";

import { messagePosted } from "./routes/messagePosted";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const token = req.body.token;
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    console.error(`token: ${token}`);
    return res.status(400).end();
  }

  const type = req.body.type;
  switch (type) {
    case "url_verification":
      const challenge = req.body.challenge;
      if (token === process.env.SLACK_VERIFICATION_TOKEN) {
        return res.status(200).json({ challenge });
      } else {
        return res.status(400).end();
      }
    case "event_callback":
      return await messagePosted(req, res);
    default:
      console.error(`未対応のtype: ${type}`);
      return res.status(400).end();
  }
});

app.listen(port, () => {
  console.log(`start listening at ${port}`);
});

export default app;
