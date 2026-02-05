import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    name?: string;
    role?: string;
    schoolName?: string;
  };

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header 
          user={{
            name: user?.name,
            role: user?.role,
            schoolName: user?.schoolName,
          }} 
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
