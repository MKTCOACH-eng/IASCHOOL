import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";
import { ParentDashboard } from "./_components/parent-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const isAdmin = user?.role === "ADMIN";

  return isAdmin ? (
    <AdminDashboard userId={user?.id} schoolId={user?.schoolId} userName={user?.name} />
  ) : (
    <ParentDashboard userId={user?.id} schoolId={user?.schoolId} userName={user?.name} />
  );
}
