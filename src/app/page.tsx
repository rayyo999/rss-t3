import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="drak:from-[#2e026d] drak:to-[#15162c] drak:text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div>{!session && <>Login First</>}</div>
        </div>
      </main>
    </HydrateClient>
  );
}
