require("dotenv").config();
import { Request, Response } from "express";
import { Client } from "@notionhq/client";

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

  try {
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
      notionVersion: "2022-06-28",
    });
    await notion.pages.create({
      parent: {
        database_id: databaseIds[channelName],
      },
      properties: {
        content: {
          name: "content",
          title: [
            {
              text: {
                content: postedText,
              },
            },
          ],
        },
        addedBy: userName,
      },
    });
    return res.status(201).end();
  } catch (error: any) {
    console.error(JSON.stringify(error));
    return res.status(500).end();
  }
};
