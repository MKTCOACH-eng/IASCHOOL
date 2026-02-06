import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";
import { ParentDashboard } from "./_components/parent-dashboard";
import { StudentDashboard } from "./_components/student-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { id: string; role: string; schoolId: string; name: string };
  
  if (user.role === "ADMIN") {
    return <AdminDashboard userId={user.id} schoolId={user.schoolId} userName={user.name} />;
  }
  
  if (user.role === "ALUMNO") {
    return <StudentDashboard />;
  }
  
  // PADRE, PROFESOR, VOCAL
  return <ParentDashboard userId={user.id} schoolId={user.schoolId} userName={user.name} />;
}
