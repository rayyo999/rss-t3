import dynamic from "next/dynamic";

import { getServerAuthSession } from "~/server/auth";
import { USER_ROLE } from "~/types/user-role";

const UserList = dynamic(() => import("./_components/user-list"), {
  suspense: true,
});

export default async function ConsolePage() {
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

  return (
    <main className="drak:from-[#2e026d] drak:to-[#15162c] drak:text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="container mx-auto py-10">
          <UserList />
        </div>
      </div>
    </main>
  );
}
