import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - List all schools
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // active, inactive, all
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          settings: true,
          _count: {
            select: {
              users: true,
              students: true,
              groups: true,
              announcements: true,
              documents: true
            }
          }
        }
      }),
      prisma.school.count({ where })
    ]);

    return NextResponse.json({
      schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Error al obtener escuelas" },
      { status: 500 }
    );
  }
}

// POST - Create a new school
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, code, email, phone, address, website, description, primaryColor, secondaryColor, logoUrl } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nombre y código son requeridos" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingSchool = await prisma.school.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: "El código de escuela ya existe" },
        { status: 400 }
      );
    }

    // Create school with settings
    const school = await prisma.school.create({
      data: {
        name,
        code: code.toUpperCase(),
        email,
        phone,
        address,
        website,
        description,
        primaryColor: primaryColor || "#1B4079",
        secondaryColor: secondaryColor || "#CBDF90",
        logoUrl,
        settings: {
          create: {
            planType: "standard"
          }
        }
      },
      include: {
        settings: true
      }
    });

    // Create audit log
    await prisma.systemAuditLog.create({
      data: {
        action: "CREATE_SCHOOL",
        entityType: "School",
        entityId: school.id,
        userId: (session.user as any).id,
        userEmail: session.user.email || undefined,
        details: JSON.stringify({ schoolName: name, schoolCode: code })
      }
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Error al crear escuela" },
      { status: 500 }
    );
  }
}
