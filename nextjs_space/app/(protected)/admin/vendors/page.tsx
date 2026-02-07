'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Store,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ShoppingCart,
  Loader2,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  commissionRate: number;
  chargesEnabled: boolean;
  owner: { id: string; name: string; email: string };
  approvedBy: { name: string } | null;
  _count: { products: number; orders: number };
  createdAt: string;
}

export default function VendorsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    type: 'STORE',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    commissionRate: 10
  });

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchVendors();
      }
    }
  }, [status, statusFilter, typeFilter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const res = await fetch(`/api/vendors?${params}`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async () => {
    if (!newVendor.name || !newVendor.contactName || !newVendor.contactEmail) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Proveedor creado exitosamente');
        setShowCreateDialog(false);
        setNewVendor({
          name: '',
          type: 'STORE',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          commissionRate: 10
        });
        fetchVendors();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al crear proveedor');
    } finally {
      setCreating(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Proveedor ${newStatus === 'APPROVED' ? 'aprobado' : 'actualizado'}`);
        fetchVendors();
      }
    } catch (error) {
      toast.error('Error al actualizar proveedor');
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="h-3 w-3" /> Aprobado</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="h-3 w-3" /> Pendiente</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle className="h-3 w-3" /> Suspendido</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">Gestiona los proveedores autorizados de la tienda y comedor</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Proveedor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nombre del Proveedor *</Label>
                <Input
                  value={newVendor.name}
                  onChange={e => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Uniformes Express"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={newVendor.type} onValueChange={v => setNewVendor(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STORE">Tienda Escolar</SelectItem>
                    <SelectItem value="CAFETERIA">Comedor</SelectItem>
                    <SelectItem value="BOTH">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nombre de Contacto *</Label>
                <Input
                  value={newVendor.contactName}
                  onChange={e => setNewVendor(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Nombre del responsable"
                />
              </div>
              <div>
                <Label>Email de Contacto *</Label>
                <Input
                  type="email"
                  value={newVendor.contactEmail}
                  onChange={e => setNewVendor(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="proveedor@email.com"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={newVendor.contactPhone}
                  onChange={e => setNewVendor(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="55 1234 5678"
                />
              </div>
              <div>
                <Label>Comisión (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newVendor.commissionRate}
                  onChange={e => setNewVendor(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <Button className="w-full" onClick={createVendor} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Crear Proveedor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="APPROVED">Aprobado</SelectItem>
            <SelectItem value="SUSPENDED">Suspendido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="STORE">Tienda</SelectItem>
            <SelectItem value="CAFETERIA">Comedor</SelectItem>
            <SelectItem value="BOTH">Ambos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-gray-500">Total Proveedores</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.status === 'APPROVED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Productos</p>
                <p className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + v._count.products, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Pedidos</p>
                <p className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + v._count.orders, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Proveedores */}
      <Card>
        <CardContent className="p-0">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay proveedores registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Proveedor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Productos</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Pedidos</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Comisión</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.contactEmail}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {vendor.type === 'STORE' ? 'Tienda' : vendor.type === 'CAFETERIA' ? 'Comedor' : 'Ambos'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {statusBadge(vendor.status)}
                      </td>
                      <td className="px-4 py-4 text-center">{vendor._count.products}</td>
                      <td className="px-4 py-4 text-center">{vendor._count.orders}</td>
                      <td className="px-4 py-4 text-center">{vendor.commissionRate}%</td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/vendors/${vendor.id}`)}>
                              <Edit className="h-4 w-4 mr-2" /> Ver Detalles
                            </DropdownMenuItem>
                            {vendor.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Aprobar
                              </DropdownMenuItem>
                            )}
                            {vendor.status === 'APPROVED' && (
                              <DropdownMenuItem onClick={() => updateVendorStatus(vendor.id, 'SUSPENDED')}>
                                <XCircle className="h-4 w-4 mr-2" /> Suspender
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
