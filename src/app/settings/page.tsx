export const metadata = {
  title: "Settings",
  description: "Manage accounts and settings.",
};

import { UserNameForm } from "@/components/UserNameForm";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React, { FC } from "react";

interface pageProps {}
const page = async ({}: pageProps) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("sign-in");
  }
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid items-start gap-8">
        <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>

        <div className="grid gap-10">
          <UserNameForm
            user={{
              id: session.user.id,
              username: session.user.username || "",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
