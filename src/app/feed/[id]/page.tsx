import { Suspense } from "react";
import { api } from "~/trpc/server";
import { FeedUpdateForm } from "./_components/feed-update-form";
import { FeedUpdateFormSkeleton } from "./_components/feed-update-form-skeleton";

export default async function EditFeedPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto max-w-96 p-4">
      <h1 className="mb-4 text-2xl font-bold">Edit Feed</h1>
      <Suspense fallback={<FeedUpdateFormSkeleton />}>
        <FeedEditFormContent id={params.id} />
      </Suspense>
    </div>
  );
}

async function FeedEditFormContent({ id }: { id: string }) {
  const feed = await api.feed.getById({ id });

  if (!feed) {
    return <div>Feed not found</div>;
  }

  return <FeedUpdateForm feed={feed} />;
}
