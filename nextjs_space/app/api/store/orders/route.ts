import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = user.role === "ADMIN" 
      ? { schoolId: user.schoolId }
      : { userId: user.id };

    if (status) where.status = status;

    const orders = await db.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
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
    const { paymentMethod, notes } = await req.json();

    // Get cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal; // Could add discounts here

    // Create order with items in transaction
    const order = await db.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          schoolId: user.schoolId,
          subtotal,
          total,
          paymentMethod,
          notes,
          status: paymentMethod === 'cash' ? 'PENDING' : 'PENDING'
        }
      });

      // Create order items and update stock
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            size: item.size,
            color: item.color
          }
        });

        // Update product stock
        await tx.storeProduct.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    // Fetch complete order
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(completeOrder);
  } catch (error) {
    console.error("Error creating order:", error);
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const { id, status, deliveryDate, paymentReference } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'PAID') updateData.paidAt = new Date();
      if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    }
    if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);
    if (paymentReference) updateData.paymentReference = paymentReference;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
