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
  console.log(JSON.stringify(event));
  const postedUserId = event.user as UserId;
  const userName = users[postedUserId];
  if (!userName) {
    return res.status(400).end();
  }

  const postedChannelId = event.channel as ChannelId;
  const channelName = channels[postedChannelId];

  const attachments = event.attachments[0];
  const title = (attachments ? attachments.title : event.text) || "no title"; // リンク等の添付があればそのタイトルをtitleに、なければtextをそのままtitleに
  const desctiption = attachments?.text; // descriptionは空欄も可
  const url = attachments?.original_url; // urlも空欄可
  // commentはurlでないblockをつなげて作成
  const comment = event?.blocks[0]?.elements
    ?.map((element: any) => {
      return element.type === "url" ? undefined : element.text;
    })
    .join("");
  const thumbnailUrl = attachments?.image_url;

  try {
    await axios.post(
      "https://api.notion.com/v1/pages",
      JSON.stringify({
        parent: {
          database_id: databaseIds[channelName],
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: desctiption,
                },
              },
            ],
          },
          Link: {
            type: "url",
            url,
          },
          Comment: {
            rich_text: [
              {
                text: {
                  content: comment,
                },
              },
            ],
          },
          Posted: {
            multi_select: [
              {
                name: userName,
              },
            ],
          },
          Thumb: thumbnailUrl
            ? {
                files: [
                  {
                    type: "external",
                    name: title,
                    external: {
                      url: thumbnailUrl,
                    },
                  },
                ],
              }
            : undefined,
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );
    return res.status(201).end();
  } catch (error: any) {
    console.error(JSON.stringify(error));
    return res.status(500).end();
  }
};
