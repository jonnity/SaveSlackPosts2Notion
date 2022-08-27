import { JSDOM } from "jsdom";
import * as https from "https";

export const getMetaData = async (url: string): Promise<Metadata> => {
  const body = await getHTMLHeadFromUrl(url);
  const dom = new JSDOM(body);
  let metadata: Metadata = {};

  ogKeys.forEach((key) => {
    try {
      const content = dom.window.document
        .querySelector(`meta[property='og:${snakeCase(key)}']`)
        ?.getAttribute("content");

      metadata[key] = content !== null ? content : undefined;
    } catch {
      // noop
    }
  });

  return metadata;
};

const getHTMLHeadFromUrl = (url: string): Promise<string> => {
  const closeHeadTagReg = /\<\/head\>|\<\/HEAD\>/;
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          body += chunk;
          if (body.split(closeHeadTagReg).length > 1) {
            body = body.split(closeHeadTagReg)[0];
            resolve(body);
          }
        });
      })
      .on("error", reject);
  });
};

export const ogKeys = [
  "title",
  "description",
  "image",
  "type",
  "siteName",
  "url",
] as const;

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
export type Metadata = {
  [k in ArrayElement<typeof ogKeys>]?: string;
};
const snakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, function (s) {
    return "_" + s.charAt(0).toLowerCase();
  });
};
