import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminAnnouncementsList } from "./_components/admin-announcements-list";
import { ParentAnnouncementsList } from "./_components/parent-announcements-list";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const isAdmin = user?.role === "ADMIN";

  return isAdmin ? (
    <AdminAnnouncementsList />
  ) : (
    <ParentAnnouncementsList userId={user?.id} />
  );
}
