"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ShoppingBag, ShoppingCart, Plus, Minus, Trash2, Package, Search,
  Loader2, Tag, ChevronRight, X, CreditCard, Clock, CheckCircle,
  Settings, ImageIcon, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  sizes: string[];
  colors: string[];
  isRequired: boolean;
  category: Category;
}

interface CartItem {
  id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: Product;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: { quantity: number; unitPrice: number; size?: string; color?: string; product: Product }[];
  user?: { name: string; email: string };
}

type TabType = "catalog" | "cart" | "orders" | "admin";

export default function StorePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({ items: [], total: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  
  // Admin forms
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", categoryId: "", stock: "0", sizes: "", colors: "", isRequired: false
  });
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("spei");
  const [checkingOut, setCheckingOut] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, cartRes, ordersRes] = await Promise.all([
        fetch("/api/store/categories"),
        fetch("/api/store/products"),
        fetch("/api/store/cart"),
        fetch("/api/store/orders")
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (cartRes.ok) setCart(await cartRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = !selectedCategory || p.category.id === selectedCategory;
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = async (product: Product) => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Selecciona una talla");
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Selecciona un color");
      return;
    }

    setAddingToCart(product.id);
    try {
      const res = await fetch("/api/store/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null
        })
      });

      if (res.ok) {
        toast.success("Agregado al carrito");
        setShowProductModal(false);
        setSelectedProduct(null);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al agregar");
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const updateCartQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const res = await fetch("/api/store/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, quantity: newQuantity })
      });
      if (res.ok) fetchData();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/store/cart?id=${itemId}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: checkoutPaymentMethod })
      });

      if (res.ok) {
        const order = await res.json();
        toast.success(`Pedido ${order.orderNumber} creado`);
        setShowCheckoutModal(false);
        setActiveTab("orders");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al crear pedido");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const createCategory = async () => {
    if (!categoryForm.name) {
      toast.error("Nombre requerido");
      return;
    }
    try {
      const res = await fetch("/api/store/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        toast.success("Categor\u00eda creada");
        setShowCategoryModal(false);
        setCategoryForm({ name: "", description: "" });
        fetchData();
      }
    } catch (error) {
      toast.error("Error al crear");
    }
  };

  const createProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error("Completa los campos requeridos");
      return;
    }
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          sizes: productForm.sizes ? productForm.sizes.split(",").map(s => s.trim()) : [],
          colors: productForm.colors ? productForm.colors.split(",").map(c => c.trim()) : []
        })
      });
      if (res.ok) {
        toast.success("Producto creado");
        setShowProductForm(false);
        setProductForm({ name: "", description: "", price: "", categoryId: "", stock: "0", sizes: "", colors: "", isRequired: false });
        fetchData();
      }
    } catch (error) {
      toast.error("Error al crear");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status })
      });
      if (res.ok) {
        toast.success("Estado actualizado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PAID: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      READY: "bg-green-100 text-green-700",
      DELIVERED: "bg-gray-100 text-gray-700",
      CANCELLED: "bg-red-100 text-red-700"
    };
    const labels: Record<string, string> = {
      PENDING: "Pendiente", PAID: "Pagado", PROCESSING: "En preparaci\u00f3n",
      READY: "Listo", DELIVERED: "Entregado", CANCELLED: "Cancelado"
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4079]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#1B4079]" />
            {t.nav.store || "Tienda Escolar"}
          </h1>
          <p className="text-gray-500 mt-1">Uniformes, libros y materiales</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("cart")}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {cart.items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "catalog", label: "Cat\u00e1logo", icon: Package },
          { key: "cart", label: `Carrito (${cart.items.length})`, icon: ShoppingCart },
          { key: "orders", label: "Mis Pedidos", icon: Tag },
          ...(isAdmin ? [{ key: "admin", label: "Administrar", icon: Settings }] : [])
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#1B4079] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Catalog Tab */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory || ""}
              onChange={e => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4079]/20"
            >
              <option value="">Todas las categor\u00edas</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat._count.products})</option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No hay productos disponibles
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowProductModal(true);
                  }}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {product.isRequired && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Obligatorio
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Agotado</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#1B4079]">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{product.stock} disponibles</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <div className="space-y-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tu carrito est\u00e1 vac\u00edo</p>
              <Button onClick={() => setActiveTab("catalog")} className="mt-4 bg-[#1B4079] hover:bg-[#4D7C8A]">
                Ver Cat\u00e1logo
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y">
                {cart.items.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg relative flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <div className="text-sm text-gray-500 flex gap-2">
                        {item.size && <span>Talla: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <p className="text-[#1B4079] font-semibold">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-gray-900 w-24 text-right">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between text-lg font-semibold mb-4">
                  <span>Total</span>
                  <span className="text-[#1B4079]">${cart.total.toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full bg-[#1B4079] hover:bg-[#4D7C8A]"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceder al Pago
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes pedidos a\u00fan</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} - {order.items.length} productos
                    </p>
                    {isAdmin && order.user && (
                      <p className="text-sm text-gray-600">{order.user.name} ({order.user.email})</p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-bold text-[#1B4079] mt-1">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.product.name}
                        {item.size && ` (${item.size})`}
                        {item.color && ` - ${item.color}`}
                      </span>
                      <span className="text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {isAdmin && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <div className="p-4 bg-gray-50 border-t flex gap-2">
                    {order.status === 'PENDING' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'PAID')} className="bg-blue-600 hover:bg-blue-700">Marcar Pagado</Button>
                    )}
                    {order.status === 'PAID' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'PROCESSING')} className="bg-purple-600 hover:bg-purple-700">En Preparaci\u00f3n</Button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'READY')} className="bg-green-600 hover:bg-green-700">Listo para Entrega</Button>
                    )}
                    {order.status === 'READY' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="bg-gray-600 hover:bg-gray-700">Entregado</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-red-600 border-red-200 hover:bg-red-50">Cancelar</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          {/* Categories Management */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Categor\u00edas</h3>
              <Button onClick={() => setShowCategoryModal(true)} size="sm" className="bg-[#1B4079] hover:bg-[#4D7C8A]">
                <Plus className="w-4 h-4 mr-1" /> Nueva
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-sm text-gray-500">{cat._count.products} productos</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Management */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Productos</h3>
              <Button onClick={() => setShowProductForm(true)} size="sm" className="bg-[#1B4079] hover:bg-[#4D7C8A]">
                <Plus className="w-4 h-4 mr-1" /> Nuevo Producto
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Categor\u00eda</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td className="px-4 py-3 font-medium">{prod.name}</td>
                      <td className="px-4 py-3 text-gray-600">{prod.category.name}</td>
                      <td className="px-4 py-3">${prod.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={prod.stock > 0 ? "text-green-600" : "text-red-600"}>
                          {prod.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="aspect-square bg-gray-100 relative">
              {selectedProduct.imageUrl ? (
                <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <button onClick={() => { setShowProductModal(false); setSelectedProduct(null); }} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">{selectedProduct.category.name}</p>
                <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
              </div>
              {selectedProduct.description && (
                <p className="text-gray-600">{selectedProduct.description}</p>
              )}
              <p className="text-2xl font-bold text-[#1B4079]">${selectedProduct.price.toFixed(2)}</p>
              
              {selectedProduct.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? "border-[#1B4079] bg-[#1B4079]/10 text-[#1B4079]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedColor === color
                            ? "border-[#1B4079] bg-[#1B4079]/10 text-[#1B4079]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => addToCart(selectedProduct)}
                disabled={selectedProduct.stock === 0 || addingToCart === selectedProduct.id}
                className="w-full bg-[#1B4079] hover:bg-[#4D7C8A]"
              >
                {addingToCart === selectedProduct.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                Agregar al Carrito
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold">Finalizar Pedido</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">M\u00e9todo de Pago</label>
                <div className="space-y-2">
                  {[
                    { value: "spei", label: "Transferencia SPEI", icon: DollarSign },
                    { value: "cash", label: "Efectivo en caja", icon: CreditCard }
                  ].map(method => (
                    <label key={method.value} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      checkoutPaymentMethod === method.value ? "border-[#1B4079] bg-[#1B4079]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={checkoutPaymentMethod === method.value}
                        onChange={e => setCheckoutPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <method.icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#1B4079]">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowCheckoutModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={checkout} disabled={checkingOut} className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]">
                {checkingOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Confirmar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b"><h3 className="text-lg font-semibold">Nueva Categor\u00eda</h3></div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Ej: Uniformes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripci\u00f3n</label>
                <Input value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Descripci\u00f3n opcional" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={createCategory} className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]">Crear</Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b"><h3 className="text-lg font-semibold">Nuevo Producto</h3></div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Nombre del producto" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categor\u00eda *</label>
                <select
                  value={productForm.categoryId}
                  onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Selecciona categor\u00eda</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <Input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <Input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripci\u00f3n</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="Descripci\u00f3n del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tallas (separadas por coma)</label>
                <Input value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colores (separados por coma)</label>
                <Input value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} placeholder="Azul, Blanco, Rojo" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={productForm.isRequired} onChange={e => setProductForm({...productForm, isRequired: e.target.checked})} className="rounded" />
                <span className="text-sm">Es uniforme obligatorio</span>
              </label>
            </div>
            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowProductForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={createProduct} className="flex-1 bg-[#1B4079] hover:bg-[#4D7C8A]">Crear Producto</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
