import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { USER_ROLE } from "~/types/user-role";
import { UserSettingForm } from "./_components/user-setting-form";

export default async function UserPage({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        Login First
      </div>
    );
  }

  if (session.user.role !== USER_ROLE.Values.admin) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        You are not authorized to access this page
      </div>
    );
  }

  void api.user.getById.prefetch({ id: params.id });

  return (
    <main className="drak:from-[#2e026d] drak:to-[#15162c] drak:text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="container mx-auto py-10">
          <h1 className="mb-4 text-xl font-bold">Update User Settings</h1>
          <UserSettingForm id={params.id} />
        </div>
      </div>
    </main>
  );
}
