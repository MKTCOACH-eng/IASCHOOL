import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);

    return NextResponse.json({ items: cartItems, total });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { productId, quantity = 1, size, color } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Producto requerido" }, { status: 400 });
    }

    // Check if product exists and has stock
    const product = await db.storeProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
    }

    // Check if item already in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        size: size || null,
        color: color || null
      }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: { include: { category: true } } }
      });
    } else {
      cartItem = await db.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          size,
          color
        },
        include: { product: { include: { category: true } } }
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { id, quantity } = await req.json();

    if (!id || quantity === undefined) {
      return NextResponse.json({ error: "ID y cantidad requeridos" }, { status: 400 });
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id } });
      return NextResponse.json({ deleted: true });
    }

    const cartItem = await db.cartItem.update({
      where: { id, userId: user.id },
      data: { quantity },
      include: { product: { include: { category: true } } }
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await db.cartItem.delete({ where: { id, userId: user.id } });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({ where: { userId: user.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
