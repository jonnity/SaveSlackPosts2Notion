require("dotenv").config();
import express from "express";

const port = 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  const token = req.body.token;
  const challenge = req.body.challenge;
  const type = req.body.type;
  if (
    token === process.env.SLACK_VERIFICATION_TOKEN &&
    type === "url_verification"
  ) {
    res.status(200).json({ challenge });
  } else {
    res.status(400).end();
  }
});

app.listen(port);

export default app;
