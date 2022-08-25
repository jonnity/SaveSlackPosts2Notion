require("dotenv").config();
import { Request, Response } from "express";

export const verify = (req: Request, res: Response) => {
  const token = req.body.token;
  const challenge = req.body.challenge;
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(200).json({ challenge });
  } else {
    res.status(400).end();
  }
};
