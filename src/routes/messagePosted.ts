require("dotenv").config();
import { Request, Response } from "express";
import axios from "axios";

import { ChannelId, channels, databaseIds, UserId, users } from "../constants";

export const messagePosted = async (req: Request, res: Response) => {
  const token = req.body.token;
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    console.error(`token: ${token}`);
    return res.status(400).end();
  }

  const event = req.body.event;
  const postedText = event.text as string;
  const postedUserId = event.user as UserId;
  const userName = users[postedUserId];
  const postedChannelId = event.channel as ChannelId;
  const channelName = channels[postedChannelId];

  console.log(`user: ${userName}`);
  console.log(`text: ${postedText}`);
  try {
    await axios.post(
      "https://api.notion.com/v1/pages",
      {
        parent: {
          database_id: databaseIds[channelName],
        },
        properties: {
          content: {
            title: [
              {
                text: {
                  content: postedText,
                },
              },
            ],
          },
          addedBy: {
            multi_select: [
              {
                name: userName,
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );
    return res.status(201).end();
  } catch (error: any) {
    console.error(JSON.stringify(error));
    return res.status(500).end();
  }
};
