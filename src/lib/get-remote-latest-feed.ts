import type { ISODateString } from "next-auth";
import RSSParser from "rss-parser";

import { feedCreateSchema } from "~/server/api/schema/feed";

export async function getRemoteLatestFeed(url: string) {
  try {
    const urlSchema = feedCreateSchema.shape.url;
    const parsedUrl = urlSchema.safeParse(url);

    if (!parsedUrl.success) {
      throw new Error("Invalid URL provided", {
        cause: parsedUrl.error,
      });
    }

    const feed = await new RSSParser().parseURL(url);

    if (!feed) {
      throw new Error("Failed to get remote latest feed", {
        cause: "No feed found",
      });
    }

    // check feeds length
    if (feed.items.length === 0) {
      return null;
    }
    if (feed.items.length === 1) {
      return feed.items[0];
    }

    // check the first and second to see if order is ascending or descending
    const firstItemTimestamp: ISODateString | undefined =
      feed.items[0]?.isoDate;
    const secondItemTimestamp: ISODateString | undefined =
      feed.items[1]?.isoDate;

    if (!firstItemTimestamp || !secondItemTimestamp) {
      throw new Error("Failed to get remote latest feed", {
        cause: "No timestamps found in feed items",
      });
    }

    const isAscendingOrder =
      new Date(firstItemTimestamp) < new Date(secondItemTimestamp);

    if (isAscendingOrder) {
      return feed.items[feed.items.length - 1];
    }
    return feed.items[0];
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid URL provided") {
      throw error; // Re-throw specific error
    }
    console.error(error);
    throw new Error("Failed to get remote latest feed", { cause: error });
  }
}

//template
// {
//   "items": [
//     {
//       "creator": "Elizabeth Lola",
//       "title": "How to Use HTML Attributes to Make Your Websites and Apps More Accessible",
//       "link": "https://www.freecodecamp.org/news/how-to-use-html-attributes-to-make-your-websites-and-apps-more-accessible/",
//       "pubDate": "Fri, 06 Sep 2024 20:04:11 +0000",
//       "content:encoded": "Have you ever used an attribute in HTML without fully understanding its purpose? You're not alone! Over time, I've dug into the meaning behind many HTML attributes, especially those that are crucial for accessibility. In this in-depth tutorial, I'll ...",
//       "content:encodedSnippet": "Have you ever used an attribute in HTML without fully understanding its purpose? You're not alone! Over time, I've dug into the meaning behind many HTML attributes, especially those that are crucial for accessibility. In this in-depth tutorial, I'll ...",
//       "dc:creator": "Elizabeth Lola",
//       "content": "Have you ever used an attribute in HTML without fully understanding its purpose? You're not alone! Over time, I've dug into the meaning behind many HTML attributes, especially those that are crucial for accessibility. In this in-depth tutorial, I'll ...",
//       "contentSnippet": "Have you ever used an attribute in HTML without fully understanding its purpose? You're not alone! Over time, I've dug into the meaning behind many HTML attributes, especially those that are crucial for accessibility. In this in-depth tutorial, I'll ...",
//       "guid": {},
//       "categories": [],
//       "isoDate": "2024-09-06T20:04:11.000Z"
//     },
//     {
//       "creator": "Oduah Chigozie",
//       "title": "What are Lifetimes in Rust? Explained with Code Examples",
//       "link": "https://www.freecodecamp.org/news/what-are-lifetimes-in-rust-explained-with-code-examples/",
//       "pubDate": "Fri, 06 Sep 2024 20:03:57 +0000",
//       "content:encoded": "Lifetimes are fundamental mechanisms in Rust. There's a very high chance you'll need to work with lifetimes in any Rust project that has any sort of complexity. Even though they are important to Rust projects, lifetimes can be quite tricky to wrap yo...",
//       "content:encodedSnippet": "Lifetimes are fundamental mechanisms in Rust. There's a very high chance you'll need to work with lifetimes in any Rust project that has any sort of complexity. Even though they are important to Rust projects, lifetimes can be quite tricky to wrap yo...",
//       "dc:creator": "Oduah Chigozie",
//       "content": "Lifetimes are fundamental mechanisms in Rust. There's a very high chance you'll need to work with lifetimes in any Rust project that has any sort of complexity. Even though they are important to Rust projects, lifetimes can be quite tricky to wrap yo...",
//       "contentSnippet": "Lifetimes are fundamental mechanisms in Rust. There's a very high chance you'll need to work with lifetimes in any Rust project that has any sort of complexity. Even though they are important to Rust projects, lifetimes can be quite tricky to wrap yo...",
//       "guid": {},
//       "categories": [],
//       "isoDate": "2024-09-06T20:03:57.000Z"
//     }
//   ],
//   "feedUrl": "https://www.freecodecamp.org/news/",
//   "image": {
//     "link": "https://www.freecodecamp.org/news/",
//     "url": "https://cdn.freecodecamp.org/universal/favicons/favicon.png",
//     "title": "freeCodeCamp Programming Tutorials: Python, JavaScript, Git & More"
//   },
//   "paginationLinks": {
//     "self": "https://www.freecodecamp.org/news/"
//   },
//   "title": "freeCodeCamp.org",
//   "description": "Browse thousands of programming tutorials written by experts. Learn Web Development, Data Science, DevOps, Security, and get developer career advice.",
//   "generator": "Eleventy",
//   "link": "https://www.freecodecamp.org/news/",
//   "lastBuildDate": "Sat, 07 Sep 2024 09:33:15 +0000",
//   "ttl": "60"
// }
