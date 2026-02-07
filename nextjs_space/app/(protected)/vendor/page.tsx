'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface VendorData {
  id: string;
  name: string;
  status: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  stripeAccountId: string | null;
  _count: { products: number; orders: number };
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function VendorDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchVendorData();
    }
  }, [status]);

  const fetchVendorData = async () => {
    try {
      // Obtener el vendor del usuario actual
      const res = await fetch('/api/vendors?ownerId=me');
      const vendors = await res.json();

      if (vendors.length === 0) {
        setLoading(false);
        return;
      }

      const myVendor = vendors[0];
      setVendor(myVendor);

      // Obtener pedidos del vendor
      const ordersRes = await fetch(`/api/vendors/${myVendor.id}/orders`);
      const ordersData = await ordersRes.json();

      if (ordersRes.ok) {
        setOrderStats(ordersData.stats);
        setRecentOrders(ordersData.orders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <Store className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No tienes un perfil de proveedor</h2>
            <p className="text-gray-600 mb-4">
              Contacta al administrador del colegio para ser registrado como proveedor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {vendor.status === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <CheckCircle className="h-3 w-3" /> Activo
              </span>
            ) : vendor.status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                <Clock className="h-3 w-3" /> Pendiente de Aprobación
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                <AlertCircle className="h-3 w-3" /> Suspendido
              </span>
            )}
          </div>
        </div>
        <Link href="/vendor/products">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Alertas */}
      {vendor.status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Aprobación Pendiente</h3>
              <p className="text-sm text-yellow-700">Tu perfil está en revisión. Una vez aprobado podrás comenzar a vender.</p>
            </div>
          </div>
        </div>
      )}

      {!vendor.stripeAccountId && vendor.status === 'APPROVED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Configura tu Cuenta de Pagos</h3>
              <p className="text-sm text-blue-700 mb-2">Conecta tu cuenta de Stripe para recibir pagos directos.</p>
              <Button size="sm" variant="outline">
                Configurar Stripe
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Productos</p>
                <p className="text-2xl font-bold">{vendor._count.products}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedidos</p>
                <p className="text-2xl font-bold">{orderStats?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold">{orderStats?.pendingOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-2xl font-bold">${orderStats?.totalRevenue.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/vendor/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <Package className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">Mis Productos</h3>
              <p className="text-sm text-gray-500">Gestiona tu catálogo de productos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vendor/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <ShoppingCart className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">Pedidos</h3>
              <p className="text-sm text-gray-500">Revisa y procesa tus pedidos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vendor/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">Reportes</h3>
              <p className="text-sm text-gray-500">Analiza tus ventas y desempeño</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Los últimos pedidos de tus productos</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no tienes pedidos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customer?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${Number(order.total).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
