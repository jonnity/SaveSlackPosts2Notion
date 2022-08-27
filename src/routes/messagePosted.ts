require("dotenv").config();
import { Request, Response } from "express";
import axios from "axios";

import { getMetaData } from "../getMetaData";
import { ChannelId, channels, databaseIds, UserId, users } from "../constants";

export const messagePosted = async (req: Request, res: Response) => {
  console.log(`headers: ${JSON.stringify(req.headers)}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  if (req.headers["X-Slack-Retry-Num"] || req.headers["x-slack-retry-num"]) {
    return res.end();
  }
  const event = req.body.event;
  console.log(JSON.stringify(event));
  // 単純なメッセージ送信でない場合（deleteなど）
  if (event.subtype) {
    return res.end();
  }
  try {
    const postedUserId = event.user as UserId;
    const userName = users[postedUserId];
    if (!userName) {
      return res.end();
    }

    const postedChannelId = event.channel as ChannelId;
    const channelName = channels[postedChannelId];
    const targetDB = databaseIds[channelName];

    const blockElements = event.blocks[0]?.elements;
    if (blockElements.length !== 1) {
      console.error("複数のBlockElementsが来ることは想定していない");
      return res.end();
    }
    if (blockElements[0].type !== "rich_text_section") {
      console.error(`未対応block type: ${blockElements[0].type}`);
      return res.end();
    }
    const richTextElements = blockElements[0].elements;
    const links = richTextElements.filter((element: any) => {
      return element.type === "link";
    });
    const texts = richTextElements.filter((element: any) => {
      return element.type === "text";
    });

    const url = links[0]?.url; // urlも空欄可
    const metadata = url ? await getMetaData(url) : undefined;

    // リンク等の添付があればそのタイトルをtitleに、なければtextをそのままtitleに
    let title = undefined;
    let description = undefined;
    let comment = undefined;
    let thumbnailUrl = undefined;
    if (links.length !== 0) {
      title = metadata?.title || "no title";
      description = metadata?.description || "no description"; // descriptionは空欄も可
      thumbnailUrl = metadata?.image || undefined;

      const postedText = texts
        .map((textElement: any) => {
          return textElement.text;
        })
        .join("")
        .trim();
      const otherLinks = links.slice(1).join(", ").trim();
      comment = otherLinks
        ? `${postedText}（その他リンク: ${otherLinks}）`
        : postedText;
    } else {
      title = event.text;
    }

    // commentはurlでないblockをつなげて作成

    await axios.post(
      "https://api.notion.com/v1/pages",
      JSON.stringify({
        parent: {
          database_id: targetDB,
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
          Description: description
            ? {
                rich_text: [
                  {
                    text: {
                      content: description,
                    },
                  },
                ],
              }
            : undefined,
          Link: url
            ? {
                type: "url",
                url,
              }
            : undefined,
          Comment: comment
            ? {
                rich_text: [
                  {
                    text: {
                      content: comment,
                    },
                  },
                ],
              }
            : undefined,
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
    return res.end();
  } catch (error: any) {
    console.error(JSON.stringify(error));
    return res.status(500).end();
  }
};
