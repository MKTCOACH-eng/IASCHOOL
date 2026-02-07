import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { onboardingCompleted: true }
    });
    
    return NextResponse.json({ 
      onboardingCompleted: user?.onboardingCompleted || false 
    });
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const { completed } = await request.json();
    
    await db.user.update({
      where: { id: (session.user as any).id },
      data: { onboardingCompleted: completed }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
