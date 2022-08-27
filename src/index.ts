require("dotenv").config();
import express from "express";

import { verify } from "./routes/verify";
import { messagePosted } from "./routes/messagePosted";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const type = req.body.type;

  switch (type) {
    case "url_verification":
      return verify(req, res);
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
