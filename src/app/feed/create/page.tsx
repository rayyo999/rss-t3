import { getServerAuthSession } from "~/server/auth";
import { FeedCreateForm } from "./_components/feed-create-form";

export default async function CreateFeedPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        Login First
      </div>
    );
  }

  return (
    <main className="drak:from-[#2e026d] drak:to-[#15162c] drak:text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <FeedCreateForm />
      </div>
    </main>
  );
}
