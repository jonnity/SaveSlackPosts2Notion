require("dotenv").config();
import { Request, Response } from "express";

export const messagePosted = (req: Request, res: Response) => {
  const token = req.body.token;
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    console.error(`token: ${token}`);
    return res.status(400).end();
  }

  const event = req.body.event;
  console.log(JSON.stringify(event));
  return res.status(200).end();
};
