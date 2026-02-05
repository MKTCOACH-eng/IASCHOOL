import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { NewAnnouncementForm } from "./_components/new-announcement-form";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  
  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <NewAnnouncementForm />;
}
