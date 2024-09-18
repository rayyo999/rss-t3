import { NextResponse } from "next/server";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

// Schedule the cron job when the server starts
// cron.schedule("1 * * * *", () => {
//   console.log("Cron job triggered at midnight!");
//   // Add your logic here, like fetching data or processing tasks
// });

// This API route can still be used for manual triggering
// handle authentication at the caller level
export async function GET(request: Request) {
  const caller = createCaller(
    await createTRPCContext({
      headers: request.headers,
    }),
  );

  const feed = await caller.feed.compareAndNotify();

  return new NextResponse(JSON.stringify(feed), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
